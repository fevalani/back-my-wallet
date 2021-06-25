import supertest from "supertest";
import app from "../src/app.js";
import connection from "../src/database.js";

beforeEach(async () => {
  await connection.query(
    `DELETE FROM users WHERE name = 'TesteUser' AND email = 'teste@user.com'`
  );
});

afterAll(async () => {
  await connection.query(
    `DELETE FROM users WHERE name = 'TesteUser' AND email = 'teste@user.com'`
  );
  connection.end();
});

describe("POST /mywallet/signup", () => {
  it("returns stats 201 for valid params", async () => {
    const body = {
      name: "TesteUser",
      email: "teste@user.com",
      password: "123456789",
    };
    const result = await supertest(app).post("/mywallet/signup").send(body);
    expect(result.status).toEqual(201);
  });

  it("returns stats 409 for conflict signup", async () => {
    const body = {
      name: "TesteUser",
      email: "teste@user.com",
      password: "123456789",
    };
    await supertest(app).post("/mywallet/signup").send(body);
    const result = await supertest(app).post("/mywallet/signup").send(body);
    expect(result.status).toEqual(409);
  });

  it("returns stats 400 for invalid params", async () => {
    const body = {
      name: "  ",
      email: "teste@user.com",
      password: "123456789",
    };
    const result = await supertest(app).post("/mywallet/signup").send(body);
    expect(result.status).toEqual(400);
  });
});

describe("GET /mywallet/login", () => {
  it("returns status 200 for created user", async () => {
    const body = {
      name: "TesteUser",
      email: "teste@user.com",
      password: "123456789",
    };
    const login = { email: "teste@user.com", password: "123456789" };
    await supertest(app).post("/mywallet/signup").send(body);
    const result = await supertest(app).post("/mywallet/login").send(login);
    expect(result.status).toEqual(200);
  });
  it("returns status 400 for invalid params", async () => {
    const body = {
      name: "TesteUser",
      email: "teste@user.com",
      password: "123456789",
    };
    const login = { email: "teste@user.com", password: "   " };
    await supertest(app).post("/mywallet/signup").send(body);
    const result = await supertest(app).post("/mywallet/login").send(login);
    expect(result.status).toEqual(400);
  });
  it("returns status 401 for wrong password", async () => {
    const body = {
      name: "TesteUser",
      email: "teste@user.com",
      password: "123456789",
    };
    const login = { email: "teste@user.com", password: "1234567890" };
    await supertest(app).post("/mywallet/signup").send(body);
    const result = await supertest(app).post("/mywallet/login").send(login);
    expect(result.status).toEqual(401);
  });
  it("returns status 403 for not sign-up user", async () => {
    const login = { email: "teste@user.com", password: "1234567890" };
    const result = await supertest(app).post("/mywallet/login").send(login);
    expect(result.status).toEqual(403);
  });
});
