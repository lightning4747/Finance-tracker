import axios from "axios";

const apiBase = "http://localhost:4000/api";

async function main() {
  console.log("=== Starting CRUD Routes Integration Test ===");

  // 1. Get all transactions
  console.log("\n--- 1. Fetching all transactions ---");
  const allTxRes = await axios.get(`${apiBase}/transactions`);
  console.log(`Total transactions in DB: ${allTxRes.data.length}`);
  if (allTxRes.data.length === 0) {
    console.warn("DB is empty! Run simulateWebhook.ts first before running this test.");
    process.exit(1);
  }
  const sampleTx = allTxRes.data[0];
  console.log(`Sample Transaction ID: ${sampleTx.id}, Narration: ${sampleTx.narration}`);

  // 2. Fetch untagged transactions
  console.log("\n--- 2. Fetching untagged transactions ---");
  const untaggedRes1 = await axios.get(`${apiBase}/transactions/untagged`);
  console.log(`Untagged count (initial): ${untaggedRes1.data.length}`);

  // 3. Create a tag
  console.log("\n--- 3. Creating a new tag 'Food' ---");
  const tagRes = await axios.post(`${apiBase}/tags`, {
    name: "Food",
    color: "#e11d48"
  });
  console.log("Tag Created:", JSON.stringify(tagRes.data, null, 2));
  const tagId = tagRes.data.id;
  const tagName = tagRes.data.name;

  // 4. Fetch all tags
  console.log("\n--- 4. Fetching all tags ---");
  const allTagsRes = await axios.get(`${apiBase}/tags`);
  console.log("All Tags in DB:", JSON.stringify(allTagsRes.data, null, 2));

  // 5. Assign tag to a transaction
  console.log(`\n--- 5. Assigning tag ['${tagName}'] to transaction: ${sampleTx.id} ---`);
  const assignRes = await axios.patch(`${apiBase}/transactions/${sampleTx.id}/tags`, {
    tags: [tagName]
  });
  console.log("Updated Transaction:", JSON.stringify(assignRes.data, null, 2));

  // 6. Verify untagged transactions count decreased
  console.log("\n--- 6. Re-fetching untagged transactions count ---");
  const untaggedRes2 = await axios.get(`${apiBase}/transactions/untagged`);
  console.log(`Untagged count (after tagging): ${untaggedRes2.data.length}`);
  if (untaggedRes2.data.length !== untaggedRes1.data.length - 1) {
    console.error("Untagged count did not decrease by exactly 1!");
  } else {
    console.log("Untagged count decreased successfully.");
  }

  // 7. Query transactions by tag name
  console.log(`\n--- 7. Querying transactions with tag '${tagName}' ---`);
  const filterTagRes = await axios.get(`${apiBase}/transactions?tag=${tagName}`);
  console.log(`Transactions matching tag '${tagName}': ${filterTagRes.data.length}`);
  if (filterTagRes.data.length > 0) {
    console.log("Successfully filtered by tag!");
  } else {
    console.error("Failed to filter by tag.");
  }

  // 8. Toggle outlier flag
  console.log(`\n--- 8. Toggling outlier flag for transaction ${sampleTx.id} ---`);
  const outlierRes = await axios.patch(`${apiBase}/transactions/${sampleTx.id}/outlier`, {
    isOutlier: true
  });
  console.log("Updated Outlier Flag:", outlierRes.data.isOutlier);

  // 9. Query transactions filtering by outlier
  console.log("\n--- 9. Querying outlier transactions ---");
  const outlierList = await axios.get(`${apiBase}/transactions?isOutlier=true`);
  console.log(`Total outlier transactions: ${outlierList.data.length}`);

  // Reset outlier flag for next tests
  await axios.patch(`${apiBase}/transactions/${sampleTx.id}/outlier`, {
    isOutlier: false
  });

  // 10. Delete tag and check cascade removal from transactions
  console.log(`\n--- 10. Deleting tag '${tagName}' (ID: ${tagId}) ---`);
  const deleteRes = await axios.delete(`${apiBase}/tags/${tagId}`);
  console.log("Delete Response:", JSON.stringify(deleteRes.data, null, 2));

  // 11. Verify transaction tags list is clean
  console.log("\n--- 11. Verifying transaction is untagged again ---");
  const cleanTxRes = await axios.get(`${apiBase}/transactions`);
  const cleanTx = cleanTxRes.data.find((tx: any) => tx.id === sampleTx.id);
  console.log("Transaction tags after deleting tag:", JSON.stringify(cleanTx?.tags));
  if (cleanTx && cleanTx.tags.length === 0) {
    console.log("Cascade tag cleanup verified successfully!");
  } else {
    console.error("Cascade tag cleanup FAILED!");
  }

  console.log("\n=== CRUD Routes Integration Test Success ===");
}

main().catch((err) => {
  console.error("Test failed with error:", err.message);
  if (err.response) {
    console.error("Response data:", err.response.data);
  }
  process.exit(1);
});
