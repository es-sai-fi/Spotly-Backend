import request from "supertest";
import app from "../../src/app";
import { supabase } from "../../src/config/database";

describe("Integration - editBusinessController", () => {
  const registerEndpoint = "/api/businesses/register";
  const editEndpoint = (id: string) => `/api/businesses/edit/${id}`;

  const testEmail = `editbiz_${Date.now()}@mail.com`;
  const testUsername = `edituser_${Date.now()}`;
  const testPassword = "abc12345";
  const testName = "Editable Business";
  const testCategory = "Tech";

  let businessId: string | undefined;
  let usernameId: string | undefined;

  beforeAll(async () => {
    const res = await request(app).post(registerEndpoint).send({
      email: testEmail,
      name: testName,
      username: testUsername,
      category: testCategory,
      password: testPassword,
      description: "Business to test editing",
      address: "Fake Road 999",
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

  it("should return 400 if update fails (invalid id)", async () => {
    const res = await request(app)
      .put(editEndpoint("nonexistent-id"))
      .send({ name: "New Name" });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Hubo un error editando la información");
  });

  it("should return 200 and update business info successfully", async () => {
    const res = await request(app)
      .put(editEndpoint(businessId!))
      .send({
        name: "Updated Name",
        description: "Updated description",
        address: "Updated Street 42",
      });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Información editada exitosamente");
    expect(res.body.toUpdate).toMatchObject({
      name: "Updated Name",
      description: "Updated description",
      address: "Updated Street 42",
    });
  });

  it("should ignore invalid fields and still return 200", async () => {
    const res = await request(app)
      .put(editEndpoint(businessId!))
      .send({
        name: "Another Name",
        invalidField: "should be ignored",
      });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Información editada exitosamente");
    expect(res.body.toUpdate).toHaveProperty("name", "Another Name");
    expect(res.body.toUpdate).not.toHaveProperty("invalidField");
  });
});
