import request from "supertest";
import app from "../../src/app";
import { supabase } from "../../src/config/database";
import * as userService from "../../src/services/user";

describe("🔐 Integration - loginUser", () => {
  const registerEndpoint = "/api/users/register";
  const loginEndpoint = "/api/users/login";
  const testEmail = `test_${Date.now()}@mail.com`;
  const testUsername = `username_${Date.now()}`;
  const testPassword = "secure1234";
  let userId: string;
  let usernameId: string;

  beforeAll(async () => {
    const res = await request(app).post(registerEndpoint).send({
      email: testEmail,
      name: "John",
      surname: "Doe",
      age: 25,
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

  it("should return 400 if email is missing", async () => {
    const res = await request(app).post(loginEndpoint).send({ password: "123" });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe("El email no ha sido proporcionado");
  });

  it("should return 400 if password is missing", async () => {
    const res = await request(app).post(loginEndpoint).send({ email: testEmail });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe("La contraseña no ha sido proporcionada");
  });

  it("should return 404 if the user does not exist", async () => {
    const res = await request(app)
      .post(loginEndpoint)
      .send({ email: "nonexistent@prueba.com", password: "12345678" });
    expect(res.status).toBe(404);
    expect(res.body.error).toBe("Usuario no encontrado");
  });

  it("should return 400 if the password is incorrect", async () => {
    const res = await request(app)
      .post(loginEndpoint)
      .send({ email: testEmail, password: "wrongpass1" });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Contraseña incorrecta");
  });

  it("should return 200 and a token if credentials are correct", async () => {
    const res = await request(app)
      .post(loginEndpoint)
      .send({ email: testEmail, password: testPassword });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Login exitoso");
    expect(res.body.token).toBeTruthy();
    expect(res.body.user.email).toBe(testEmail);
  });

  it("should return 500 if an unexpected error occurs", async () => {
    const spy = jest
      .spyOn(userService, "getUserByEmail")
      .mockImplementationOnce(() => {
        throw new Error("Simulated failure");
      });

    const res = await request(app)
      .post(loginEndpoint)
      .send({ email: testEmail, password: testPassword });

    expect(res.status).toBe(500);
    expect(res.body.error).toBe("Simulated failure");

    spy.mockRestore();
  });
});

