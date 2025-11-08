import request from "supertest";
import app from "../src/app";
import { supabase } from "../src/config/database";
import * as userService from "../src/services/user";

describe("Integration - updateAUser", () => {
  const registerEndpoint = "/api/users/register";
  const updateEndpoint = "/api/users/updateUser";
  const testEmail = `update_${Date.now()}@mail.com`;
  const testUsername = `updateUser_${Date.now()}`;
  const testPassword = "update1234";
  let userId: string;
  let usernameId: string;

  beforeAll(async () => {
    const res = await request(app).post(registerEndpoint).send({
      email: testEmail,
      name: "Original",
      surname: "User",
      age: 30,
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

  it("should return 200 and update only the provided fields", async () => {
    const res = await request(app)
      .put(`${updateEndpoint}/${userId}`)
      .send({
        name: "Updated",
        age: 31,
      });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Usuario actualizado exitosamente");
    expect(res.body.updatedUser.name).toBe("Updated");
    expect(res.body.updatedUser.age).toBe(31);
    expect(res.body.updatedUser.id).toBe(userId);
  });

  it("should return 200 even if body is empty (no fields to update)", async () => {
    const res = await request(app)
      .put(`${updateEndpoint}/${userId}`)
      .send({});

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Usuario actualizado exitosamente");
    expect(res.body.updatedUser).toBeNull();
  });

  it("should return 500 if updateUser throws an error", async () => {
    const spy = jest
      .spyOn(userService, "updateUser")
      .mockImplementationOnce(() => {
        throw new Error("Simulated failure");
      });

    const res = await request(app)
      .put(`${updateEndpoint}/${userId}`)
      .send({ name: "CrashTest" });

    expect(res.status).toBe(500);
    expect(res.body.error).toBe("Simulated failure");

    spy.mockRestore();
  });

  it("should return 500 if an unexpected non-Error is thrown", async () => {
    const spy = jest
      .spyOn(userService, "updateUser")
      .mockImplementationOnce(() => {
        throw "stringError";
      });

    const res = await request(app)
      .put(`${updateEndpoint}/${userId}`)
      .send({ surname: "Unexpected" });

    expect(res.status).toBe(500);
    expect(res.body.error).toBe("Error inesperado");

    spy.mockRestore();
  });
});
