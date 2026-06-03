import { Router } from "express";
import { SetuClient } from "./services/setuClient.js";

const router = Router();
const setuClient = new SetuClient();

router.post("/", async (req, res) => {
  try {
    const payload = req.body;
    console.log("[Webhook] Received notification:", JSON.stringify(payload, null, 2));

    const isSessionUpdate = payload.type === "SESSION_STATUS_UPDATE" || payload.dataSessionId;

    if (isSessionUpdate) {
      const sessionId = payload.dataSessionId;
      const sessionStatus = payload.data?.status || payload.status;
      const consentId = payload.consentId;

      console.log(`[Webhook] FI Session Update: SessionId=${sessionId}, Status=${sessionStatus}, ConsentId=${consentId}`);

      if (sessionStatus === "COMPLETED" || sessionStatus === "PARTIAL") {
        console.log(`[Webhook] Session ready. Triggering data fetch for sessionId: ${sessionId}`);
        const sessionData = await setuClient.fetchSessionData(sessionId);
        console.log(`[Webhook] Successfully fetched data for session ${sessionId}.`);
        if (sessionData.data && sessionData.data.length > 0) {
          console.log(`[Webhook] Retrieved data for ${sessionData.data.length} FIP account(s).`);
        }
        
        // TODO (Phase 1, Task 5): Call transform layer to parse and save transactions in SQLite
      }
    } else {
      // Consent status update
      const consentId = payload.consentId || payload.id;
      const consentStatus = payload.status || payload.data?.status;

      console.log(`[Webhook] Consent Update: ConsentId=${consentId}, Status=${consentStatus}`);

      if (consentStatus === "ACTIVE" || consentStatus === "APPROVED") {
        console.log(`[Webhook] Consent approved. Automatically triggering data session creation for consentId: ${consentId}`);
        const sessionResponse = await setuClient.createDataSession(consentId);
        console.log(`[Webhook] Data session successfully initiated: ${sessionResponse.id}`);
        
        // In live mode, we stop here and wait for Setu's SESSION_STATUS_UPDATE webhook.
        // In mock mode, we trigger the fetch after a short timeout to simulate the webhook notification.
        if (process.env.USE_MOCK_SETU === "true") {
          setTimeout(async () => {
            console.log(`[Webhook] [MOCK] Simulating FI Session status update for session: ${sessionResponse.id}`);
            try {
              const sessionData = await setuClient.fetchSessionData(sessionResponse.id);
              console.log(`[Webhook] [MOCK] Successfully fetched session data. FIP accounts: ${sessionData.data?.length}`);
            } catch (err: any) {
              console.error("[Webhook] [MOCK] Error fetching simulated session data:", err.message);
            }
          }, 1000);
        }
      }
    }

    return res.status(200).json({ success: true });
  } catch (error: any) {
    console.error("[Webhook] Error handling webhook payload:", error.message);
    return res.status(500).json({ error: error.message || "Internal server error" });
  }
});

export default router;
