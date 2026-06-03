import { v4 as uuidv4 } from "uuid";
import { db } from "../db/index.js";
import { transactions, accounts } from "../db/schema.js";
import { parseNarration } from "./narrationParser.js";
import { SetuSessionFetchResponse, SetuDecryptedAccount } from "../mock/setuMockData.js";

/**
 * Normalizes and stores raw financial information fetched from Setu AA.
 */
export async function transformAndPersist(sessionData: SetuSessionFetchResponse): Promise<{
  insertedTransactionsCount: number;
  accountsProcessed: number;
}> {
  console.log(`[Transform] Starting transform and persist for session: ${sessionData.id}`);
  
  let totalInsertedTransactions = 0;
  let totalAccountsProcessed = 0;

  if (!sessionData.data || sessionData.data.length === 0) {
    console.log("[Transform] No FIP data found in session payload.");
    return { insertedTransactionsCount: 0, accountsProcessed: 0 };
  }

  // Iterate over each FIP block
  for (const fipBlock of sessionData.data) {
    const fipId = fipBlock.fipId;
    
    if (!fipBlock.data || fipBlock.data.length === 0) continue;

    // Iterate over each decrypted account in the FIP
    for (const dataItem of fipBlock.data) {
      const decryptedAcc: SetuDecryptedAccount = dataItem.decrypted;
      
      if (!decryptedAcc || decryptedAcc.type !== "deposit") {
        console.log(`[Transform] Skipping unsupported account type or missing data.`);
        continue;
      }

      totalAccountsProcessed++;
      const accountId = decryptedAcc.linkRefNumber; // Using linkRefNumber as unique account identifier / primary key
      const lastFetchedAt = new Date().toISOString();

      console.log(`[Transform] Processing account: MaskedAcc=${decryptedAcc.maskedAccNumber}, FipId=${fipId}`);

      // 1. Persist or update the bank account details
      await db
        .insert(accounts)
        .values({
          id: accountId,
          maskedAccNumber: decryptedAcc.maskedAccNumber,
          fipId: decryptedAcc.fipId || fipId,
          linkRefNumber: decryptedAcc.linkRefNumber,
          lastFetchedAt: lastFetchedAt,
        })
        .onConflictDoUpdate({
          target: accounts.id,
          set: {
            lastFetchedAt: lastFetchedAt,
          },
        });

      // 2. Process transactions
      const rawTxList = decryptedAcc.transactions?.transaction || [];
      console.log(`[Transform] Found ${rawTxList.length} raw transactions to process.`);

      for (const rawTx of rawTxList) {
        const amount = parseFloat(rawTx.amount);
        const balance = parseFloat(rawTx.currentBalance);
        
        // Parse sender & receiver from narration
        const { sender, receiver } = parseNarration(
          rawTx.narration,
          rawTx.mode,
          rawTx.type
        );

        // Map raw Setu transactions to database schema
        const newTx = {
          id: uuidv4(),
          setuTxnId: rawTx.txnId,
          amount: amount,
          type: rawTx.type,
          mode: rawTx.mode,
          narration: rawTx.narration,
          sender: sender,
          receiver: receiver,
          balance: balance,
          timestamp: rawTx.transactionTimestamp,
          valueDate: rawTx.valueDate,
          tags: [], // empty array signifies untagged state
          isOutlier: false,
          accountId: accountId,
          createdAt: new Date().toISOString(),
        };

        // Insert into database, skip if setuTxnId already exists (deduplication)
        const insertResult = await db
          .insert(transactions)
          .values(newTx)
          .onConflictDoNothing({ target: transactions.setuTxnId });

        // Since SQLite/better-sqlite3 changes are returned, if insert occurred it's added.
        // We can increment total insertions count if row was inserted.
        // Drizzle return value doesn't always contain the count for onConflictDoNothing in better-sqlite3 unless returning() is used,
        // or we check insertion. Let's append returning() to verify if it was inserted!
        // We do: .insert(transactions).values(newTx).onConflictDoNothing().returning({ id: transactions.id })
        // If length > 0, it means it was inserted.
      }

      // To check how many were actually inserted, we can run a count or use .returning().
      // Let's use returning() to properly log count of new transactions!
      let insertedCount = 0;
      for (const rawTx of rawTxList) {
        const amount = parseFloat(rawTx.amount);
        const balance = parseFloat(rawTx.currentBalance);
        const { sender, receiver } = parseNarration(rawTx.narration, rawTx.mode, rawTx.type);

        const newTx = {
          id: uuidv4(),
          setuTxnId: rawTx.txnId,
          amount: amount,
          type: rawTx.type,
          mode: rawTx.mode,
          narration: rawTx.narration,
          sender: sender,
          receiver: receiver,
          balance: balance,
          timestamp: rawTx.transactionTimestamp,
          valueDate: rawTx.valueDate,
          tags: [],
          isOutlier: false,
          accountId: accountId,
          createdAt: new Date().toISOString(),
        };

        const result = await db
          .insert(transactions)
          .values(newTx)
          .onConflictDoNothing({ target: transactions.setuTxnId })
          .returning({ id: transactions.id });

        if (result.length > 0) {
          insertedCount++;
        }
      }
      
      console.log(`[Transform] Inserted ${insertedCount} new transactions (deduplicated).`);
      totalInsertedTransactions += insertedCount;
    }
  }

  return {
    insertedTransactionsCount: totalInsertedTransactions,
    accountsProcessed: totalAccountsProcessed,
  };
}
