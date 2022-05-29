import { hash } from "bcryptjs";
import request from "supertest";
import { Connection } from "typeorm";
import { v4 as uuid } from "uuid";
import { app } from "../../../../app";
import createConnection from "../../../../database";


describe("Create Transfer Controller", () => {
  let connection: Connection;
  let token: string;
  const id = uuid();
  const id2 = uuid();

  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();

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

    connection.query(
      `INSERT INTO users(
          id, name, email, password, created_at
        ) VALUES(
          '${id2}',
          'Everton Melo',
          'everton@gmail.com',
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

  it("should be able to create a transfer statement", async () => {
    await request(app)
      .post("/api/v1/statements/deposit")
      .send({
        amount: 100,
        description: "Deposit",
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

      const response = await request(app)
      .post(`/api/v1/statements/transfer/${id2}`)
      .send({
        amount: 50,
        description: "Transfer emerson to everton",
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty("id");
    expect(response.body.sender_id).toBe(id);
  });

});
