import { SetuClient } from "../services/setuClient.js";

async function main() {
  console.log("=== Testing SetuClient Integration ===");
  const client = new SetuClient();

  // Test Consent Creation
  console.log("\n--- Testing Consent Creation ---");
  const consent = await client.createConsent("9999999999@setu");
  console.log("Consent Response:", JSON.stringify(consent, null, 2));

  if (!consent || !consent.id) {
    throw new Error("Failed to get consent ID");
  }

  // Test Consent Status
  console.log("\n--- Testing Consent Status ---");
  const status = await client.getConsentStatus(consent.id);
  console.log("Consent Status:", JSON.stringify(status, null, 2));

  // Test Session Creation
  console.log("\n--- Testing Session Creation ---");
  const session = await client.createDataSession(consent.id);
  console.log("Session Response:", JSON.stringify(session, null, 2));

  if (!session || !session.id) {
    throw new Error("Failed to get session ID");
  }

  // Test Session Data Fetching
  console.log("\n--- Testing Session Data Fetch ---");
  const data = await client.fetchSessionData(session.id);
  console.log("Fetch Response Data Status:", data.status);
  console.log("Number of FIP accounts found:", data.data?.length);
  if (data.data && data.data[0]) {
    const acc = data.data[0].data[0].decrypted;
    console.log(`Account details: MaskedAcc=${acc.maskedAccNumber}, FipId=${acc.fipId}, Type=${acc.type}`);
    console.log(`Transactions fetched: ${acc.transactions.transaction.length}`);
    console.log("Sample transaction:", JSON.stringify(acc.transactions.transaction[0], null, 2));
  }

  console.log("\n=== SetuClient Integration Test Success ===");
}

main().catch((err) => {
  console.error("Test failed with error:", err);
  process.exit(1);
});
