import request from "supertest";
import app from "../../src/app";
import { supabase } from "../../src/config/database";
import * as postService from "../../src/services/post";

describe("Integration - getAllPostBusinessController", () => {
  const registerEndpoint = "/api/businesses/register";
  const createPostEndpoint = "/api/posts/create";
  const getAllPostBusinessEndpoint = "/api/posts/getPostBusiness";
  const testEmail = `getpost_${Date.now()}@mail.com`;
  const testUsername = `getpostuser_${Date.now()}`;
  const testPassword = "abc12345";
  const testName = "Business for getAllPostBusiness";
  const testCategory = "Food";

  let businessId: string;
  let usernameId: string;
  let postId: string;

  beforeAll(async () => {
    const res = await request(app).post(registerEndpoint).send({
      email: testEmail,
      name: testName,
      username: testUsername,
      category: testCategory,
      password: testPassword,
      description: "Business test for posts",
      address: "Fake Street 99",
    });

    businessId = res.body.id;
    usernameId = res.body.username_id;

    const postRes = await request(app)
      .post(createPostEndpoint)
      .field("businessId", businessId)
      .field("content", "Post para getAllPostBusiness test");

    postId = postRes.body.postData?.id;
  });

  afterAll(async () => {
    if (postId) await supabase.from("posts").delete().eq("id", postId);
    if (businessId) await supabase.from("businesses").delete().eq("id", businessId);
    if (usernameId) await supabase.from("usernames").delete().eq("id", usernameId);
  });

  it("should return 404 if business does not exist", async () => {
    const fakeId = "00000000-0000-0000-0000-000000000000";

    const res = await request(app).get(`${getAllPostBusinessEndpoint}/${fakeId}`);

    expect(res.status).toBe(404);
    expect(res.body.message).toBe("No existe el negocio");
  });

  it("should return 200 and list posts for a valid business", async () => {
    const res = await request(app).get(`${getAllPostBusinessEndpoint}/${businessId}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Publicaciones encontradas");
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  it("should return 500 if an unexpected error occurs", async () => {
    const spy = jest
      .spyOn(postService, "getAllPostBusiness")
      .mockRejectedValueOnce(new Error("Simulated failure"));

    const res = await request(app).get(`${getAllPostBusinessEndpoint}/${businessId}`);

    expect(res.status).toBe(500);
    expect(res.body.error).toBe("Simulated failure");

    spy.mockRestore();
  });
});
