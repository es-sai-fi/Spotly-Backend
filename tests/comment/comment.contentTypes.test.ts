import request from "supertest";
import app from "../../src/app";
import { supabase } from "../../src/config/database";

describe("Integration - Comment Content Types", () => {
  const createPostEndpoint = "/api/posts/create";
  const insertCommentEndpoint = "/api/comments/insertComment";
  const userRegisterEndpoint = "/api/users/register";
  const businessRegisterEndpoint = "/api/businesses/register";

  const userTestEmail = `testtype_${Date.now()}@mail.com`;
  const userTestUsername = `usernametype_${Date.now()}`;
  const userTestPassword = "secure1234";
  const userTestName = "Type";
  const userTestSurname = "Tester";
  const userAge = 26;

  const businessTestEmail = `businesstype_${Date.now()}@mail.com`;
  const businessTestUsername = `businesstype_${Date.now()}`;
  const businessTestPassword = "abc12345";
  const businessTestName = "Business Type Test";
  const businessTestCategory = "Sports";

  let userId: string | undefined;
  let userUsernameId: string | undefined;
  let businessId: string | undefined;
  let businessUsernameId: string | undefined;
  let postId: string | undefined;

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
      description: "Business for type tests",
      address: "Type Street 999",
    });

    businessId = businessRes.body.id;
    businessUsernameId = businessRes.body.username_id;

    const postRes = await request(app).post(createPostEndpoint).send({
      businessId,
      content: "Post for type tests",
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

  it("should accept comment with emojis", async () => {
    const res = await request(app)
      .post(`${insertCommentEndpoint}/${userId}`)
      .send({
        postId,
        content: "Great! 👍😊🎉",
      });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Comentario agregado exitosamente");
  });

  it("should accept comment with URLs", async () => {
    const res = await request(app)
      .post(`${insertCommentEndpoint}/${userId}`)
      .send({
        postId,
        content: "Check this: https://example.com",
      });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Comentario agregado exitosamente");
  });

  it("should accept comment with mentions", async () => {
    const res = await request(app)
      .post(`${insertCommentEndpoint}/${userId}`)
      .send({
        postId,
        content: "Thanks @user for the info!",
      });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Comentario agregado exitosamente");
  });
});
