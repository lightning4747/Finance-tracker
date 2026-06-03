import { db } from "../db/index.js";
import { transactions, accounts } from "../db/schema.js";

async function main() {
  console.log("=== Checking Database Content ===");
  
  const allAccounts = await db.select().from(accounts);
  console.log(`\nAccounts (${allAccounts.length}):`);
  console.log(JSON.stringify(allAccounts, null, 2));

  const allTx = await db.select().from(transactions);
  console.log(`\nTransactions (${allTx.length}):`);
  if (allTx.length > 0) {
    console.log(`First transaction details:`);
    console.log(JSON.stringify(allTx[0], null, 2));
  }
}

main().catch(console.error);
