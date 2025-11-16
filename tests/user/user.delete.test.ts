import request from "supertest";
import app from "../../src/app";
import { supabase } from "../../src/config/database";
import * as userService from "../../src/services/user";

describe("Integration - deleteUserController", () => {
  const registerEndpoint = "/api/users/register";
  const deleteEndpoint = "/api/users/delete";
  const testEmail = `test_${Date.now()}@mail.com`;
  const testUsername = `username_${Date.now()}`;
  const testPassword = "secure1234";
  let userId: string;
  let usernameId: string;

  beforeAll(async () => {
    const res = await request(app).post(registerEndpoint).send({
      email: testEmail,
      name: "Carlos",
      surname: "Ramirez",
      age: 29,
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

  it("should return 404 if the user does not exist", async () => {
    const spy = jest
      .spyOn(userService, "getUserById")
      .mockResolvedValueOnce(null as any);

    const res = await request(app).delete(`${deleteEndpoint}/nonexistent-id`);

    expect(res.status).toBe(404);
    expect(res.body.error).toBe("El usuario no existe");

    spy.mockRestore();
  });

  it("should return 400 if deleteUser fails", async () => {
    const mockUser = { id: userId, email: testEmail };

    const spyGet = jest
      .spyOn(userService, "getUserById")
      .mockResolvedValueOnce(mockUser as any);
    const spyDelete = jest
      .spyOn(userService, "deleteUser")
      .mockResolvedValueOnce(null as any);

    const res = await request(app).delete(`${deleteEndpoint}/${userId}`);

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("No se pudo eliminar el usuario");

    spyGet.mockRestore();
    spyDelete.mockRestore();
  });

  it("should return 200 if the user is successfully deleted", async () => {
    const mockUser = { id: userId, email: testEmail };

    const spyGet = jest
      .spyOn(userService, "getUserById")
      .mockResolvedValueOnce(mockUser as any);
    const spyDelete = jest
      .spyOn(userService, "deleteUser")
      .mockResolvedValueOnce(true as any);

    const res = await request(app).delete(`${deleteEndpoint}/${userId}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Usuario eliminado correctamente");

    spyGet.mockRestore();
    spyDelete.mockRestore();
  });

  it("should return 400 if an unexpected error occurs", async () => {
    const spy = jest
      .spyOn(userService, "getUserById")
      .mockImplementationOnce(() => {
        throw new Error("Simulated failure");
      });

    const res = await request(app).delete(`${deleteEndpoint}/${userId}`);

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Simulated failure");

    spy.mockRestore();
  });
});
