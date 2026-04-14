import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import jwt from "jsonwebtoken";

// Mock jsonwebtoken before importing the module under test
vi.mock("jsonwebtoken");

import { generateToken } from "../lib/utils.js";

describe("generateToken", () => {
  let mockRes;

  beforeEach(() => {
    mockRes = {
      cookie: vi.fn(),
    };
    process.env.JWT_SECRET = "test-secret";
    process.env.NODE_ENV = "test";
    jwt.sign.mockReturnValue("mocked.jwt.token");
  });

  afterEach(() => {
    vi.clearAllMocks();
    delete process.env.JWT_SECRET;
    delete process.env.NODE_ENV;
  });

  it("should call jwt.sign with the correct userId and secret", () => {
    const userId = "user123";
    generateToken(userId, mockRes);

    expect(jwt.sign).toHaveBeenCalledOnce();
    expect(jwt.sign).toHaveBeenCalledWith({ userId }, "test-secret", {
      expiresIn: "7d",
    });
  });

  it("should return the generated token", () => {
    const token = generateToken("user123", mockRes);
    expect(token).toBe("mocked.jwt.token");
  });

  it("should set the jwt cookie on the response", () => {
    generateToken("user123", mockRes);

    expect(mockRes.cookie).toHaveBeenCalledOnce();
    expect(mockRes.cookie).toHaveBeenCalledWith(
      "jwt",
      "mocked.jwt.token",
      expect.objectContaining({
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true,
        sameSite: "strict",
      })
    );
  });

  it("should set secure=false when NODE_ENV is development", () => {
    process.env.NODE_ENV = "development";
    generateToken("user123", mockRes);

    const cookieOptions = mockRes.cookie.mock.calls[0][2];
    expect(cookieOptions.secure).toBe(false);
  });

  it("should set secure=true when NODE_ENV is production", () => {
    process.env.NODE_ENV = "production";
    generateToken("user123", mockRes);

    const cookieOptions = mockRes.cookie.mock.calls[0][2];
    expect(cookieOptions.secure).toBe(true);
  });

  it("should set secure=true when NODE_ENV is not development", () => {
    process.env.NODE_ENV = "test";
    generateToken("user123", mockRes);

    const cookieOptions = mockRes.cookie.mock.calls[0][2];
    expect(cookieOptions.secure).toBe(true);
  });

  it("should set cookie maxAge to exactly 7 days in milliseconds", () => {
    generateToken("user123", mockRes);

    const cookieOptions = mockRes.cookie.mock.calls[0][2];
    expect(cookieOptions.maxAge).toBe(604800000);
  });

  it("should set httpOnly to true to prevent XSS", () => {
    generateToken("user123", mockRes);

    const cookieOptions = mockRes.cookie.mock.calls[0][2];
    expect(cookieOptions.httpOnly).toBe(true);
  });

  it("should set sameSite to strict to prevent CSRF", () => {
    generateToken("user123", mockRes);

    const cookieOptions = mockRes.cookie.mock.calls[0][2];
    expect(cookieOptions.sameSite).toBe("strict");
  });

  it("should pass the userId embedded in the JWT payload", () => {
    const userId = "abc456xyz";
    generateToken(userId, mockRes);

    const jwtPayload = jwt.sign.mock.calls[0][0];
    expect(jwtPayload).toEqual({ userId: "abc456xyz" });
  });
});