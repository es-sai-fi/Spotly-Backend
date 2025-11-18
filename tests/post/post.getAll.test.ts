import request from "supertest";
import app from "../../src/app";
import { supabase } from "../../src/config/database";
import * as postService from "../../src/services/post";

describe("Integration - getAllPostController", () => {
  const registerEndpoint = "/api/businesses/register";
  const createPostEndpoint = "/api/posts/create";
  const getAllPostEndpoint = "/api/posts/";

  const testEmail = `getallpost_${Date.now()}@mail.com`;
  const testUsername = `getallpostuser_${Date.now()}`;
  const testPassword = "abc12345";
  const testName = "Business for getAllPost";
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
      description: "Business test for getAllPost",
      address: "Fake Street 101",
    });

    businessId = res.body.id;
    usernameId = res.body.username_id;

    // Crear un post asociado
    const postRes = await request(app)
      .post(createPostEndpoint)
      .field("businessId", businessId)
      .field("content", "Post for getAllPost integration test");

    postId = postRes.body.postData?.id;
  });

  afterAll(async () => {
    if (postId) await supabase.from("posts").delete().eq("id", postId);
    if (businessId) await supabase.from("businesses").delete().eq("id", businessId);
    if (usernameId) await supabase.from("usernames").delete().eq("id", usernameId);
  });

  it("should return 200 and list all posts", async () => {
    const res = await request(app).get(getAllPostEndpoint);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);

    const found = res.body.data.find(
      (p: any) => p.content === "Post for getAllPost integration test"
    );
    expect(found).toBeDefined();
  });

  it("should return 500 if an unexpected error occurs", async () => {
    const spy = jest
      .spyOn(postService, "getAllPost")
      .mockRejectedValueOnce(new Error("Simulated failure"));

    const res = await request(app).get(getAllPostEndpoint);

    expect(res.status).toBe(500);
    expect(res.body.error).toBe("Simulated failure");

    spy.mockRestore();
  });
});
