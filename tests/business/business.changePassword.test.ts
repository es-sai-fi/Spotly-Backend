import request from "supertest";
import app from "../../src/app";
import { supabase } from "../../src/config/database";
import * as businessService from "../../src/services/business";

describe("Integration - changePasswordController", () => {
  const registerEndpoint = "/api/businesses/register";
  const changePasswordEndpoint = "/api/businesses/changePassword";
  const testEmail = `changepass_${Date.now()}@mail.com`;
  const testUsername = `changepassuser_${Date.now()}`;
  const testPassword = "abc12345";
  const testName = "Business to Change Password";
  const testCategory = "Services";

  let businessId: string | undefined;
  let usernameId: string | undefined;

  beforeAll(async () => {
    const res = await request(app).post(registerEndpoint).send({
      email: testEmail,
      name: testName,
      username: testUsername,
      category: testCategory,
      password: testPassword,
      description: "Business to test password change",
      address: "Password Street 404",
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

  it("should return 404 if the business does not exist", async () => {
    const fakeId = "00000000-0000-0000-0000-000000000000";

    const res = await request(app)
      .put(`${changePasswordEndpoint}/${fakeId}`)
      .send({ oldPassword: "whatever", newPassword: "newpass123" });

    expect(res.status).toBe(404);
    expect(res.body.error).toBe("Negocio no encontrado");
  });

  it("should return 400 if old and new passwords are the same", async () => {
    const res = await request(app)
      .put(`${changePasswordEndpoint}/${businessId}`)
      .send({ oldPassword: testPassword, newPassword: testPassword });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Las contraseñas son iguales");
  });

  it("should return 400 if the current password is incorrect", async () => {
    const res = await request(app)
      .put(`${changePasswordEndpoint}/${businessId}`)
      .send({ oldPassword: "wrongpassword", newPassword: "newpass123" });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("La contraseña actual no coincide");
  });

  it("should return 500 if an unexpected error occurs", async () => {
    const spy = jest
      .spyOn(businessService, "getBusinessByIdPassword")
      .mockRejectedValueOnce(new Error("Simulated failure"));

    const res = await request(app)
      .put(`${changePasswordEndpoint}/${businessId}`)
      .send({ oldPassword: testPassword, newPassword: "newpass123" });

    expect(res.status).toBe(500);
    expect(res.body.error).toBe("Simulated failure");

    spy.mockRestore();
  });

  it("should return 200 when password is changed successfully", async () => {
    const res = await request(app)
      .put(`${changePasswordEndpoint}/${businessId}`)
      .send({ oldPassword: testPassword, newPassword: "newpass123" });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Contraseña Actualizada exitosamente");
  });
});
