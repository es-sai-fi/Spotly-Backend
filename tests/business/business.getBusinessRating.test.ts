import request from "supertest";
import app from "../../src/app";
import { supabase } from "../../src/config/database";
import * as businessService from "../../src/services/business";

describe("Integration - getBusinessRatingById", () => {
  const registerEndpoint = "/api/businesses/register";
  const ratingEndpoint = "/api/businesses/getBusinessRating";
  const testEmail = `getrating_${Date.now()}@mail.com`;
  const testUsername = `getratinguser_${Date.now()}`;
  const testPassword = "abc12345";
  const testName = "Business to Get Rating";
  const testCategory = "Food";

  let businessId: string | undefined;
  let usernameId: string | undefined;

  beforeAll(async () => {
    const res = await request(app).post(registerEndpoint).send({
      email: testEmail,
      name: testName,
      username: testUsername,
      category: testCategory,
      password: testPassword,
      description: "Business to test rating retrieval",
      address: "Fake Street 55",
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

  it("should return 404 if no businessId is provided", async () => {
    const res = await request(app).get(`${ratingEndpoint}/`).send();

    expect([404, 400]).toContain(res.status);
  });

  it("should return 404 if the business does not exist", async () => {
    const fakeId = "00000000-0000-0000-0000-000000000000";

    const res = await request(app).get(`${ratingEndpoint}/${fakeId}`).send();

    expect(res.status).toBe(404);
    expect(res.body.error).toBe("Negocio no encontrado");
  });

  it("should return 400 if rating data cannot be retrieved", async () => {
    jest
      .spyOn(businessService, "businessRatingById")
      .mockResolvedValueOnce(null);

    const res = await request(app).get(`${ratingEndpoint}/${businessId}`).send();

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Error al mostrar el rating");

    jest.restoreAllMocks();
  });

  it("should return 500 if an unexpected error occurs", async () => {
    const spy = jest
      .spyOn(businessService, "getBusinessById")
      .mockRejectedValueOnce(new Error("Simulated failure"));

    const res = await request(app).get(`${ratingEndpoint}/${businessId}`).send();

    expect(res.status).toBe(500);
    expect(res.body.error).toBe("Simulated failure");

    spy.mockRestore();
  });

  it("should return 200 with rating data when successful", async () => {
    const res = await request(app).get(`${ratingEndpoint}/${businessId}`).send();

    expect(res.status).toBe(200);
    expect(res.body).toBeDefined();
    expect(typeof res.body).toBe("object");
  });
});
