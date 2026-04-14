import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

vi.mock("mongoose");

import mongoose from "mongoose";
import { connectDB } from "../lib/db.js";

describe("connectDB", () => {
  let consoleLogSpy;
  let consoleErrorSpy;
  let processExitSpy;

  beforeEach(() => {
    consoleLogSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    processExitSpy = vi.spyOn(process, "exit").mockImplementation(() => {});
    process.env.DB_URL = "mongodb://localhost:27017/testdb";
  });

  afterEach(() => {
    vi.clearAllMocks();
    delete process.env.DB_URL;
  });

  it("should call mongoose.connect with the DB_URL env variable", async () => {
    mongoose.connect.mockResolvedValue({
      connection: { host: "localhost" },
    });

    await connectDB();

    expect(mongoose.connect).toHaveBeenCalledOnce();
    expect(mongoose.connect).toHaveBeenCalledWith("mongodb://localhost:27017/testdb");
  });

  it("should log successful connection with host name", async () => {
    mongoose.connect.mockResolvedValue({
      connection: { host: "127.0.0.1" },
    });

    await connectDB();

    expect(consoleLogSpy).toHaveBeenCalledWith(
      "MONGODB CONNECTED to Mongo:",
      "127.0.0.1"
    );
  });

  it("should call console.error and process.exit(1) on connection failure", async () => {
    const connectionError = new Error("Connection refused");
    mongoose.connect.mockRejectedValue(connectionError);

    await connectDB();

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "Error connection to mongoDB:",
      connectionError
    );
    expect(processExitSpy).toHaveBeenCalledWith(1);
  });

  it("should not log success message when connection fails", async () => {
    mongoose.connect.mockRejectedValue(new Error("Timeout"));

    await connectDB();

    expect(consoleLogSpy).not.toHaveBeenCalled();
  });

  it("should not call process.exit on successful connection", async () => {
    mongoose.connect.mockResolvedValue({
      connection: { host: "localhost" },
    });

    await connectDB();

    expect(processExitSpy).not.toHaveBeenCalled();
  });

  it("should use process.env.DB_URL as the connection string", async () => {
    process.env.DB_URL = "mongodb://custom-host:27017/mydb";
    mongoose.connect.mockResolvedValue({
      connection: { host: "custom-host" },
    });

    await connectDB();

    expect(mongoose.connect).toHaveBeenCalledWith("mongodb://custom-host:27017/mydb");
  });
});