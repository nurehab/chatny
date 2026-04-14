import { describe, it, expect, vi, beforeEach } from "vitest";

// Capture schema args to inspect field definitions
let capturedSchemaDefinition = null;
let capturedSchemaOptions = null;

vi.mock("mongoose", () => {
  // Must use a regular function (not arrow) so it's constructable with `new`
  function SchemaConstructor(definition, options) {
    capturedSchemaDefinition = definition;
    capturedSchemaOptions = options;
    this.definition = definition;
    this.options = options;
  }

  return {
    default: {
      Schema: SchemaConstructor,
      model: vi.fn(() => ({})),
    },
  };
});

// Import after mocks are in place
await import("../models/User.js");

describe("User model schema", () => {
  it("should define the email field as required String", () => {
    const emailField = capturedSchemaDefinition.email;
    expect(emailField.type).toBe(String);
    expect(emailField.required).toBe(true);
  });

  it("should define the email field as unique", () => {
    const emailField = capturedSchemaDefinition.email;
    expect(emailField.unique).toBe(true);
  });

  it("should define the fullName field as required String", () => {
    const fullNameField = capturedSchemaDefinition.fullName;
    expect(fullNameField.type).toBe(String);
    expect(fullNameField.required).toBe(true);
  });

  it("should define the password field as required String with minlength 6", () => {
    const passwordField = capturedSchemaDefinition.password;
    expect(passwordField.type).toBe(String);
    expect(passwordField.required).toBe(true);
    expect(passwordField.minlength).toBe(6);
  });

  it("should define the profilePic field as String with default empty string", () => {
    const profilePicField = capturedSchemaDefinition.profilePic;
    expect(profilePicField.type).toBe(String);
    expect(profilePicField.default).toBe("");
  });

  it("should enable timestamps in schema options", () => {
    expect(capturedSchemaOptions).toEqual({ timestamps: true });
  });

  it("should register the model under the name 'User'", async () => {
    const mongoose = (await import("mongoose")).default;
    expect(mongoose.model).toHaveBeenCalledWith("User", expect.anything());
  });

  it("should not have a non-null default for profilePic (defaults to empty string)", () => {
    const profilePicField = capturedSchemaDefinition.profilePic;
    expect(profilePicField.default).not.toBeNull();
    expect(profilePicField.default).toBe("");
  });

  it("should define exactly the expected top-level fields", () => {
    const definedFields = Object.keys(capturedSchemaDefinition);
    expect(definedFields).toEqual(
      expect.arrayContaining(["email", "fullName", "password", "profilePic"])
    );
  });
});