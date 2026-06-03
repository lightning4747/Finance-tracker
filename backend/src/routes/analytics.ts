import { Router } from "express";
import { sql } from "drizzle-orm";
import { db } from "../db/index.js";
import { transactions } from "../db/schema.js";

const router = Router();

// GET /api/analytics/by-tag - Get total spending grouped by tags (excludes outliers)
router.get("/by-tag", async (req, res) => {
  try {
    // In SQLite, we join with json_each to unpack the tags array
    const query = sql`
      SELECT json_each.value AS tag, SUM(transactions.amount) AS total
      FROM transactions, json_each(transactions.tags)
      WHERE transactions.type = 'DEBIT' AND transactions.is_outlier = 0
      GROUP BY tag
      ORDER BY total DESC
    `;

    const result = await db.all(query);
    
    // Normalize format
    const formatted = (result as any[]).map((row) => ({
      tag: String(row.tag),
      total: Number(row.total || 0),
    }));

    return res.json(formatted);
  } catch (error: any) {
    return res.status(500).json({ error: error.message || "Failed to fetch tag analytics" });
  }
});

// GET /api/analytics/monthly - Get monthly spend and income summaries (excludes outliers)
router.get("/monthly", async (req, res) => {
  try {
    const query = sql`
      SELECT strftime('%Y-%m', timestamp) AS month,
             SUM(CASE WHEN type = 'DEBIT' THEN amount ELSE 0 END) AS spent,
             SUM(CASE WHEN type = 'CREDIT' THEN amount ELSE 0 END) AS income
      FROM transactions
      WHERE is_outlier = 0
      GROUP BY month
      ORDER BY month ASC
    `;

    const result = await db.all(query);

    // Normalize format
    const formatted = (result as any[]).map((row) => ({
      month: String(row.month),
      spent: Number(row.spent || 0),
      income: Number(row.income || 0),
    }));

    return res.json(formatted);
  } catch (error: any) {
    return res.status(500).json({ error: error.message || "Failed to fetch monthly analytics" });
  }
});

// GET /api/analytics/overview - Get overall stats overview (spend, income, net, top tag, untagged count)
router.get("/overview", async (req, res) => {
  try {
    // 1. Get totals
    const totalsQuery = sql`
      SELECT 
        SUM(CASE WHEN type = 'DEBIT' THEN amount ELSE 0 END) AS totalSpend,
        SUM(CASE WHEN type = 'CREDIT' THEN amount ELSE 0 END) AS totalIncome
      FROM transactions
      WHERE is_outlier = 0
    `;
    const totalsResult = await db.all(totalsQuery) as any[];
    const totalSpend = Number(totalsResult[0]?.totalSpend || 0);
    const totalIncome = Number(totalsResult[0]?.totalIncome || 0);
    const netBalance = totalIncome - totalSpend;

    // 2. Get top tag
    const topTagQuery = sql`
      SELECT json_each.value AS tag, SUM(transactions.amount) AS total
      FROM transactions, json_each(transactions.tags)
      WHERE transactions.type = 'DEBIT' AND transactions.is_outlier = 0
      GROUP BY tag
      ORDER BY total DESC
      LIMIT 1
    `;
    const topTagResult = await db.all(topTagQuery) as any[];
    const topTag = topTagResult[0]?.tag ? String(topTagResult[0].tag) : null;

    // 3. Get untagged count
    const untaggedQuery = sql`
      SELECT COUNT(*) AS count
      FROM transactions
      WHERE json_array_length(tags) = 0
    `;
    const untaggedResult = await db.all(untaggedQuery) as any[];
    const untaggedCount = Number(untaggedResult[0]?.count || 0);

    return res.json({
      totalSpend,
      totalIncome,
      netBalance,
      topTag,
      untaggedCount,
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || "Failed to fetch overview analytics" });
  }
});

export default router;
