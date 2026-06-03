import { Router } from "express";
import { eq, sql } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import { db } from "../db/index.js";
import { tags, transactions } from "../db/schema.js";

const router = Router();

// GET /api/tags - Get list of all tags
router.get("/", async (req, res) => {
  try {
    const tagList = await db.select().from(tags);
    return res.json(tagList);
  } catch (error: any) {
    return res.status(500).json({ error: error.message || "Failed to fetch tags" });
  }
});

// POST /api/tags - Create a new tag
router.post("/", async (req, res) => {
  try {
    const { name, color } = req.body;

    if (!name || typeof name !== "string") {
      return res.status(400).json({ error: "name is required and must be a string" });
    }

    const newTag = {
      id: uuidv4(),
      name: name.trim(),
      color: color ? color.trim() : "#6366f1",
    };

    const result = await db.insert(tags).values(newTag).returning();
    return res.status(201).json(result[0]);
  } catch (error: any) {
    if (error.message && error.message.includes("UNIQUE constraint failed")) {
      return res.status(409).json({ error: "Tag name already exists" });
    }
    return res.status(500).json({ error: error.message || "Failed to create tag" });
  }
});

// DELETE /api/tags/:id - Delete a tag and remove it from all transactions
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Fetch tag details
    const tagToDelete = await db
      .select()
      .from(tags)
      .where(eq(tags.id, id))
      .then((res) => res[0]);

    if (!tagToDelete) {
      return res.status(404).json({ error: "Tag not found" });
    }

    // 2. Delete tag from tags table
    await db.delete(tags).where(eq(tags.id, id));

    // 3. Find and update transactions containing this tag
    const affectedTx = await db
      .select()
      .from(transactions)
      .where(
        sql`exists (select 1 from json_each(${transactions.tags}) where json_each.value = ${tagToDelete.name})`
      );

    console.log(`[Tags] Deleting tag "${tagToDelete.name}". Removing from ${affectedTx.length} transactions.`);

    for (const tx of affectedTx) {
      const updatedTags = tx.tags.filter((t) => t !== tagToDelete.name);
      await db
        .update(transactions)
        .set({ tags: updatedTags })
        .where(eq(transactions.id, tx.id));
    }

    return res.json({ success: true, message: `Tag "${tagToDelete.name}" deleted and removed from transactions.` });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || "Failed to delete tag" });
  }
});

export default router;
