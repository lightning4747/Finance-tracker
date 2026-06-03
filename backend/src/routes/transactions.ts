import { Router } from "express";
import { eq, and, gte, lte, desc, sql } from "drizzle-orm";
import { db } from "../db/index.js";
import { transactions } from "../db/schema.js";

const router = Router();

// GET /api/transactions - List all transactions with optional filters
router.get("/", async (req, res) => {
  try {
    const { startDate, endDate, type, tag, isOutlier } = req.query;

    const conditions = [];

    // Filter by date range (valueDate)
    if (startDate && endDate) {
      conditions.push(
        and(
          gte(transactions.valueDate, startDate as string),
          lte(transactions.valueDate, endDate as string)
        )
      );
    } else if (startDate) {
      conditions.push(gte(transactions.valueDate, startDate as string));
    } else if (endDate) {
      conditions.push(lte(transactions.valueDate, endDate as string));
    }

    // Filter by type (DEBIT / CREDIT)
    if (type === "DEBIT" || type === "CREDIT") {
      conditions.push(eq(transactions.type, type));
    }

    // Filter by outlier flag
    if (isOutlier !== undefined) {
      conditions.push(eq(transactions.isOutlier, isOutlier === "true"));
    }

    // Filter by tag in SQLite JSON array
    if (tag) {
      conditions.push(
        sql`exists (select 1 from json_each(${transactions.tags}) where json_each.value = ${tag as string})`
      );
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const txList = await db
      .select()
      .from(transactions)
      .where(whereClause)
      .orderBy(desc(transactions.timestamp));

    return res.json(txList);
  } catch (error: any) {
    return res.status(500).json({ error: error.message || "Failed to fetch transactions" });
  }
});

// GET /api/transactions/untagged - List untagged transactions (empty tags array)
router.get("/untagged", async (req, res) => {
  try {
    const txList = await db
      .select()
      .from(transactions)
      .where(sql`json_array_length(${transactions.tags}) = 0`)
      .orderBy(desc(transactions.timestamp));

    return res.json(txList);
  } catch (error: any) {
    return res.status(500).json({ error: error.message || "Failed to fetch untagged transactions" });
  }
});

// PATCH /api/transactions/:id/tags - Update/assign tags to a transaction
router.patch("/:id/tags", async (req, res) => {
  try {
    const { id } = req.params;
    const { tags: newTags } = req.body;

    if (!Array.isArray(newTags)) {
      return res.status(400).json({ error: "tags must be an array of strings" });
    }

    const result = await db
      .update(transactions)
      .set({ tags: newTags })
      .where(eq(transactions.id, id))
      .returning();

    if (result.length === 0) {
      return res.status(404).json({ error: "Transaction not found" });
    }

    return res.json(result[0]);
  } catch (error: any) {
    return res.status(500).json({ error: error.message || "Failed to update tags" });
  }
});

// PATCH /api/transactions/:id/outlier - Toggle outlier flag
router.patch("/:id/outlier", async (req, res) => {
  try {
    const { id } = req.params;
    const { isOutlier } = req.body;

    if (typeof isOutlier !== "boolean") {
      return res.status(400).json({ error: "isOutlier must be a boolean value" });
    }

    const result = await db
      .update(transactions)
      .set({ isOutlier })
      .where(eq(transactions.id, id))
      .returning();

    if (result.length === 0) {
      return res.status(404).json({ error: "Transaction not found" });
    }

    return res.json(result[0]);
  } catch (error: any) {
    return res.status(500).json({ error: error.message || "Failed to update outlier flag" });
  }
});

export default router;
