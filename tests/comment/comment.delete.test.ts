import request from "supertest";
import app from "../../src/app";
import { supabase } from "../../src/config/database";
import * as commentService from "../../src/services/comments";

describe("Integration - deleteCommentController", () => {
  const userRegisterEndpoint = "/api/users/register";
  const businessRegisterEndpoint = "/api/businesses/register";
  const createPostEndpoint = "/api/posts/create";
  const insertCommentEndpoint = "/api/comments/insertComment";
  const deleteCommentEndpoint = "/api/comments/deleteComment";

  const userEmail = `delete_comment_${Date.now()}@mail.com`;
  const userUsername = `delete_comment_user_${Date.now()}`;
  const userPassword = "abc12345";
  const userName = "John";
  const userSurname = "Doe";
  const userAge = 25;

  const businessEmail = `delete_comment_biz_${Date.now()}@mail.com`;
  const businessUsername = `delete_comment_biz_user_${Date.now()}`;
  const businessPassword = "abc12345";
  const businessName = "Biz for Delete Comment";
  const businessCategory = "Social";

  let userId: string;
  let userUsernameId: string;
  let businessId: string;
  let businessUsernameId: string;
  let postId: string;
  let commentId: string;

  beforeAll(async () => {
    const userRes = await request(app).post(userRegisterEndpoint).send({
      email: userEmail,
      name: userName,
      surname: userSurname,
      age: userAge,
      password: userPassword,
      username: userUsername,
    });
    userId = userRes.body.id;
    userUsernameId = userRes.body.username_id;

    const businessRes = await request(app).post(businessRegisterEndpoint).send({
      email: businessEmail,
      name: businessName,
      username: businessUsername,
      category: businessCategory,
      password: businessPassword,
      description: "Biz to test comment deletion",
      address: "Fake Street 10",
    });
    businessId = businessRes.body.id;
    businessUsernameId = businessRes.body.username_id;

    const postRes = await request(app).post(createPostEndpoint).send({
      businessId,
      content: "Post for delete comment test",
    });
    postId = postRes.body.postData?.id;

    const commentRes = await request(app)
      .post(`${insertCommentEndpoint}/${userId}`)
      .send({
        postId,
        content: "Comment to be deleted",
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

  it("should delete a comment successfully", async () => {
    const commentRes = await request(app)
      .post(`${insertCommentEndpoint}/${userId}`)
      .send({
        postId,
        content: "Comment to really delete",
      });

    const newCommentId = commentRes.body.comment?.id;

    const res = await request(app).delete(`${deleteCommentEndpoint}/${newCommentId}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Comentario eliminado correctamente");

    const { data } = await supabase.from("comments").select("*").eq("id", newCommentId);
    expect(data).toHaveLength(0);
  });

  it("should return 400 if comment does not exist", async () => {
    const fakeCommentId = "00000000-0000-0000-0000-000000000000";

    const res = await request(app).delete(`${deleteCommentEndpoint}/${fakeCommentId}`);

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("No se pudo eliminar el comentario");
  });

  it("should return 500 if service throws unexpected error", async () => {
    const spy = jest
      .spyOn(commentService, "deleteComment")
      .mockRejectedValueOnce(new Error("Simulated delete failure"));

    const res = await request(app).delete(`${deleteCommentEndpoint}/${commentId}`);

    expect(res.status).toBe(500);
    expect(res.body.error).toBe("Simulated delete failure");

    spy.mockRestore();
  });
});
