import { parseNarration } from "../services/narrationParser.js";

function test() {
  const tests = [
    {
      narration: "UPI/615438204712/Zomato/zomato@paytm/HDFC Bank",
      mode: "UPI",
      type: "DEBIT" as const,
      expected: { sender: null, receiver: "Zomato (zomato@paytm)" }
    },
    {
      narration: "UPI/620392019283/FriendPayback/friend@okhdfc/HDFC Bank",
      mode: "UPI",
      type: "CREDIT" as const,
      expected: { sender: "FriendPayback (friend@okhdfc)", receiver: null }
    },
    {
      narration: "NEFT/SALARY/EmployerCorp/N102830540",
      mode: "NEFT",
      type: "CREDIT" as const,
      expected: { sender: "EmployerCorp", receiver: null }
    },
    {
      narration: "IMPS/616039481923/Rent/landlord@icici/IMPS Transfer",
      mode: "IMPS",
      type: "DEBIT" as const,
      expected: { sender: null, receiver: "Rent (landlord@icici)" }
    }
  ];

  let failures = 0;
  for (const t of tests) {
    const result = parseNarration(t.narration, t.mode, t.type);
    const passed = JSON.stringify(result) === JSON.stringify(t.expected);
    console.log(`[Test] Mode=${t.mode}, Type=${t.type}`);
    console.log(`  Input:    "${t.narration}"`);
    console.log(`  Expected: ${JSON.stringify(t.expected)}`);
    console.log(`  Result:   ${JSON.stringify(result)}`);
    console.log(`  Status:   ${passed ? "PASSED" : "FAILED"}`);
    if (!passed) failures++;
  }

  if (failures > 0) {
    console.error(`\n--- Test finished: ${failures} FAILURES ---`);
    process.exit(1);
  } else {
    console.log("\n--- All Narration Parser Tests PASSED ---");
  }
}

test();
