import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Mock the signup controller so route tests are isolated
vi.mock("../controller/auth.controller.js", () => ({
  signup: vi.fn(),
}));

import { signup } from "../controller/auth.controller.js";
import authRouter from "../routes/auth.route.js";

// Helper: create mock req/res/next objects
function createMockRes() {
  const res = {
    statusCode: 200,
    _body: null,
  };
  res.status = vi.fn((code) => {
    res.statusCode = code;
    return res;
  });
  res.json = vi.fn((body) => {
    res._body = body;
    return res;
  });
  res.send = vi.fn((body) => {
    res._body = body;
    return res;
  });
  return res;
}

// Helper: find a registered route layer by method and path
function findRouteLayer(router, method, path) {
  return router.stack.find((layer) => {
    if (!layer.route) return false;
    return (
      layer.route.path === path &&
      layer.route.methods[method.toLowerCase()]
    );
  });
}

describe("auth routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    signup.mockImplementation((req, res) =>
      res.status(201).json({ message: "signup mock called" })
    );
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  // ---- Route registration ----

  it("should register a POST /signup route", () => {
    const layer = findRouteLayer(authRouter, "POST", "/signup");
    expect(layer).toBeDefined();
  });

  it("should register a GET /login route", () => {
    const layer = findRouteLayer(authRouter, "GET", "/login");
    expect(layer).toBeDefined();
  });

  it("should register a GET /logout route", () => {
    const layer = findRouteLayer(authRouter, "GET", "/logout");
    expect(layer).toBeDefined();
  });

  it("should not register a GET /signup route", () => {
    const layer = findRouteLayer(authRouter, "GET", "/signup");
    expect(layer).toBeUndefined();
  });

  it("should not register a POST /login route", () => {
    const layer = findRouteLayer(authRouter, "POST", "/login");
    expect(layer).toBeUndefined();
  });

  it("should export a router with at least 3 registered routes", () => {
    const routeLayers = authRouter.stack.filter((l) => l.route);
    expect(routeLayers.length).toBeGreaterThanOrEqual(3);
  });

  // ---- Handler invocation: POST /signup ----

  it("POST /signup handler should be the signup controller function", () => {
    const layer = findRouteLayer(authRouter, "POST", "/signup");
    const handler = layer.route.stack[0].handle;
    expect(handler).toBe(signup);
  });

  it("POST /signup should invoke the signup controller when called", async () => {
    const layer = findRouteLayer(authRouter, "POST", "/signup");
    const handler = layer.route.stack[0].handle;

    const req = { method: "POST", body: { fullName: "A", email: "a@b.com", password: "pass123" } };
    const res = createMockRes();
    const next = vi.fn();

    await handler(req, res, next);

    expect(signup).toHaveBeenCalledOnce();
    expect(signup).toHaveBeenCalledWith(req, res, next);
  });

  it("POST /signup should receive the request body via the controller", async () => {
    const layer = findRouteLayer(authRouter, "POST", "/signup");
    const handler = layer.route.stack[0].handle;

    const reqBody = { fullName: "Alice", email: "alice@example.com", password: "securePass1" };
    const req = { method: "POST", body: reqBody };
    const res = createMockRes();

    await handler(req, res, vi.fn());

    const reqArg = signup.mock.calls[0][0];
    expect(reqArg.body).toEqual(reqBody);
  });

  // ---- Handler invocation: GET /login ----

  it("GET /login handler should return 'Login endpoint'", () => {
    const layer = findRouteLayer(authRouter, "GET", "/login");
    const handler = layer.route.stack[0].handle;

    const req = { method: "GET" };
    const res = createMockRes();
    const next = vi.fn();

    handler(req, res, next);

    expect(res.send).toHaveBeenCalledWith("Login endpoint");
  });

  // ---- Handler invocation: GET /logout ----

  it("GET /logout handler should return 'Logout endpoint'", () => {
    const layer = findRouteLayer(authRouter, "GET", "/logout");
    const handler = layer.route.stack[0].handle;

    const req = { method: "GET" };
    const res = createMockRes();
    const next = vi.fn();

    handler(req, res, next);

    expect(res.send).toHaveBeenCalledWith("Logout endpoint");
  });
});