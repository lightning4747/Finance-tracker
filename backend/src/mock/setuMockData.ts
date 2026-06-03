export interface SetuTransaction {
  txnId: string;
  amount: string;
  type: "DEBIT" | "CREDIT";
  mode: "UPI" | "NEFT" | "IMPS" | "CASH" | "CHEQUE";
  narration: string;
  transactionTimestamp: string;
  currentBalance: string;
  reference: string;
  valueDate: string;
}

export interface SetuDecryptedAccount {
  type: "deposit";
  maskedAccNumber: string;
  fipId: string;
  linkRefNumber: string;
  summary: {
    currentBalance: string;
    accountType: "SAVINGS" | "CURRENT";
    currency: string;
    branch: string;
    status: string;
  };
  transactions: {
    startDate: string;
    endDate: string;
    transaction: SetuTransaction[];
  };
}

export interface SetuSessionFetchResponse {
  id: string;
  status: "COMPLETED" | "PENDING" | "FAILED";
  consentId: string;
  data: Array<{
    fipId: string;
    data: Array<{
      decrypted: SetuDecryptedAccount;
    }>;
  }>;
}

export const mockConsentResponse = {
  id: "con_8c72803b-d102-4b2a-89a1-77890fbc982a",
  url: "https://mock.setu.co/consent/con_8c72803b-d102-4b2a-89a1-77890fbc982a",
  status: "PENDING"
};

export const mockSessionResponse = {
  id: "sess_4f89d31a-641e-450f-a9cb-bb2654fca28c",
  status: "PENDING"
};

export const mockSessionFetchResponse: SetuSessionFetchResponse = {
  id: "sess_4f89d31a-641e-450f-a9cb-bb2654fca28c",
  status: "COMPLETED",
  consentId: "con_8c72803b-d102-4b2a-89a1-77890fbc982a",
  data: [
    {
      fipId: "FIP-HDFC-BANK",
      data: [
        {
          decrypted: {
            type: "deposit",
            maskedAccNumber: "XXXXXX4567",
            fipId: "FIP-HDFC-BANK",
            linkRefNumber: "REF-HDFC-SAVINGS-4567",
            summary: {
              currentBalance: "82420.50",
              accountType: "SAVINGS",
              currency: "INR",
              branch: "Koramangala, Bangalore",
              status: "ACTIVE"
            },
            transactions: {
              startDate: "2026-04-01T00:00:00.000Z",
              endDate: "2026-06-01T00:00:00.000Z",
              transaction: [
                {
                  txnId: "TXN10001",
                  amount: "1500.00",
                  type: "DEBIT",
                  mode: "UPI",
                  narration: "UPI/615438204712/Zomato/zomato@paytm/HDFC Bank",
                  transactionTimestamp: "2026-04-05T13:12:00.000Z",
                  currentBalance: "98500.00",
                  reference: "REF615438204712",
                  valueDate: "2026-04-05"
                },
                {
                  txnId: "TXN10002",
                  amount: "250.00",
                  type: "DEBIT",
                  mode: "UPI",
                  narration: "UPI/615829104812/Starbucks/starbucks@axisbank/HDFC Bank",
                  transactionTimestamp: "2026-04-08T09:45:00.000Z",
                  currentBalance: "98250.00",
                  reference: "REF615829104812",
                  valueDate: "2026-04-08"
                },
                {
                  txnId: "TXN10003",
                  amount: "75000.00",
                  type: "CREDIT",
                  mode: "NEFT",
                  narration: "NEFT/SALARY/EmployerCorp/N102830129",
                  transactionTimestamp: "2026-04-30T10:00:00.000Z",
                  currentBalance: "173250.00",
                  reference: "REFN102830129",
                  valueDate: "2026-04-30"
                },
                {
                  txnId: "TXN10004",
                  amount: "4500.00",
                  type: "DEBIT",
                  mode: "IMPS",
                  narration: "IMPS/616039481923/Rent/landlord@icici/IMPS Transfer",
                  transactionTimestamp: "2026-05-02T11:15:00.000Z",
                  currentBalance: "168750.00",
                  reference: "REF616039481923",
                  valueDate: "2026-05-02"
                },
                {
                  txnId: "TXN10005",
                  amount: "1239.00",
                  type: "DEBIT",
                  mode: "UPI",
                  narration: "UPI/935314560764/getsimpl/simpl@axisbank/Axis Bank",
                  transactionTimestamp: "2026-05-05T18:30:00.000Z",
                  currentBalance: "167511.00",
                  reference: "REF935314560764",
                  valueDate: "2026-05-05"
                },
                {
                  txnId: "TXN10006",
                  amount: "800.00",
                  type: "DEBIT",
                  mode: "UPI",
                  narration: "UPI/617294018239/Swiggy/swiggy@hdfc/HDFC Bank",
                  transactionTimestamp: "2026-05-08T20:45:00.000Z",
                  currentBalance: "166711.00",
                  reference: "REF617294018239",
                  valueDate: "2026-05-08"
                },
                {
                  txnId: "TXN10007",
                  amount: "12000.00",
                  type: "DEBIT",
                  mode: "NEFT",
                  narration: "NEFT/CLG/CreditCardPayment/N15093021",
                  transactionTimestamp: "2026-05-15T15:00:00.000Z",
                  currentBalance: "154711.00",
                  reference: "REFN15093021",
                  valueDate: "2026-05-15"
                },
                {
                  txnId: "TXN10008",
                  amount: "1500.00",
                  type: "CREDIT",
                  mode: "UPI",
                  narration: "UPI/618204918230/Refund/payback@hdfc/Refund Cash",
                  transactionTimestamp: "2026-05-18T12:00:00.000Z",
                  currentBalance: "156211.00",
                  reference: "REF618204918230",
                  valueDate: "2026-05-18"
                },
                {
                  txnId: "TXN10009",
                  amount: "75000.00",
                  type: "CREDIT",
                  mode: "NEFT",
                  narration: "NEFT/SALARY/EmployerCorp/N102830540",
                  transactionTimestamp: "2026-05-30T10:00:00.000Z",
                  currentBalance: "231211.00",
                  reference: "REFN102830540",
                  valueDate: "2026-05-30"
                },
                {
                  txnId: "TXN10010",
                  amount: "150000.00",
                  type: "DEBIT",
                  mode: "IMPS",
                  narration: "IMPS/619028491829/CarDownpayment/dealership@sbi/IMPS Trf",
                  transactionTimestamp: "2026-06-01T16:20:00.000Z",
                  currentBalance: "81211.00",
                  reference: "REF619028491829",
                  valueDate: "2026-06-01"
                },
                {
                  txnId: "TXN10011",
                  amount: "1209.50",
                  type: "DEBIT",
                  mode: "UPI",
                  narration: "UPI/620194829102/Amazon/amazonpay@icici/HDFC Bank",
                  transactionTimestamp: "2026-06-02T10:15:00.000Z",
                  currentBalance: "80001.50",
                  reference: "REF620194829102",
                  valueDate: "2026-06-02"
                },
                {
                  txnId: "TXN10012",
                  amount: "2419.00",
                  type: "CREDIT",
                  mode: "UPI",
                  narration: "UPI/620392019283/FriendPayback/friend@okhdfc/HDFC Bank",
                  transactionTimestamp: "2026-06-02T22:30:00.000Z",
                  currentBalance: "82420.50",
                  reference: "REF620392019283",
                  valueDate: "2026-06-02"
                }
              ]
            }
          }
        }
      ]
    }
  ]
};
