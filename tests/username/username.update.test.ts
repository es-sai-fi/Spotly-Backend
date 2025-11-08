import request from "supertest";
import app from "../../src/app";
import { supabase } from "../../src/config/database";
import { addUsername } from "../../src/services/usernames";

describe("Integration - updateAUsernameById", () => {
  const usernameUpdateEndpoint = "/api/username/updateUsername";
  let usernameId: string;
  let otherUsernameId: string;

  const initialUsername = `user_${Date.now()}`;
  const newUsername = `updated_${Date.now()}`;
  const otherUsername = `other_${Date.now()}`;

  beforeAll(async () => {
    // Creates the test user 
    const created = await addUsername(initialUsername);
    usernameId = created.id;

    // Creates another user to test conflict 
    const otherCreated = await addUsername(otherUsername);
    otherUsernameId = otherCreated.id;
  });

  afterAll(async () => {
    if (usernameId) {
      await supabase.from("usernames").delete().eq("id", usernameId);
    }
    if (otherUsernameId) {
      await supabase.from("usernames").delete().eq("id", otherUsernameId);
    }
  });

  it("should return 409 if the username is already registered by another user", async () => {
    const res = await request(app)
      .put(`${usernameUpdateEndpoint}/${usernameId}`)
      .send({ username: otherUsername });

    expect(res.status).toBe(409);
    expect(res.body.error).toBe("El nombre de usuario ya está registrado");
  });

  it("should return 200 if the username is successfully updated", async () => {
    const res = await request(app)
      .put(`${usernameUpdateEndpoint}/${usernameId}`)
      .send({ username: newUsername });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Nombre de usuario actualizado correctamente");
    expect(res.body.updatedUsername).toHaveProperty("username", newUsername);

    const { data, error } = await supabase
      .from("usernames")
      .select("username")
      .eq("id", usernameId)
      .single();

    expect(error).toBeNull();
    expect(data).not.toBeNull();
    expect(data!.username).toBe(newUsername);
  });

  it("should return 200 with message if username is already updated", async () => {
    const res = await request(app)
      .put(`${usernameUpdateEndpoint}/${usernameId}`)
      .send({ username: newUsername });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("El nombre de usuario ya está actualizado");
  });

  it("should return 400 if the username_id does not exist", async () => {
    const fakeId = "00000000-0000-0000-0000-000000000000";
    const res = await request(app)
      .put(`${usernameUpdateEndpoint}/${fakeId}`)
      .send({ username: "whatever" });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("No existe el usuario");
  });
});
