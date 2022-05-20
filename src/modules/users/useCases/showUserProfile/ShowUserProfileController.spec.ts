import { hash } from "bcryptjs";
import request from "supertest";
import { Connection } from "typeorm";
import { v4 as uuid } from "uuid";
import { app } from "../../../../app";
import createConnection from "../../../../database";

describe("Show User Profile Controller", () => {
  let connection: Connection;

  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();

    const id = uuid();
    const password = await hash("1234", 8);

    connection.query(
      `INSERT INTO users(
          id, name, email, password, created_at
        ) VALUES(
          '${id}',
          'Emerson Melo',
          'emerson25xd@gmail.com',
          '${password}',
          'now()'
        )`
    );
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should be able to show a existing user profile", async () => {
    const responseToken = await request(app).post("/api/v1/sessions").send({
      email: "emerson25xd@gmail.com",
      password: "1234",
    });

    const { token } = responseToken.body;

    const response = await request(app)
      .get("/api/v1/profile")
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty("id");
  });

  it("should not be able to show a existing user profile with invalid token", async () => {

    const token = "somerandomtext";

    const response = await request(app)
      .get("/api/v1/profile")
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(response.statusCode).toBe(401);
  });

  it("should not be able to show a existing user profile without token", async () => {

    const response = await request(app)
      .get("/api/v1/profile")
      .send({
        email: "emerson25xd@gmail.com",
        password: "1234",
      })

    expect(response.statusCode).toBe(401);
  });
});
