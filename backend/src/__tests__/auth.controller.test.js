import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Factory-based User mock so we can control constructor behavior via closure
let mockUserInstance;

vi.mock("../models/User.js", () => {
  // Regular function (not arrow) so it's callable with `new`
  function MockUser(data) {
    Object.assign(this, mockUserInstance);
    MockUser._lastArgs = data;
  }
  MockUser.findOne = vi.fn();
  MockUser._lastArgs = null;

  return { default: MockUser };
});

vi.mock("bcryptjs");
vi.mock("../lib/utils.js");

import User from "../models/User.js";
import bcrypt from "bcryptjs";
import { generateToken } from "../lib/utils.js";
import { signup } from "../controller/auth.controller.js";

function makeMockInstance(overrides = {}) {
  return {
    _id: "mockId123",
    fullName: "Test User",
    email: "test@example.com",
    password: "hashedPassword",
    profilePic: "",
    save: vi.fn().mockResolvedValue(true),
    ...overrides,
  };
}

describe("signup controller", () => {
  let req;
  let res;

  beforeEach(() => {
    mockUserInstance = makeMockInstance();

    req = {
      body: {
        fullName: "Test User",
        email: "test@example.com",
        password: "password123",
      },
    };
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
      cookie: vi.fn(),
    };

    User.findOne.mockResolvedValue(null);
    bcrypt.genSalt.mockResolvedValue("salt");
    bcrypt.hash.mockResolvedValue("hashedPassword");
    generateToken.mockReturnValue("mocked-token");
  });

  afterEach(() => {
    vi.clearAllMocks();
    User._lastArgs = null;
  });

  // ---- Validation: missing fields ----

  it("should return 400 if fullName is missing", async () => {
    req.body.fullName = "";
    await signup(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "All fields are required" });
  });

  it("should return 400 if email is missing", async () => {
    req.body.email = "";
    await signup(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "All fields are required" });
  });

  it("should return 400 if password is missing", async () => {
    req.body.password = "";
    await signup(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "All fields are required" });
  });

  it("should return 400 if all fields are missing", async () => {
    req.body = {};
    await signup(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "All fields are required" });
  });

  // ---- Validation: password length ----

  it("should return 400 if password is less than 6 characters", async () => {
    req.body.password = "abc";
    await signup(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "Password must be at least 6 characters" });
  });

  it("should return 400 if password is exactly 5 characters", async () => {
    req.body.password = "12345";
    await signup(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "Password must be at least 6 characters" });
  });

  it("should not reject password of exactly 6 characters", async () => {
    req.body.password = "123456";
    await signup(req, res);
    const jsonCalls = res.json.mock.calls;
    const shortPassError = jsonCalls.find(
      (call) => call[0].message === "Password must be at least 6 characters"
    );
    expect(shortPassError).toBeUndefined();
  });

  // ---- Validation: email format ----

  it("should return 400 for invalid email format (no @)", async () => {
    req.body.email = "invalidemail.com";
    await signup(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "Invalid email format" });
  });

  it("should return 400 for invalid email format (no domain)", async () => {
    req.body.email = "user@";
    await signup(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "Invalid email format" });
  });

  it("should return 400 for email with spaces", async () => {
    req.body.email = "user @example.com";
    await signup(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "Invalid email format" });
  });

  it("should accept a valid email format", async () => {
    req.body.email = "user@example.com";
    await signup(req, res);
    const jsonCalls = res.json.mock.calls;
    const emailFormatError = jsonCalls.find(
      (call) => call[0].message === "Invalid email format"
    );
    expect(emailFormatError).toBeUndefined();
  });

  // ---- Duplicate email ----

  it("should return 400 if email already exists", async () => {
    User.findOne.mockResolvedValue({ email: "test@example.com" });
    await signup(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "Email already exists" });
  });

  it("should query the database for the provided email", async () => {
    await signup(req, res);
    expect(User.findOne).toHaveBeenCalledWith({ email: "test@example.com" });
  });

  // ---- Password hashing ----

  it("should hash the password with bcrypt", async () => {
    await signup(req, res);
    expect(bcrypt.genSalt).toHaveBeenCalledWith(10);
    expect(bcrypt.hash).toHaveBeenCalledWith("password123", "salt");
  });

  it("should not store the plain-text password", async () => {
    await signup(req, res);
    expect(User._lastArgs.password).toBe("hashedPassword");
    expect(User._lastArgs.password).not.toBe("password123");
  });

  // ---- Successful signup ----

  it("should create a new User with correct fields", async () => {
    await signup(req, res);
    expect(User._lastArgs).toEqual({
      fullName: "Test User",
      email: "test@example.com",
      password: "hashedPassword",
    });
  });

  it("should call generateToken with the new user's _id", async () => {
    await signup(req, res);
    expect(generateToken).toHaveBeenCalledWith("mockId123", res);
  });

  it("should save the new user to the database", async () => {
    await signup(req, res);
    expect(mockUserInstance.save).toHaveBeenCalledOnce();
  });

  it("should respond with 201 and user data on success", async () => {
    await signup(req, res);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      _id: "mockId123",
      fullName: "Test User",
      email: "test@example.com",
      profilePic: "",
    });
  });

  it("should not include password in the 201 response", async () => {
    await signup(req, res);
    const responseBody = res.json.mock.calls[0][0];
    expect(responseBody).not.toHaveProperty("password");
  });

  // ---- Error handling ----

  it("should return 500 if an unexpected error occurs", async () => {
    User.findOne.mockRejectedValue(new Error("Database error"));
    await signup(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: "Internal server error" });
  });

  it("should return 500 if bcrypt.genSalt throws", async () => {
    bcrypt.genSalt.mockRejectedValue(new Error("bcrypt error"));
    await signup(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: "Internal server error" });
  });

  it("should return 500 if user.save throws", async () => {
    mockUserInstance = makeMockInstance({
      save: vi.fn().mockRejectedValue(new Error("Save failed")),
    });
    await signup(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: "Internal server error" });
  });
});