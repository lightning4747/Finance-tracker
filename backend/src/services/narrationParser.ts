export interface ParsedNarration {
  sender: string | null;
  receiver: string | null;
}

/**
 * Parses Indian banking narration strings by transaction mode to extract sender or receiver.
 * 
 * UPI format: UPI/{refNo}/{partyName}/{vpa}/{bank}
 * NEFT format: NEFT/{category}/{partyName}/{refNo}
 * IMPS format: IMPS/{refNo}/{partyName}/{vpaOrDetails}/{remarks}
 */
export function parseNarration(narration: string, mode: string, type: "DEBIT" | "CREDIT"): ParsedNarration {
  const cleanNarration = narration.trim();
  let sender: string | null = null;
  let receiver: string | null = null;

  try {
    const modeUpper = mode.toUpperCase();

    if (modeUpper === "UPI") {
      // Pattern: UPI/{refNo}/{partyName}/{vpa}/{bank}
      // Example: UPI/615438204712/Zomato/zomato@paytm/HDFC Bank
      const upiRegex = /^UPI\/(\d+)\/([^\/]+)\/([^\/]+)(?:\/([^\/]+))?/i;
      const match = cleanNarration.match(upiRegex);

      if (match) {
        const partyName = match[2].trim();
        const vpa = match[3].trim();
        const partyWithVpa = `${partyName} (${vpa})`;

        if (type === "DEBIT") {
          receiver = partyWithVpa;
        } else {
          sender = partyWithVpa;
        }
      } else {
        // Fallback for non-standard UPI narrations
        if (type === "DEBIT") {
          receiver = cleanNarration;
        } else {
          sender = cleanNarration;
        }
      }
    } else if (modeUpper === "NEFT") {
      // Pattern: NEFT/{category}/{partyName}/{refNo}
      // Example: NEFT/SALARY/EmployerCorp/N102830129
      const neftRegex = /^NEFT\/([^\/]+)\/([^\/]+)\/([^\/]+)/i;
      const match = cleanNarration.match(neftRegex);

      if (match) {
        const partyName = match[2].trim();
        if (type === "DEBIT") {
          receiver = partyName;
        } else {
          sender = partyName;
        }
      } else {
        if (type === "DEBIT") {
          receiver = cleanNarration;
        } else {
          sender = cleanNarration;
        }
      }
    } else if (modeUpper === "IMPS") {
      // Pattern: IMPS/{refNo}/{partyName}/{details}/{remarks}
      // Example: IMPS/616039481923/Rent/landlord@icici/IMPS Transfer
      const impsRegex = /^IMPS\/(\d+)\/([^\/]+)\/([^\/]+)/i;
      const match = cleanNarration.match(impsRegex);

      if (match) {
        const partyName = match[2].trim();
        const details = match[3].trim();
        const partyWithDetails = `${partyName} (${details})`;

        if (type === "DEBIT") {
          receiver = partyWithDetails;
        } else {
          sender = partyWithDetails;
        }
      } else {
        if (type === "DEBIT") {
          receiver = cleanNarration;
        } else {
          sender = cleanNarration;
        }
      }
    } else {
      // Fallback for other modes (CASH, CHEQUE, etc.)
      if (type === "DEBIT") {
        receiver = cleanNarration;
      } else {
        sender = cleanNarration;
      }
    }
  } catch (error) {
    console.error(`[NarrationParser] Failed to parse narration: "${narration}"`, error);
    // Ultimate fallback: return the raw narration as sender or receiver
    if (type === "DEBIT") {
      receiver = cleanNarration;
    } else {
      sender = cleanNarration;
    }
  }

  return { sender, receiver };
}
