import request from "supertest";
import app from "../../src/app";
import { supabase } from "../../src/config/database";
import * as commentService from "../../src/services/comments";

describe("Integration - getCommentsByPostController", () => {
  const createPostEndpoint = "/api/posts/create";
  const insertCommentEndpoint = "/api/comments/insertComment";
  const getCommentsPostEndpoint = "/api/comments/getCommentsPost";
  const userRegisterEndpoint = "/api/users/register";
  const businessRegisterEndpoint = "/api/businesses/register";

  const userTestEmail = `test_${Date.now()}@mail.com`;
  const userTestUsername = `username_${Date.now()}`;
  const userTestPassword = "secure1234";
  const userTestName = "John";
  const userTestSurname = "Doe";
  const userAge = 25;

  const businessTestEmail = `createpost_${Date.now()}@mail.com`;
  const businessTestUsername = `createpostuser_${Date.now()}`;
  const businessTestPassword = "abc12345";
  const businessTestName = "Business to Create Post";
  const businessTestCategory = "Social";

  let userUsernameId: string | undefined;
  let postId: string | undefined;
  let userId: string | undefined;
  let businessId: string | undefined;
  let businessUsernameId: string | undefined;

  beforeAll(async () => {
    const userRes = await request(app).post(userRegisterEndpoint).send({
      email: userTestEmail,
      name: userTestName,
      surname: userTestSurname,
      age: userAge,
      password: userTestPassword,
      username: userTestUsername,
    });

    userId = userRes.body.id;
    userUsernameId = userRes.body.username_id;

    const businessRes = await request(app).post(businessRegisterEndpoint).send({
      email: businessTestEmail,
      name: businessTestName,
      username: businessTestUsername,
      category: businessTestCategory,
      password: businessTestPassword,
      description: "Business to test comment retrieval",
      address: "Fake Street 10",
    });

    businessId = businessRes.body.id;
    businessUsernameId = businessRes.body.username_id;

    const postRes = await request(app).post(createPostEndpoint).send({
      businessId,
      content: "Post without comments yet",
    });

    postId = postRes.body.postData?.id;
  });

  afterAll(async () => {
    if (postId) {
      await supabase.from("comments").delete().eq("post_id", postId);
      await supabase.from("posts").delete().eq("id", postId);
    }
    if (businessId) {
      await supabase.from("businesses").delete().eq("id", businessId);
    }
    if (userId) {
      await supabase.from("users").delete().eq("id", userId);
    }
    if (userUsernameId && businessUsernameId) {
      await supabase.from("usernames").delete().eq("id", userUsernameId);
      await supabase.from("usernames").delete().eq("id", businessUsernameId);
    }
  });

  it("should return 404 if post does not exist", async () => {
    const fakePostId = "00000000-0000-0000-0000-000000000000";

    const res = await request(app)
      .get(`${getCommentsPostEndpoint}/${fakePostId}`)
      .send();

    expect(res.status).toBe(404);
    expect(res.body.error).toBe("Post no encontrado");
  });

  it("should return 400 if post exists but has no comments", async () => {
    const res = await request(app)
      .get(`${getCommentsPostEndpoint}/${postId}`)
      .send();

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("No se pudo obtener los comentarios");
  });

  it("should return 500 if service throws an error", async () => {
    const spy = jest
      .spyOn(commentService, "getCommentsByPost")
      .mockRejectedValueOnce(new Error("Simulated failure"));

    const res = await request(app)
      .get(`${getCommentsPostEndpoint}/${postId}`)
      .send();

    expect(res.status).toBe(500);
    expect(res.body.error).toBe("Simulated failure");

    spy.mockRestore();
  });

  it("should return 200 and retrieve comments successfully", async () => {
    await request(app)
      .post(`${insertCommentEndpoint}/${userId}`)
      .send({
        postId,
        content: "This is a test comment for retrieval",
      });

    const res = await request(app)
      .get(`${getCommentsPostEndpoint}/${postId}`)
      .send();

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Comentarios obtenidos");
    expect(Array.isArray(res.body.comments)).toBe(true);
    expect(res.body.comments.length).toBeGreaterThanOrEqual(1);
  });
});
