import axios from "axios";

const webhookUrl = "http://localhost:4000/webhook/setu";

async function runSimulation() {
  console.log("=== Starting Setu Webhook Handler Simulation ===");

  // 1. Simulate Consent Approved Webhook
  console.log("\n--- Sending Consent Approved Notification ---");
  const consentPayload = {
    consentId: "con_8c72803b-d102-4b2a-89a1-77890fbc982a",
    status: "ACTIVE",
    data: {
      status: "ACTIVE",
      detail: {
        accounts: [
          {
            maskedAccNumber: "XXXXXX4567",
            accType: "SAVINGS",
            fipId: "FIP-HDFC-BANK"
          }
        ]
      }
    }
  };

  try {
    const res1 = await axios.post(webhookUrl, consentPayload);
    console.log("Response from Webhook Endpoint (Consent Approval):", res1.status, res1.data);
  } catch (err: any) {
    console.error("Failed to send consent approved webhook:", err.message);
  }

  // Wait a moment for any mock timeout triggers to finish in the server
  await new Promise((resolve) => setTimeout(resolve, 1500));

  // 2. Simulate FI Data Session Completed Webhook
  console.log("\n--- Sending Session Completed Notification ---");
  const sessionPayload = {
    type: "SESSION_STATUS_UPDATE",
    timestamp: new Date().toISOString(),
    consentId: "con_8c72803b-d102-4b2a-89a1-77890fbc982a",
    dataSessionId: "sess_4f89d31a-641e-450f-a9cb-bb2654fca28c",
    success: true,
    error: null,
    data: {
      status: "COMPLETED",
      fips: [
        {
          fipID: "FIP-HDFC-BANK",
          accounts: [
            {
              linkRefNumber: "REF-HDFC-SAVINGS-4567",
              FIStatus: "READY",
              description: "Data ready for fetch"
            }
          ]
        }
      ],
      format: "json"
    }
  };

  try {
    const res2 = await axios.post(webhookUrl, sessionPayload);
    console.log("Response from Webhook Endpoint (Session Completed):", res2.status, res2.data);
  } catch (err: any) {
    console.error("Failed to send session completed webhook:", err.message);
  }

  console.log("\n=== Webhook Simulation Script Finished ===");
}

// Small delay before running to make sure server is up if run jointly
setTimeout(runSimulation, 500);
