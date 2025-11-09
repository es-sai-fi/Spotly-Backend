import request from "supertest";
import app from "../../src/app";
import { supabase } from "../../src/config/database";
import * as businessService from "../../src/services/business";

describe("Integration - deleteBusinessController", () => {
  const registerEndpoint = "/api/businesses/register";
  const deleteEndpoint = "/api/businesses/delete";
  const testEmail = `deletebiz_${Date.now()}@mail.com`;
  const testUsername = `deleteuser_${Date.now()}`;
  const testPassword = "abc12345";
  const testName = "Business to Delete";
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
      description: "Business to test deletion",
      address: "Fake Avenue 123",
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
      .delete(`${deleteEndpoint}/${fakeId}`)
      .send();

    expect(res.status).toBe(404);
    expect(res.body.error).toBe("No existe el negocio");
  });

  it("should return 400 if deletion fails internally", async () => {
    jest
      .spyOn(businessService, "deleteBusiness")
      .mockResolvedValueOnce(null);

    const res = await request(app)
      .delete(`${deleteEndpoint}/${businessId}`)
      .send();

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("No se pudo eliminar el negocio");
  });

  it("should return 500 if an unexpected error occurs", async () => {
    const spy = jest
      .spyOn(businessService, "deleteBusiness")
      .mockRejectedValueOnce(new Error("Simulated failure"));

    const res = await request(app)
      .delete(`${deleteEndpoint}/${businessId}`)
      .send();

    expect(res.status).toBe(500);
    expect(res.body.error).toBe("Simulated failure");

    spy.mockRestore();
  });

  it("should return 200 when business is successfully deleted", async () => {
    const res = await request(app)
      .delete(`${deleteEndpoint}/${businessId}`)
      .send();

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Negocio eliminado exitosamente");
  });
});
