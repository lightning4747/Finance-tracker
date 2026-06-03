import axios, { AxiosInstance } from "axios";
import {
  mockConsentResponse,
  mockSessionResponse,
  mockSessionFetchResponse,
  SetuSessionFetchResponse
} from "../mock/setuMockData.js";

export class SetuClient {
  private axiosInstance: AxiosInstance;
  private useMock: boolean;

  constructor() {
    const baseURL = process.env.SETU_BASE_URL || "https://dg-sandbox.setu.co";
    const clientId = process.env.SETU_CLIENT_ID || "";
    const secret = process.env.SETU_SECRET || "";
    this.useMock = process.env.USE_MOCK_SETU === "true" || !clientId || !secret;

    this.axiosInstance = axios.create({
      baseURL,
      headers: {
        "Content-Type": "application/json",
        "x-client-id": clientId,
        "x-client-secret": secret,
      },
    });

    if (this.useMock) {
      console.log("[SetuClient] Initialized in MOCK mode.");
    } else {
      console.log(`[SetuClient] Initialized in LIVE mode targeting ${baseURL}.`);
    }
  }

  /**
   * Step 1: Create a consent request for the user's VUA
   */
  async createConsent(vua: string) {
    if (this.useMock) {
      console.log(`[SetuClient] [MOCK] Creating consent for VUA: ${vua}`);
      // return a clone of mockConsentResponse
      return { ...mockConsentResponse };
    }

    try {
      const payload = {
        vua,
        consentDuration: {
          unit: "MONTH",
          value: "3",
        },
        consentMode: "VIEW",
        fetchType: "ONETIME",
        consentTypes: ["TRANSACTIONS"],
        fiTypes: ["DEPOSIT"],
      };

      const response = await this.axiosInstance.post("/consents", payload);
      return response.data;
    } catch (error: any) {
      console.error("[SetuClient] Error creating consent:", error?.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Step 2/5: Retrieve status of consent
   */
  async getConsentStatus(consentId: string) {
    if (this.useMock) {
      console.log(`[SetuClient] [MOCK] Fetching consent status for: ${consentId}`);
      return {
        id: consentId,
        status: "APPROVED",
      };
    }

    try {
      const response = await this.axiosInstance.get(`/consents/${consentId}`);
      return response.data;
    } catch (error: any) {
      console.error(`[SetuClient] Error fetching consent status for ${consentId}:`, error?.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Step 3: Create a data session against an approved consent
   */
  async createDataSession(consentId: string) {
    if (this.useMock) {
      console.log(`[SetuClient] [MOCK] Creating data session for consent: ${consentId}`);
      return { ...mockSessionResponse };
    }

    try {
      // Set range from 3 months ago to today
      const toDate = new Date();
      const fromDate = new Date();
      fromDate.setMonth(fromDate.getMonth() - 3);

      const payload = {
        consentId,
        dataRange: {
          from: fromDate.toISOString(),
          to: toDate.toISOString(),
        },
        format: "json",
      };

      const response = await this.axiosInstance.post("/sessions", payload);
      return response.data;
    } catch (error: any) {
      console.error(`[SetuClient] Error creating data session for ${consentId}:`, error?.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Step 5: Fetch decrypted financial information data from the session
   */
  async fetchSessionData(sessionId: string) {
    if (this.useMock) {
      console.log(`[SetuClient] [MOCK] Fetching session data for: ${sessionId}`);
      return { ...mockSessionFetchResponse };
    }

    try {
      const response = await this.axiosInstance.get(`/sessions/${sessionId}`);
      return response.data;
    } catch (error: any) {
      console.error(`[SetuClient] Error fetching session data for ${sessionId}:`, error?.response?.data || error.message);
      throw error;
    }
  }
}
