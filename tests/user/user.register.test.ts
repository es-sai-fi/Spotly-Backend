import request from "supertest";
import app from "../../src/app";
import { supabase } from "../../src/config/database";
import * as userService from "../../src/services/user";

describe("Integration - registerUser", () => {
  const registerEndpoint = "/api/users/register";
  const testEmail = `register_${Date.now()}@mail.com`;
  const testUsername = `user_${Date.now()}`;
  const testPassword = "abc12345";

  let userId: string;
  let usernameId: string;

  afterAll(async () => {
    if (userId) await supabase.from("users").delete().eq("id", userId);
    if (usernameId)
      await supabase.from("usernames").delete().eq("id", usernameId);
  });

  it("should return 400 if email is missing", async () => {
    const res = await request(app).post(registerEndpoint).send({
      name: "John",
      surname: "Doe",
      age: 25,
      password: testPassword,
      username: testUsername,
    });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Falta proporcionar el Email");
  });

  it("should return 400 if age is missing", async () => {
    const res = await request(app).post(registerEndpoint).send({
      email: testEmail,
      name: "John",
      surname: "Doe",
      password: testPassword,
      username: testUsername,
    });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Falta proporcionar la edad");
  });

  it("should return 400 if password is missing", async () => {
    const res = await request(app).post(registerEndpoint).send({
      email: testEmail,
      name: "John",
      surname: "Doe",
      age: 25,
      username: testUsername,
    });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Falta proporcionar la contraseña");
  });

  it("should return 400 if full name is missing", async () => {
    const res = await request(app).post(registerEndpoint).send({
      email: testEmail,
      age: 25,
      password: testPassword,
      username: testUsername,
    });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Proporcione el nombre completo");
  });

  it("should return 400 if email is invalid", async () => {
    const res = await request(app).post(registerEndpoint).send({
      email: "invalidEmail",
      name: "John",
      surname: "Doe",
      age: 25,
      password: testPassword,
      username: testUsername,
    });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Email inválido");
  });

  it("should return 400 if age is invalid", async () => {
    const res = await request(app).post(registerEndpoint).send({
      email: testEmail,
      name: "John",
      surname: "Doe",
      age: 999,
      password: testPassword,
      username: testUsername,
    });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Edad inválida");
  });

  it("should return 400 if password is too short", async () => {
    const res = await request(app).post(registerEndpoint).send({
      email: testEmail,
      name: "John",
      surname: "Doe",
      age: 25,
      password: "short1",
      username: testUsername,
    });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("La contraseña debe tener al menos 8 caracteres");
  });

  it("should return 400 if password lacks letters or numbers", async () => {
    const res = await request(app).post(registerEndpoint).send({
      email: testEmail,
      name: "John",
      surname: "Doe",
      age: 25,
      password: "abcdefgh", // no digits
      username: testUsername,
    });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe(
      "La contraseña debe contener al menos una letra y un número"
    );
  });

  it("should return 201 if user is successfully registered", async () => {
    const res = await request(app).post(registerEndpoint).send({
      email: testEmail,
      name: "John",
      surname: "Doe",
      age: 25,
      password: testPassword,
      username: testUsername,
    });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("id");
    expect(res.body).toHaveProperty("email", testEmail);
    expect(res.body).toHaveProperty("username_id");

    userId = res.body.id;
    usernameId = res.body.username_id;
  });

  it("should return 409 if the email or username already exists", async () => {
    const res = await request(app).post(registerEndpoint).send({
      email: testEmail,
      name: "John",
      surname: "Doe",
      age: 25,
      password: testPassword,
      username: testUsername,
    });

    expect(res.status).toBe(409);
    expect(res.body.error).toBe("El email o nombre de usuario ya está registrado");
  });

  it("should return 500 if an unexpected error occurs", async () => {
    const spy = jest
      .spyOn(userService, "getUserByEmail")
      .mockImplementationOnce(() => {
        throw new Error("Simulated failure");
      });

    const res = await request(app).post(registerEndpoint).send({
      email: "crash_test@mail.com",
      name: "Error",
      surname: "Test",
      age: 30,
      password: testPassword,
      username: "error_test_user",
    });

    expect(res.status).toBe(500);
    expect(res.body.error).toBe("Simulated failure");

    spy.mockRestore();
  });
});
