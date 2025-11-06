import assert from "node:assert/strict";
import { describe, test } from "node:test";
import request from "supertest";
import { createApp } from "../src/app.js";

// Basic smoke tests to ensure key routes respond
describe("Easily app smoke tests", () => {
  const app = createApp();

  test("GET / should return 200", async () => {
    const res = await request(app).get("/");
    assert.equal(res.statusCode, 200);
    assert.match(res.text, /Easily|Login|Jobs/i);
  });

  test("GET /jobs should return 200", async () => {
    const res = await request(app).get("/jobs");
    assert.equal(res.statusCode, 200);
    assert.match(res.text, /Jobs|No jobs found/i);
  });
});
