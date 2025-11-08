import request from "supertest";
import app from "../../src/app";
import { supabase } from "../../src/config/database";
import { addUsername } from "../../src/services/usernames";

describe("Integration - updateAUsernameById", () => {
  const usernameUpdateEndpoint = "/api/username/updateUsername";
  let usernameId: string;
  const initialUsername = `user_${Date.now()}`;
  const newUsername = `updated_${Date.now()}`;

  beforeAll(async () => {
    const created = await addUsername(initialUsername);
    usernameId = created.id;
  });

  afterAll(async () => {
    if (usernameId) {
      await supabase.from("usernames").delete().eq("id", usernameId);
    }
  });

  it("should return 409 if the username is already registered", async () => {
    const res = await request(app)
      .put(`${usernameUpdateEndpoint}/${usernameId}`)
      .send({ username: initialUsername });

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

  it("should return 400 if the username_id does not exist", async () => {
    const fakeId = "00000000-0000-0000-0000-000000000000";
    const res = await request(app)
      .put(`${usernameUpdateEndpoint}/${fakeId}`)
      .send({ username: "whatever" });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("No existe el usuario");
  });
});
