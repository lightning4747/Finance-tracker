import { db } from "../db/index.js";
import { sql } from "drizzle-orm";

async function run() {
  console.log("Testing tag query...");
  try {
    const query = sql`
      SELECT json_each.value AS tag, SUM(transactions.amount) AS total
      FROM transactions, json_each(transactions.tags)
      WHERE transactions.type = 'DEBIT' AND transactions.is_outlier = 0
      GROUP BY tag
      ORDER BY total DESC
    `;
    const result = await db.all(query);
    console.log("Tag query success:", result);
  } catch (err: any) {
    console.error("Tag query error:", err.message);
  }

  console.log("Testing top tag query...");
  try {
    const query = sql`
      SELECT json_each.value AS tag, SUM(transactions.amount) AS total
      FROM transactions, json_each(transactions.tags)
      WHERE transactions.type = 'DEBIT' AND transactions.is_outlier = 0
      GROUP BY tag
      ORDER BY total DESC
      LIMIT 1
    `;
    const result = await db.all(query);
    console.log("Top tag query success:", result);
  } catch (err: any) {
    console.error("Top tag query error:", err.message);
  }
}

run().catch(console.error);
