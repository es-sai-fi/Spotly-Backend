import request from "supertest";
import app from "../../src/app";
import { supabase } from "../../src/config/database";
import * as businessService from "../../src/services/business";

describe.skip("Integration - registerBusiness", () => {
  const registerEndpoint = "/api/businesses/register";

  const testEmail = `biz_${Date.now()}@mail.com`;
  const testUsername = `bizuser_${Date.now()}`;
  const testPassword = "abc12345";
  const testName = "Test Business";
  const testCategory = "Food";

  let businessId: string | undefined;
  let usernameId: string | undefined;

  afterAll(async () => {
    if (businessId) {
      await supabase.from("businesses").delete().eq("id", businessId);
    }
    if (usernameId) {
      await supabase.from("usernames").delete().eq("id", usernameId);
    }
  });

  it("should return 400 if email is missing", async () => {
    const res = await request(app).post(registerEndpoint).send({
      name: testName,
      username: testUsername,
      category: testCategory,
      password: testPassword,
    });

    expect(res.status).toBe(400);
    expect(res.body.error).toContain("Faltan datos necesarios");
  });

  it("should return 400 if category is missing", async () => {
    const res = await request(app).post(registerEndpoint).send({
      email: testEmail,
      name: testName,
      username: testUsername,
      password: testPassword,
    });

    expect(res.status).toBe(400);
    expect(res.body.error).toContain("Faltan datos necesarios");
  });

  it("should return 400 if email is invalid", async () => {
    const res = await request(app).post(registerEndpoint).send({
      email: "invalidEmail",
      name: testName,
      username: testUsername,
      category: testCategory,
      password: testPassword,
    });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Email inválido");
  });

  it("should return 400 if password is too short", async () => {
    const res = await request(app).post(registerEndpoint).send({
      email: testEmail,
      name: testName,
      username: testUsername,
      category: testCategory,
      password: "a1b2c3",
    });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("La contraseña debe tener al menos 8 caracteres");
  });

  it("should return 400 if password lacks letters or numbers", async () => {
    const res = await request(app).post(registerEndpoint).send({
      email: testEmail,
      name: testName,
      username: testUsername,
      category: testCategory,
      password: "abcdefgh",
    });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("La contraseña debe contener al menos una letra y un número");
  });

  it("should return 400 if password contains forbidden SQL patterns", async () => {
    const res = await request(app).post(registerEndpoint).send({
      email: testEmail,
      name: testName,
      username: testUsername,
      category: testCategory,
      password: "abc123DROP TABLE users",
    });

    expect(res.status).toBe(400);
    expect(res.body.error).toContain("La contraseña contiene caracteres o patrones no permitidos");
  });

  it("should return 201 if business is successfully registered", async () => {
    const res = await request(app).post(registerEndpoint).send({
      email: testEmail,
      name: testName,
      username: testUsername,
      category: testCategory,
      password: testPassword,
      rating: 5,
      description: "Test description",
      address: "Fake Street 123",
    });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("id");
    expect(res.body).toHaveProperty("email", testEmail);
    expect(res.body).toHaveProperty("username_id");

    businessId = res.body.id;
    usernameId = res.body.username_id;
  });

  it("should return 409 if the email or username already exists", async () => {
    const res = await request(app).post(registerEndpoint).send({
      email: testEmail,
      name: testName,
      username: testUsername,
      category: testCategory,
      password: testPassword,
    });

    expect(res.status).toBe(409);
    expect(res.body.error).toBe("El email o nombre de usuario ya está registrado");
  });

  it("should return 500 if an unexpected error occurs", async () => {
    const spy = jest
      .spyOn(businessService, "getBusinessByEmail")
      .mockImplementationOnce(() => {
        throw new Error("Simulated failure");
      });

    const res = await request(app).post(registerEndpoint).send({
      email: `crash_${Date.now()}@mail.com`,
      name: "Crash Test",
      username: `crash_user_${Date.now()}`,
      category: testCategory,
      password: testPassword,
    });

    expect(res.status).toBe(500);
    expect(res.body.error).toBe("Simulated failure");

    spy.mockRestore();
  });
});
