import { Router } from "express";
import { SetuClient } from "../services/setuClient.js";

const router = Router();
const setuClient = new SetuClient();

// Route to initiate consent request
router.post("/consent", async (req, res) => {
  try {
    const { vua } = req.body;
    if (!vua) {
      return res.status(400).json({ error: "vua is required" });
    }
    const consent = await setuClient.createConsent(vua);
    return res.json(consent);
  } catch (error: any) {
    return res.status(500).json({ error: error.message || "Failed to create consent" });
  }
});

// Route to check consent status
router.get("/consent/:id", async (req, res) => {
  try {
    const consentId = req.params.id;
    const status = await setuClient.getConsentStatus(consentId);
    return res.json(status);
  } catch (error: any) {
    return res.status(500).json({ error: error.message || "Failed to fetch consent status" });
  }
});

// Route to manually trigger data session + fetch (useful for dev / mock testing)
router.post("/fetch", async (req, res) => {
  try {
    const { consentId } = req.body;
    if (!consentId) {
      return res.status(400).json({ error: "consentId is required" });
    }
    
    // Create data session
    const session = await setuClient.createDataSession(consentId);
    
    // Retrieve session data (in production this would wait for Setu's webhook, but for mocking we fetch directly)
    const sessionData = await setuClient.fetchSessionData(session.id);
    
    return res.json({
      session,
      data: sessionData
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || "Failed to fetch session data" });
  }
});

export default router;
