import { XAPI } from "../index.js";
import { describe, it, expect, beforeEach, afterEach, jest } from "@jest/globals";

describe("XAPI class", () => {
  const actor = { name: "Test User", mbox: "mailto:test@example.com" };
  const xapi = new XAPI({
    endpoint: "https://example.com/xapi",
    username: "user",
    password: "pass",
    actor
  });

  beforeEach(() => {
    // mock fetch globally
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it("sendStatement calls fetch and returns response JSON", async () => {
    const statementResponse = { id: "12345" };

    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => statementResponse
    });

    const result = await xapi.sendStatement({
      verb: { id: "http://adlnet.gov/expapi/verbs/initialized", display: { "en-US": "initialized" } },
      object: { id: "activity-1" }
    });

    expect(global.fetch).toHaveBeenCalledWith(
      xapi.endpoint,
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          "Content-Type": "application/json",
          "X-Experience-API-Version": "1.0.3",
          Authorization: expect.stringContaining("Basic")
        }),
        body: expect.any(String)
      })
    );

    expect(result).toEqual(statementResponse);
  });

  it("getStatements returns data from fetch", async () => {
    const mockData = { statements: [{ id: "stmt-1" }] };

    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockData
    });

    const res = await xapi.getStatements({ limit: 1 });

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining(xapi.endpoint),
      expect.objectContaining({
        headers: expect.objectContaining({
          "X-Experience-API-Version": "1.0.3",
          Authorization: expect.stringContaining("Basic")
        })
      })
    );

    expect(res).toEqual(mockData);
  });

  it("throws an error if fetch fails", async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
      text: async () => "Unauthorized"
    });

    await expect(
      xapi.getStatements({ limit: 1 })
    ).rejects.toThrow("xAPI fetch error");
  });
});
