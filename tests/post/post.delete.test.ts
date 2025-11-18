import request from "supertest";
import app from "../../src/app";
import { supabase } from "../../src/config/database";
import * as postService from "../../src/services/post";

describe("Integration - deletePostController", () => {
  const registerEndpoint = "/api/businesses/register";
  const createPostEndpoint = "/api/posts/create";
  const deletePostEndpoint = "/api/posts/delete";
  const testEmail = `delpost_${Date.now()}@mail.com`;
  const testUsername = `delpostuser_${Date.now()}`;
  const testPassword = "abc12345";
  const testName = "Business for Delete Post";
  const testCategory = "Retail";

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
      description: "Business for post deletion test",
      address: "Fake Street 99",
    });

    businessId = res.body.id;
    usernameId = res.body.username_id;

    const postRes = await request(app)
      .post(createPostEndpoint)
      .field("businessId", businessId)
      .field("content", "Post to be deleted");

    postId = postRes.body.postData?.id;
  });

  afterAll(async () => {
    if (postId) {
      await supabase.from("posts").delete().eq("id", postId);
    }
    if (businessId) {
      await supabase.from("businesses").delete().eq("id", businessId);
    }
    if (usernameId) {
      await supabase.from("usernames").delete().eq("id", usernameId);
    }
  });

  it("should return 404 if the post does not exist", async () => {
    const fakeId = "00000000-0000-0000-0000-000000000000";

    const res = await request(app)
      .delete(`${deletePostEndpoint}/${fakeId}`)
      .send();

    expect(res.status).toBe(404);
    expect(res.body.error).toBe("Publicacion no encontrada");
  });

  it("should return 500 if an unexpected error occurs", async () => {
    const spy = jest
      .spyOn(postService, "deletePost")
      .mockRejectedValueOnce(new Error("Simulated failure"));

    const res = await request(app)
      .delete(`${deletePostEndpoint}/${postId}`)
      .send();

    expect(res.status).toBe(500);
    expect(res.body.error).toBe("Simulated failure");

    spy.mockRestore();
  });

  it("should return 200 when post is successfully deleted", async () => {
    const postRes = await request(app)
      .post(createPostEndpoint)
      .field("businessId", businessId)
      .field("content", "Another post to delete");

    const newPostId = postRes.body.postData?.id;
    expect(newPostId).toBeDefined();

    const res = await request(app)
      .delete(`${deletePostEndpoint}/${newPostId}`)
      .send();

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Post eliminado correctamente");
  });
});
