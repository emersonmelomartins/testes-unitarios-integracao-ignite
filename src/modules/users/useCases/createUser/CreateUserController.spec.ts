import { hash } from "bcryptjs";
import request from "supertest";
import { Connection } from "typeorm";
import { app } from "../../../../app";
import createConnection from "../../../../database";

describe("Create User Controller", () => {
  let connection: Connection;

  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should be able to create a new user", async () => {
    const response = await request(app).post("/api/v1/users").send({
      name: "John",
      email: "john@gmail.com",
      password: "1234",
    });

    expect(response.statusCode).toBe(201);
  });

  it("should not be able to create a new user if email already exists", async () => {
    const response = await request(app).post("/api/v1/users").send({
      name: "John",
      email: "john@gmail.com",
      password: "1234",
    });

    expect(response.statusCode).toBe(400);
  });

  it("should not be able to create a new user with missing information", async () => {
    const response = await request(app).post("/api/v1/users").send({
      name: "John",
    });

    expect(response.statusCode).toBe(500);
  });
});
