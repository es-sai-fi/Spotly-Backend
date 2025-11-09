import request from "supertest";
import app from "../../src/app";
import { supabase } from "../../src/config/database";
import { addUsername } from "../../src/services/usernames";

describe("Integration - getUsernamebyIdController", () => {
  const getUsernameByIdEndpoint = "/api/username";
  const testUsername = `test_user_${Date.now()}`;

  let usernameId: string;

  beforeAll(async () => {
    const inserted = await addUsername(testUsername);
    usernameId = inserted.id;
  });

  afterAll(async () => {
    if (usernameId) {
      await supabase.from("usernames").delete().eq("id", usernameId);
    }
  });

  it("should return 400 if username_id does not exist", async () => {
    const fakeId = "00000000-0000-0000-0000-000000000000";
    const res = await request(app).get(`${getUsernameByIdEndpoint}/${fakeId}`);

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("No existe el usuario");
  });

  it("should return 200 and the username data if username_id exists", async () => {
    const res = await request(app).get(`${getUsernameByIdEndpoint}/${usernameId}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("id", usernameId);
    expect(res.body).toHaveProperty("username", testUsername);
  });
});
