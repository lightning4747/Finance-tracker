import { db } from "../db/index.js";
import { transactions, tags } from "../db/schema.js";
import { eq, sql } from "drizzle-orm";

async function main() {
  console.log("=== Seeding Mock Tags and Assigning them ===");

  // 1. Insert some tags if they don't exist
  const mockTags = [
    { id: "tag-1", name: "Food", color: "#e11d48" },
    { id: "tag-2", name: "Rent", color: "#3b82f6" },
    { id: "tag-3", name: "Salary", color: "#22c55e" },
    { id: "tag-4", name: "Entertainment", color: "#a855f7" }
  ];

  for (const tag of mockTags) {
    try {
      await db.insert(tags).values(tag).onConflictDoNothing();
      console.log(`Ensured tag exists: ${tag.name}`);
    } catch (err: any) {
      console.error(`Error inserting tag ${tag.name}:`, err.message);
    }
  }

  // 2. Fetch all transactions
  const txs = await db.select().from(transactions);
  console.log(`Fetched ${txs.length} transactions from DB.`);

  if (txs.length === 0) {
    console.error("No transactions found! Please run simulateWebhook.ts first.");
    return;
  }

  // 3. Assign tags to a few transactions
  // Let's find some DEBITs and assign Food, Rent, Entertainment
  let debitCount = 0;
  for (const tx of txs) {
    if (tx.type === "DEBIT") {
      debitCount++;
      let assignedTags: string[] = [];
      if (debitCount === 1) {
        assignedTags = ["Food"];
      } else if (debitCount === 2) {
        assignedTags = ["Rent"];
      } else if (debitCount === 3) {
        assignedTags = ["Food", "Entertainment"];
      } else if (debitCount === 4) {
        assignedTags = ["Entertainment"];
      } else {
        assignedTags = []; // Leave others untagged
      }

      await db
        .update(transactions)
        .set({ tags: assignedTags })
        .where(eq(transactions.id, tx.id));
      console.log(`Assigned tags ${JSON.stringify(assignedTags)} to transaction ${tx.id} (${tx.amount} DEBIT)`);
    } else if (tx.type === "CREDIT") {
      // Assign Salary to credit transaction
      await db
        .update(transactions)
        .set({ tags: ["Salary"] })
        .where(eq(transactions.id, tx.id));
      console.log(`Assigned tags ["Salary"] to CREDIT transaction ${tx.id} (${tx.amount} CREDIT)`);
    }
  }

  console.log("Seeding tags completed!");
}

main().catch(console.error);
