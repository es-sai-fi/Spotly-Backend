import request from "supertest";
import app from "../../src/app";
import { supabase } from "../../src/config/database";
import * as userService from "../../src/services/user";
import bcrypt from "bcrypt";

describe("Integration - changePasswordController", () => {
  const registerEndpoint = "/api/users/register";
  const changePasswordEndpoint = "/api/users/changePassword";
  const testEmail = `test_${Date.now()}@mail.com`;
  const testUsername = `username_${Date.now()}`;
  const testPassword = "secure1234";
  const newPassword = "newsecure1234";
  let userId: string;
  let usernameId: string;

  beforeAll(async () => {
    const res = await request(app).post(registerEndpoint).send({
      email: testEmail,
      name: "Jane",
      surname: "Doe",
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

  it("should return 400 if the user is not found", async () => {
    const spy = jest
      .spyOn(userService, "getUserById")
      .mockResolvedValueOnce(null as any);

    const res = await request(app)
      .put(`${changePasswordEndpoint}/nonexistent-id`)
      .send({ oldPassword: testPassword, newPassword });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("No se encontró el usuario");

    spy.mockRestore();
  });

  it("should return 400 if old and new passwords are the same", async () => {
    const res = await request(app)
      .put(`${changePasswordEndpoint}/${userId}`)
      .send({ oldPassword: testPassword, newPassword: testPassword });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Las contraseñas son iguales");
  });

  it("should return 400 if the current password does not match", async () => {
    const mockUser = {
      id: userId,
      password: await bcrypt.hash(testPassword, 10),
    };

    const spy = jest
      .spyOn(userService, "getUserById")
      .mockResolvedValueOnce(mockUser as any);

    const res = await request(app)
      .put(`${changePasswordEndpoint}/${userId}`)
      .send({ oldPassword: "wrongpass", newPassword });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("La contraseña actual no coincide");

    spy.mockRestore();
  });

  it("should return 400 if changePassword fails", async () => {
    const mockUser = {
      id: userId,
      password: await bcrypt.hash(testPassword, 10),
    };

    const spyGet = jest
      .spyOn(userService, "getUserById")
      .mockResolvedValueOnce(mockUser as any);
    const spyChange = jest
      .spyOn(userService, "changeUserPassword")
      .mockResolvedValueOnce(null as any);

    const res = await request(app)
      .put(`${changePasswordEndpoint}/${userId}`)
      .send({ oldPassword: testPassword, newPassword });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Error al cambiar la contraseña");

    spyGet.mockRestore();
    spyChange.mockRestore();
  });

  it("should return 200 if the password is successfully changed", async () => {
    const mockUser = {
      id: userId,
      password: await bcrypt.hash(testPassword, 10),
    };

    const spyGet = jest
      .spyOn(userService, "getUserById")
      .mockResolvedValueOnce(mockUser as any);
    const spyChange = jest
      .spyOn(userService, "changePassword")
      .mockResolvedValueOnce(true as any);

    const res = await request(app)
      .put(`${changePasswordEndpoint}/${userId}`)
      .send({ oldPassword: testPassword, newPassword });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Contraseña Actualizada exitosamente");

    spyGet.mockRestore();
    spyChange.mockRestore();
  });

  it("should return 500 if an unexpected error occurs", async () => {
    const spy = jest
      .spyOn(userService, "getUserById")
      .mockImplementationOnce(() => {
        throw new Error("Simulated failure");
      });

    const res = await request(app)
      .put(`${changePasswordEndpoint}/${userId}`)
      .send({ oldPassword: testPassword, newPassword });

    expect(res.status).toBe(500);
    expect(res.body.error).toBe("Simulated failure");

    spy.mockRestore();
  });
});
