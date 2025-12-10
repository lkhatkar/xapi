# @lkhatkar/xapi

A minimal, production-ready **xAPI Activity Provider** library for JavaScript projects.

## Installation

```sh
npm install @lkhatkar/xapi


#example usage
import { XAPI, Verbs, SimulationVerbs } from "@lkhatkar/xapi";

const xapi = new XAPI({
  endpoint: "https://cloud.scorm.com/api/xapi/statements",
  username: "SCORM_API_KEY",
  password: "SCORM_API_SECRET",
  actor: {
    name: "Amit Kumar",
    mbox: "mailto:amit@example.com"
  }
});

// Send a statement
await xapi.sendStatement({
  verb: StandardVerbs.completed,
  object: { id: "https://example.com/course/1", objectType: "Activity" },
  result: { score: { scaled: 0.95 }, completion: true }
});

//get statements
const latest = await xapi.getStatements({
  agent: { mbox: "mailto:test@example.com" },
  verb: "http://adlnet.gov/expapi/verbs/completed",
  limit: 5
});

console.log(latest);
