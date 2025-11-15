import request from "supertest";
import app from "../../src/app";
import { supabase } from "../../src/config/database";
import * as commentService from "../../src/services/comments";



describe("Integration - addCommentController", () => {
  const createPostEndpoint = "/api/posts/create";
  const insertCommentEndpoint = "/api/comments/insertComment";
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

  });


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
      description: "Business to test post creation",
      address: "Fake Street 10",
    });

    businessId = businessRes.body.id;
    businessUsernameId = businessRes.body.username_id;

    const postRes = await request(app).post(createPostEndpoint).send({
      businessId,
      content: "Post to test comments",
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

  it("should return 404 if user does not exist", async () => {
    const fakeUserId = "00000000-0000-0000-0000-000000000000";

    const res = await request(app)
      .post(`${insertCommentEndpoint}/${fakeUserId}`)
      .send({
        postId,
        content: "Trying to comment with non-existent user",
      });

    expect(res.status).toBe(404);
    expect(res.body.error).toBe("Usuario no encontrado");
  });

  it("should return 404 if post does not exist", async () => {
    const fakePostId = "00000000-0000-0000-0000-000000000000";

    const res = await request(app)
      .post(`${insertCommentEndpoint}/${userId}`)
      .send({
        postId: fakePostId,
        content: "Commenting on missing post",
      });

    expect(res.status).toBe(404);
    expect(res.body.error).toBe("Post no encontrado");
  });

  it("should return 400 if addComment fails internally", async () => {
    const spy = jest
      .spyOn(commentService, "addComment")
      .mockResolvedValueOnce(null);

    const res = await request(app)
      .post(`${insertCommentEndpoint}/${userId}`)
      .send({
        postId,
        content: "Testing internal comment failure",
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Error al agregar comentario");

    spy.mockRestore();
  });

  it("should return 500 if service throws unexpected error", async () => {
    const spy = jest
      .spyOn(commentService, "addComment")
      .mockRejectedValueOnce(new Error("Simulated comment failure"));

    const res = await request(app)
      .post(`${insertCommentEndpoint}/${userId}`)
      .send({
        postId,
        content: "Triggering simulated 500 error",
      });

    expect(res.status).toBe(500);
    expect(res.body.error).toBe("Simulated comment failure");

    spy.mockRestore();
  });

  it("should return 200 and insert comment successfully", async () => {
    const res = await request(app)
      .post(`${insertCommentEndpoint}/${userId}`)
      .send({
        postId,
        content: "This is a real test comment",
      });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Comentario agregado exitosamente");
    expect(res.body.comment).toHaveProperty("post_id", postId);
    expect(res.body.comment).toHaveProperty("user_id", userId);
  });
});
