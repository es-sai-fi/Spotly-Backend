import request from "supertest";
import app from "../../src/app";
import { supabase } from "../../src/config/database";
import * as postService from "../../src/services/post";

describe("Integration - createPostController", () => {
  const registerEndpoint = "/api/businesses/register";
  const createPostEndpoint = "/api/posts/create";

  const testEmail = `createpost_${Date.now()}@mail.com`;
  const testUsername = `createpostuser_${Date.now()}`;
  const testPassword = "abc12345";
  const testName = "Business to Create Post";
  const testCategory = "Social";

  let businessId: string | undefined;
  let usernameId: string | undefined;

  beforeAll(async () => {
    const res = await request(app).post(registerEndpoint).send({
      email: testEmail,
      name: testName,
      username: testUsername,
      category: testCategory,
      password: testPassword,
      description: "Business to test post creation",
      address: "Fake Street 10",
    });

    businessId = res.body.id;
    usernameId = res.body.username_id;
  });

  afterAll(async () => {
    if (businessId) {
      await supabase.from("posts").delete().eq("business_id", businessId);
      await supabase.from("businesses").delete().eq("id", businessId);
    }
    if (usernameId) {
      await supabase.from("usernames").delete().eq("id", usernameId);
    }
  });

  it("should return 400 if businessId is missing", async () => {
    const res = await request(app)
      .post(createPostEndpoint)
      .send({ content: "This should fail" });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("El negocio es requerido");
  });

  it("should return 400 if addPost fails internally", async () => {
    jest.spyOn(postService, "addPost").mockResolvedValueOnce(null);

    const res = await request(app)
      .post(createPostEndpoint)
      .send({
        businessId,
        content: "Testing internal failure",
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("No se pudo obtener la información");

    jest.restoreAllMocks();
  });

  it("should return 500 if an unexpected error occurs", async () => {
    const spy = jest
      .spyOn(postService, "addPost")
      .mockRejectedValueOnce(new Error("Simulated failure"));

    const res = await request(app)
      .post(createPostEndpoint)
      .send({
        businessId,
        content: "This should trigger 500",
      });

    expect(res.status).toBe(500);
    expect(res.body.error).toBe("Simulated failure");

    spy.mockRestore();
  });

  it("should return 200 and create a post successfully (no image)", async () => {
    const res = await request(app)
      .post(createPostEndpoint)
      .send({
        businessId,
        content: "My first test post!",
      });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Publicacion creada exitosamente");
    expect(res.body.postData).toHaveProperty("business_id", businessId);
    expect(res.body.postData).toHaveProperty("content", "My first test post!");
  });

  it("should return 200 and create a post successfully (with image)", async () => {
    if (!businessId) throw new Error("businessId is undefined");

    const res = await request(app)
      .post(createPostEndpoint)
      .field("businessId", businessId)
      .field("content", "Post with image upload")
      .attach("image", Buffer.from("fake image data"), "test.jpg");

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Publicacion creada exitosamente");
    expect(res.body.postData).toHaveProperty("business_id", businessId);
  });
});
