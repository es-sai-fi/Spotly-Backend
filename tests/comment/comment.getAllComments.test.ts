import request from "supertest";
import app from "../../src/app";
import { supabase } from "../../src/config/database";
import * as commentService from "../../src/services/comments";

describe("Integration - getAllCommentsController", () => {
  const userRegisterEndpoint = "/api/users/register";
  const businessRegisterEndpoint = "/api/businesses/register";
  const createPostEndpoint = "/api/posts/create";
  const insertCommentEndpoint = "/api/comments/insertComment";
  const getAllCommentsEndpoint = "/api/comments/allComments";

  const userTestEmail = `test_${Date.now()}@mail.com`;
  const userTestUsername = `username_${Date.now()}`;
  const userTestPassword = "secure1234";
  const userTestName = "John";
  const userTestSurname = "Doe";
  const userAge = 25;

  const businessTestEmail = `business_${Date.now()}@mail.com`;
  const businessTestUsername = `business_${Date.now()}`;
  const businessTestPassword = "abc12345";
  const businessTestName = "Business for Comments";
  const businessTestCategory = "Social";

  let userId: string | undefined;
  let userUsernameId: string | undefined;
  let businessId: string | undefined;
  let businessUsernameId: string | undefined;
  let postId: string | undefined;
  let commentId: string | undefined;

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
      description: "Testing comments",
      address: "Fake Street 10",
    });
    businessId = businessRes.body.id;
    businessUsernameId = businessRes.body.username_id;

    const postRes = await request(app).post(createPostEndpoint).send({
      businessId,
      content: "Post for comments test",
    });
    postId = postRes.body.postData?.id;

    const commentRes = await request(app)
      .post(`${insertCommentEndpoint}/${userId}`)
      .send({
        postId,
        content: "Primer comentario de prueba",
      });
    commentId = commentRes.body.comment?.id;
  });

  afterAll(async () => {
    if (commentId) await supabase.from("comments").delete().eq("id", commentId);
    if (postId) await supabase.from("posts").delete().eq("id", postId);
    if (businessId) await supabase.from("businesses").delete().eq("id", businessId);
    if (userId) await supabase.from("users").delete().eq("id", userId);
    if (userUsernameId)
      await supabase.from("usernames").delete().eq("id", userUsernameId);
    if (businessUsernameId)
      await supabase.from("usernames").delete().eq("id", businessUsernameId);
  });

  it("should return 200 and list all comments successfully", async () => {
    const res = await request(app).get(getAllCommentsEndpoint).send();

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.comments)).toBe(true);

    const found = res.body.comments.find((c: any) => c.id === commentId);
    expect(found).toBeDefined();
    expect(found.post_id).toBe(postId);
    expect(found.user_id).toBe(userId);
  });

  it("should return 500 if service throws an error", async () => {
    const spy = jest
      .spyOn(commentService, "getAllComments")
      .mockRejectedValueOnce(new Error("Simulated failure"));

    const res = await request(app).get(getAllCommentsEndpoint).send();

    expect(res.status).toBe(500);
    expect(res.body.error).toBe("Simulated failure");

    spy.mockRestore();
  });
});
