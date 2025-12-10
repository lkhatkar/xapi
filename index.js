// index.js
export class XAPI {
  constructor({ endpoint, username, password, actor }) {
    if (!endpoint) throw new Error("Missing endpoint");
    if (!username) throw new Error("Missing username");
    if (!password) throw new Error("Missing password");
    if (!actor) throw new Error("Missing actor");

    this.endpoint = endpoint.endsWith("/statements")
      ? endpoint
      : endpoint + "/statements";

    this.username = username;
    this.password = password;
    this.actor = actor;
  }

  buildStatement({actor, verb, object, result, context }) {
    if (!verb || !object) {
      throw new Error("verb and object are mandatory in a statement");
    }

    return {
      actor,
      verb,
      object,
      ...(result && { result }),
      ...(context && { context }),
      timestamp: new Date().toISOString()
    };
  }

  async send(statement) {
    const auth = btoa(`${this.username}:${this.password}`);

    const response = await fetch(this.endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Experience-API-Version": "1.0.3",
        "Authorization": `Basic ${auth}`
      },
      body: JSON.stringify(statement)
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`xAPI error ${response.status}: ${text}`);
    }

    return response.json();
  }

  async sendStatement({ actor=this.actor, verb, object, result = null, context = null }) {
    const st = this.buildStatement({actor, verb, object, result, context });
    return await this.send(st);
  }
 /**
 * Fetch statements with full xAPI query support
 * (Compatible with SCORM Cloud & 1.0.3 spec)
 *
 * @param {Object} filters
 * @param {Object} [filters.agent]   xAPI Agent object
 * @param {string} [filters.verb]    verb ID
 * @param {string} [filters.activity] activity ID
 * @param {string} [filters.since]   ISO date string
 * @param {string} [filters.until]   ISO date string
 * @param {boolean} [filters.related_activities]
 * @param {boolean} [filters.related_agents]
 * @param {number} [filters.limit]
 * @param {boolean} [filters.descending]
 * @param {string} [filters.cursor]  SCORM Cloud "more" URL
 *
 * @returns {Promise<Object>} full LRS response
 */
  async getStatements(filters = {}) {
    const auth = btoa(`${this.username}:${this.password}`);

    const params = new URLSearchParams();

    if (filters.agent && filters.agent !== '*') {
      params.append("agent", JSON.stringify(filters.agent));
    }

    if (filters.verb) params.append("verb", filters.verb);
    if (filters.activity) params.append("activity", filters.activity);
    if (filters.since) params.append("since", filters.since);
    if (filters.until) params.append("until", filters.until);

    if (filters.related_activities !== undefined) {
      params.append("related_activities", String(filters.related_activities));
    }

    if (filters.related_agents !== undefined) {
      params.append("related_agents", String(filters.related_agents));
    }

    if (filters.limit) params.append("limit", filters.limit);
    if (filters.descending) params.append("descending", "true");

    // SCORM Cloud “more” pagination
    const url = filters.cursor
      ? filters.cursor
      : `${this.endpoint}?${params.toString()}`;

    const response = await fetch(url, {
      headers: {
        "X-Experience-API-Version": "1.0.3",
        "Authorization": `Basic ${auth}`
      }
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`xAPI fetch error ${response.status}: ${text}`);
    }

    return response.json();
  }
}

/* ---------------------------------------------------------
 * Helper functions for common verbs (optional)
 * --------------------------------------------------------- */

// StandardVerbs.js
export const Verbs = {
  initialized: {
    id: "http://adlnet.gov/expapi/verbs/initialized",
    display: { "en-US": "initialized" }
  },
  launched: {
    id: "http://adlnet.gov/expapi/verbs/launched",
    display: { "en-US": "launched" }
  },
  attempted: {
    id: "http://adlnet.gov/expapi/verbs/attempted",
    display: { "en-US": "attempted" }
  },
  completed: {
    id: "http://adlnet.gov/expapi/verbs/completed",
    display: { "en-US": "completed" }
  },
  passed: {
    id: "http://adlnet.gov/expapi/verbs/passed",
    display: { "en-US": "passed" }
  },
  failed: {
    id: "http://adlnet.gov/expapi/verbs/failed",
    display: { "en-US": "failed" }
  },
  answered: {
    id: "http://adlnet.gov/expapi/verbs/answered",
    display: { "en-US": "answered" }
  },
  responded: {
    id: "http://adlnet.gov/expapi/verbs/responded",
    display: { "en-US": "responded" }
  },
  interacted: {
    id: "http://adlnet.gov/expapi/verbs/interacted",
    display: { "en-US": "interacted" }
  },
  experienced: {
    id: "http://adlnet.gov/expapi/verbs/experienced",
    display: { "en-US": "experienced" }
  },
  registered: {
    id: "http://adlnet.gov/expapi/verbs/registered",
    display: { "en-US": "registered" }
  },
  resumed: {
    id: "http://adlnet.gov/expapi/verbs/resumed",
    display: { "en-US": "resumed" }
  },
  suspended: {
    id: "http://adlnet.gov/expapi/verbs/suspended",
    display: { "en-US": "suspended" }
  },
  terminated: {
    id: "http://adlnet.gov/expapi/verbs/terminated",
    display: { "en-US": "terminated" }
  },
  voided: {
    id: "http://adlnet.gov/expapi/verbs/voided",
    display: { "en-US": "voided" }
  },
  rated: {
    id: "http://adlnet.gov/expapi/verbs/rated",
    display: { "en-US": "rated" }
  },
  reviewed: {
    id: "http://adlnet.gov/expapi/verbs/reviewed",
    display: { "en-US": "reviewed" }
  },
  mastered: {
    id: "http://adlnet.gov/expapi/verbs/mastered",
    display: { "en-US": "mastered" }
  }
};

const BASE = "https://arisimulation.com/xapi/verbs/";

export const SimulationVerbs = {
  // Movement / Navigation
  changedHeading: {
    id: BASE + "changed-heading",
    display: { "en-US": "changed heading" }
  },
  changedSpeed: {
    id: BASE + "changed-speed",
    display: { "en-US": "changed speed" }
  },
  reachedWaypoint: {
    id: BASE + "reached-waypoint",
    display: { "en-US": "reached waypoint" }
  },
  deviatedFromCourse: {
    id: BASE + "deviated-course",
    display: { "en-US": "deviated from course" }
  },

  // Collision / Avoidance
  simulatedCollision: {
    id: BASE + "simulated-collision",
    display: { "en-US": "simulated collision" }
  },
  avoidedCollision: {
    id: BASE + "avoided-collision",
    display: { "en-US": "avoided collision" }
  },

  // Sensors / Tracking
  identifiedTarget: {
    id: BASE + "identified-target",
    display: { "en-US": "identified target" }
  },
  lostTarget: {
    id: BASE + "lost-target",
    display: { "en-US": "lost target" }
  },
  lockedTarget: {
    id: BASE + "locked-target",
    display: { "en-US": "locked target" }
  },

  // Controls / Systems
  activatedControl: {
    id: BASE + "activated-control",
    display: { "en-US": "activated control" }
  },
  deactivatedControl: {
    id: BASE + "deactivated-control",
    display: { "en-US": "deactivated control" }
  },
  triggeredAlarm: {
    id: BASE + "triggered-alarm",
    display: { "en-US": "triggered alarm" }
  },
  acknowledgedAlarm: {
    id: BASE + "acknowledged-alarm",
    display: { "en-US": "acknowledged alarm" }
  },

  // Simulation Lifecycle
  startedScenario: {
    id: BASE + "started-scenario",
    display: { "en-US": "started scenario" }
  },
  completedScenario: {
    id: BASE + "completed-scenario",
    display: { "en-US": "completed scenario" }
  },
  pausedScenario: {
    id: BASE + "paused-scenario",
    display: { "en-US": "paused scenario" }
  },
  resumedScenario: {
    id: BASE + "resumed-scenario",
    display: { "en-US": "resumed scenario" }
  }
};


