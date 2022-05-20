import { hash } from "bcryptjs";
import request from "supertest";
import { Connection } from "typeorm";
import { v4 as uuid } from "uuid";
import { app } from "../../../../app";
import createConnection from "../../../../database";

describe("Get Statement Operation Controller", () => {
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

  it("should be able to get a specific statement operation", async () => {
    const depositStatementRequest = await request(app)
      .post("/api/v1/statements/deposit")
      .send({
        amount: 999.99,
        description: "Laptop sold",
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    const { id } = depositStatementRequest.body;

    const response = await request(app)
      .get(`/api/v1/statements/${id}`)
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(response.statusCode).toBe(200);
    expect(response.body.id).toBe(id);
  });
});
