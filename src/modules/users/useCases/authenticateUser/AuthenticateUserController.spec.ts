import { hash } from "bcryptjs";
import request from "supertest";
import { Connection } from "typeorm";
import { v4 as uuid } from "uuid";
import { app } from "../../../../app";
import createConnection from "../../../../database";

describe("Authenticate User Controller", () => {
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

  it("should be able to authenticate a existing user", async () => {
    const response = await request(app).post("/api/v1/sessions").send({
      email: "emerson25xd@gmail.com",
      password: "1234",
    });

    expect(response.body).toHaveProperty("token");
  });

  it("should not be able to authenticate a non-existing user", async () => {
    const response = await request(app).post("/api/v1/sessions").send({
      name: "John",
      email: "john@gmail.com",
      password: "1234",
    });

    expect(response.statusCode).toBe(401);
  });
});
