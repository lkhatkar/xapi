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

xapi.sendStatement({
  verb: Verbs.interacted,
  object: {
    id: "app://ship/rudder",
    definition: { name: { "en-US": "Rudder Control" } }
  },
  result: {
    response: "Adjusted rudder to 5° port"
  }
});
