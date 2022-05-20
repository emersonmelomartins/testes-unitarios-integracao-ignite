import { hash } from "bcryptjs";
import request from "supertest";
import { Connection } from "typeorm";
import { v4 as uuid } from "uuid";
import { app } from "../../../../app";
import createConnection from "../../../../database";

describe("Create Statement Controller", () => {
  let connection: Connection;
  let token: string;

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

    const responseToken = await request(app).post("/api/v1/sessions").send({
      email: "emerson25xd@gmail.com",
      password: "1234",
    });

    token = responseToken.body.token;
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should be able to create a deposit statement", async () => {
    const response = await request(app)
      .post("/api/v1/statements/deposit")
      .send({
        amount: 999.99,
        description: "Laptop sold",
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(response.statusCode).toBe(201);
    expect(response.body).toHaveProperty("id");
  });

  it("should be able to create a withdraw statement", async () => {
    const response = await request(app)
      .post("/api/v1/statements/withdraw")
      .send({
        amount: 100.99,
        description: "Bought new keyboard",
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(response.statusCode).toBe(201);
    expect(response.body).toHaveProperty("id");
  });

  it("should not be able to create a withdraw statement without insufficient balance", async () => {
    const response = await request(app)
      .post("/api/v1/statements/withdraw")
      .send({
        amount: 999.99,
        description: "Bought new laptop",
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(response.statusCode).toBe(400);
  });
});
