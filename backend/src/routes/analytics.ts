import { Router } from "express";
import { sql } from "drizzle-orm";
import { db } from "../db/index.js";
import { transactions } from "../db/schema.js";

const router = Router();

// GET /api/analytics/by-tag - Get total spending grouped by tags (excludes outliers by default)
router.get("/by-tag", async (req, res) => {
  try {
    const includeOutliers = req.query.includeOutliers === "true";
    const { startDate, endDate } = req.query;

    const conditions = [sql`transactions.type = 'DEBIT'`];
    if (!includeOutliers) {
      conditions.push(sql`transactions.is_outlier = 0`);
    }
    if (startDate) {
      conditions.push(sql`transactions.value_date >= ${startDate as string}`);
    }
    if (endDate) {
      conditions.push(sql`transactions.value_date <= ${endDate as string}`);
    }

    const whereClause = sql`WHERE ${conditions[0]}`;
    let composedWhere = whereClause;
    for (let i = 1; i < conditions.length; i++) {
      composedWhere = sql`${composedWhere} AND ${conditions[i]}`;
    }

    // In SQLite, we join with json_each to unpack the tags array
    const query = sql`
      SELECT json_each.value AS tag, SUM(transactions.amount) AS total
      FROM transactions, json_each(transactions.tags)
      ${composedWhere}
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

// GET /api/analytics/monthly - Get monthly spend and income summaries (excludes outliers by default)
router.get("/monthly", async (req, res) => {
  try {
    const includeOutliers = req.query.includeOutliers === "true";
    const { startDate, endDate } = req.query;

    const conditions = [];
    if (!includeOutliers) {
      conditions.push(sql`is_outlier = 0`);
    }
    if (startDate) {
      conditions.push(sql`value_date >= ${startDate as string}`);
    }
    if (endDate) {
      conditions.push(sql`value_date <= ${endDate as string}`);
    }

    let whereClause = sql``;
    if (conditions.length > 0) {
      whereClause = sql`WHERE ${conditions[0]}`;
      for (let i = 1; i < conditions.length; i++) {
        whereClause = sql`${whereClause} AND ${conditions[i]}`;
      }
    }

    const query = sql`
      SELECT strftime('%Y-%m', timestamp) AS month,
             SUM(CASE WHEN type = 'DEBIT' THEN amount ELSE 0 END) AS spent,
             SUM(CASE WHEN type = 'CREDIT' THEN amount ELSE 0 END) AS income
      FROM transactions
      ${whereClause}
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
    const includeOutliers = req.query.includeOutliers === "true";
    const { startDate, endDate } = req.query;

    // Build main where condition for totals
    const mainConditions = [];
    if (!includeOutliers) {
      mainConditions.push(sql`is_outlier = 0`);
    }
    if (startDate) {
      mainConditions.push(sql`value_date >= ${startDate as string}`);
    }
    if (endDate) {
      mainConditions.push(sql`value_date <= ${endDate as string}`);
    }

    let mainWhere = sql``;
    if (mainConditions.length > 0) {
      mainWhere = sql`WHERE ${mainConditions[0]}`;
      for (let i = 1; i < mainConditions.length; i++) {
        mainWhere = sql`${mainWhere} AND ${mainConditions[i]}`;
      }
    }

    // Build conditions for top-tag query (which joins with json_each)
    const topTagConditions = [sql`transactions.type = 'DEBIT'`];
    if (!includeOutliers) {
      topTagConditions.push(sql`transactions.is_outlier = 0`);
    }
    if (startDate) {
      topTagConditions.push(sql`transactions.value_date >= ${startDate as string}`);
    }
    if (endDate) {
      topTagConditions.push(sql`transactions.value_date <= ${endDate as string}`);
    }

    let topTagWhere = sql`WHERE ${topTagConditions[0]}`;
    for (let i = 1; i < topTagConditions.length; i++) {
      topTagWhere = sql`${topTagWhere} AND ${topTagConditions[i]}`;
    }

    // Build conditions for untagged count
    const untaggedConditions = [sql`json_array_length(tags) = 0`];
    if (startDate) {
      untaggedConditions.push(sql`value_date >= ${startDate as string}`);
    }
    if (endDate) {
      untaggedConditions.push(sql`value_date <= ${endDate as string}`);
    }

    let untaggedWhere = sql`WHERE ${untaggedConditions[0]}`;
    for (let i = 1; i < untaggedConditions.length; i++) {
      untaggedWhere = sql`${untaggedWhere} AND ${untaggedConditions[i]}`;
    }

    // 1. Get totals
    const totalsQuery = sql`
      SELECT 
        SUM(CASE WHEN type = 'DEBIT' THEN amount ELSE 0 END) AS totalSpend,
        SUM(CASE WHEN type = 'CREDIT' THEN amount ELSE 0 END) AS totalIncome
      FROM transactions
      ${mainWhere}
    `;
    const totalsResult = await db.all(totalsQuery) as any[];
    const totalSpend = Number(totalsResult[0]?.totalSpend || 0);
    const totalIncome = Number(totalsResult[0]?.totalIncome || 0);
    const netBalance = totalIncome - totalSpend;

    // 2. Get top tag
    const topTagQuery = sql`
      SELECT json_each.value AS tag, SUM(transactions.amount) AS total
      FROM transactions, json_each(transactions.tags)
      ${topTagWhere}
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
      ${untaggedWhere}
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
