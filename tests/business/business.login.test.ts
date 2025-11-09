import request from "supertest";
import app from "../../src/app";
import { supabase } from "../../src/config/database";
import * as businessService from "../../src/services/business";

describe("Integration - loginBusiness", () => {
  const loginEndpoint = "/api/businesses/login";
  const registerEndpoint = "/api/businesses/register";
  const testEmail = `loginbiz_${Date.now()}@mail.com`;
  const testUsername = `loginuser_${Date.now()}`;
  const testPassword = "abc12345";
  const testName = "Login Business";
  const testCategory = "Retail";

  let businessId: string | undefined;
  let usernameId: string | undefined;

  beforeAll(async () => {
    const res = await request(app).post(registerEndpoint).send({
      email: testEmail,
      name: testName,
      username: testUsername,
      category: testCategory,
      password: testPassword,
      description: "Business for login test",
      address: "Fake Avenue 456",
    });

    businessId = res.body.id;
    usernameId = res.body.username_id;
  });

  afterAll(async () => {
    if (businessId) {
      await supabase.from("businesses").delete().eq("id", businessId);
    }
    if (usernameId) {
      await supabase.from("usernames").delete().eq("id", usernameId);
    }
  });

  it("should return 400 if email is missing", async () => {
    const res = await request(app).post(loginEndpoint).send({
      password: testPassword,
    });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("El email no ha sido proporcionado");
  });

  it("should return 400 if password is missing", async () => {
    const res = await request(app).post(loginEndpoint).send({
      email: testEmail,
    });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("La contraseña no ha sido proporcionada");
  });

  it("should return 404 if business not found", async () => {
    const res = await request(app).post(loginEndpoint).send({
      email: "nonexistent@mail.com",
      password: "abc12345",
    });

    expect(res.status).toBe(404);
    expect(res.body.error).toBe("Negocio no encontrado");
  });

  it("should return 400 if password is incorrect", async () => {
    const res = await request(app).post(loginEndpoint).send({
      email: testEmail,
      password: "wrongpassword123",
    });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Contraseña incorrecta");
  });

  it("should return 200 and a token if login is successful", async () => {
    const res = await request(app).post(loginEndpoint).send({
      email: testEmail,
      password: testPassword,
    });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Login exitoso");
    expect(res.body).toHaveProperty("token");
    expect(res.body.user).toHaveProperty("id");
    expect(res.body.user).toHaveProperty("email", testEmail);
  });

  it("should return 500 and the error message if an unexpected error occurs", async () => {
    const spy = jest
      .spyOn(businessService, "getBusinessByEmail")
      .mockRejectedValueOnce(new Error("Simulated failure"));

    const res = await request(app).post(loginEndpoint).send({
      email: `crashlogin_${Date.now()}@mail.com`,
      password: "abc12345",
    });

    expect(res.status).toBe(500);
    expect(res.body.error).toBe("Simulated failure");

    spy.mockRestore();
  });
});
