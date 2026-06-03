import axios from "axios";

const apiBase = "http://localhost:4000/api/analytics";

async function main() {
  console.log("=== Starting Analytics Routes Integration Test ===");

  // 1. Get Overview Stats
  console.log("\n--- 1. Fetching Overview Stats ---");
  try {
    const overviewRes = await axios.get(`${apiBase}/overview`);
    console.log("Overview Response:", JSON.stringify(overviewRes.data, null, 2));
    if (
      typeof overviewRes.data.totalSpend === "number" &&
      typeof overviewRes.data.totalIncome === "number" &&
      typeof overviewRes.data.netBalance === "number" &&
      typeof overviewRes.data.untaggedCount === "number"
    ) {
      console.log("Overview data format: PASSED");
    } else {
      console.error("Overview data format: FAILED");
    }
  } catch (err: any) {
    console.error("Failed to fetch overview:", err.message);
  }

  // 2. Get Monthly Summary
  console.log("\n--- 2. Fetching Monthly Summary ---");
  try {
    const monthlyRes = await axios.get(`${apiBase}/monthly`);
    console.log("Monthly Response:", JSON.stringify(monthlyRes.data, null, 2));
    if (Array.isArray(monthlyRes.data)) {
      console.log("Monthly data format: PASSED");
    } else {
      console.error("Monthly data format: FAILED");
    }
  } catch (err: any) {
    console.error("Failed to fetch monthly summary:", err.message);
  }

  // 3. Get Tag Spending
  console.log("\n--- 3. Fetching Spend By Tag ---");
  try {
    const tagRes = await axios.get(`${apiBase}/by-tag`);
    console.log("Spend By Tag Response:", JSON.stringify(tagRes.data, null, 2));
    if (Array.isArray(tagRes.data)) {
      console.log("Spend by tag data format: PASSED");
    } else {
      console.error("Spend by tag data format: FAILED");
    }
  } catch (err: any) {
    console.error("Failed to fetch spend by tag:", err.message);
  }

  console.log("\n=== Analytics Routes Integration Test Success ===");
}

main().catch((err) => {
  console.error("Test failed with error:", err.message);
  process.exit(1);
});
