import request from "supertest";
import app from "../src/app";
import { supabase } from "../src/config/database";
import * as userService from "../src/services/user";

describe("Integration - getUserByIdController", () => {
  const registerEndpoint = "/api/users/register";
  const getUserEndpoint = "/api/users";
  const testEmail = `test_${Date.now()}@mail.com`;
  const testUsername = `username_${Date.now()}`;
  const testPassword = "secure1234";
  let userId: string;
  let usernameId: string;

  // Register a user before running tests
  beforeAll(async () => {
    const res = await request(app).post(registerEndpoint).send({
      email: testEmail,
      name: "Alice",
      surname: "Wonderland",
      age: 28,
      password: testPassword,
      username: testUsername,
    });

    expect(res.status).toBe(201);
    userId = res.body.id;
    usernameId = res.body.username_id;
  });

  afterAll(async () => {
    if (userId) await supabase.from("users").delete().eq("id", userId);
    if (usernameId)
      await supabase.from("usernames").delete().eq("id", usernameId);
  });

  it("should return 200 and the user if found", async () => {
    const mockUser = {
      id: userId,
      email: testEmail,
      name: "Alice",
      surname: "Wonderland",
      age: 28,
    };

    const spy = jest
      .spyOn(userService, "getUserById")
      .mockResolvedValueOnce(mockUser as any);

    const res = await request(app).get(`${getUserEndpoint}/${userId}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Usuario encontrado");
    expect(res.body.user.id).toBe(userId);

    spy.mockRestore();
  });

  it("should return 400 if the user does not exist", async () => {
    const spy = jest
      .spyOn(userService, "getUserById")
      .mockResolvedValueOnce(null as any);

    const res = await request(app).get(`${getUserEndpoint}/nonexistent-id`);

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("No existe el usuario");

    spy.mockRestore();
  });

  it("should return 500 if an unexpected error occurs", async () => {
    const spy = jest
      .spyOn(userService, "getUserById")
      .mockImplementationOnce(() => {
        throw new Error("Simulated failure");
      });

    const res = await request(app).get(`${getUserEndpoint}/${userId}`);

    expect(res.status).toBe(500);
    expect(res.body.error).toBe("Simulated failure");

    spy.mockRestore();
  });
});
