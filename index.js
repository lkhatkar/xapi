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

  buildStatement({ verb, object, result, context }) {
    if (!verb || !object) {
      throw new Error("verb and object are mandatory in a statement");
    }

    return {
      actor: this.actor,
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

  async sendStatement({ verb, object, result = null, context = null }) {
    const st = this.buildStatement({ verb, object, result, context });
    return await this.send(st);
  }
}

/* ---------------------------------------------------------
 * Helper functions for common verbs (optional)
 * --------------------------------------------------------- */

export const Verbs = {
  initialized: {
    id: "http://adlnet.gov/expapi/verbs/initialized",
    display: { "en-US": "initialized" }
  },
  completed: {
    id: "http://adlnet.gov/expapi/verbs/completed",
    display: { "en-US": "completed" }
  },
  interacted: {
    id: "http://adlnet.gov/expapi/verbs/interacted",
    display: { "en-US": "interacted" }
  },
  answered: {
    id: "http://adlnet.gov/expapi/verbs/answered",
    display: { "en-US": "answered" }
  },
  experienced: {
    id: "http://adlnet.gov/expapi/verbs/experienced",
    display: { "en-US": "experienced" }
  }
};
