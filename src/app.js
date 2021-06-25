import cors from "cors";
import express from "express";
import bcrypt from "bcrypt";
import { v4 as uuid } from "uuid";
import dayjs from "dayjs";

import connection from "./database.js";

import validateSignUp from "./validations/validateSignUp.js";
import validateLogIn from "./validations/validateLogIn.js";
import validateAddFinance from "./validations/validateAddFinance.js";

const app = express();

app.use(express.json());
app.use(cors());

app.post("/mywallet/signup", async (req, res) => {
  try {
    const validate = await validateSignUp(req.body, connection);
    if (validate.type === true) {
      const { name, email, password } = req.body;
      const hashedPassword = bcrypt.hashSync(req.body.password, 12);

      await connection.query(
        `INSERT INTO users (name,email,password) VALUES ($1,$2,$3)`,
        [name, email, hashedPassword]
      );
      res.sendStatus(validate.status);
    } else {
      res.sendStatus(validate.status);
    }
  } catch {
    res.sendStatus(500);
  }
});

app.post("/mywallet/login", async (req, res) => {
  try {
    const { type, name, status, userId } = await validateLogIn(
      req.body,
      connection
    );
    if (type) {
      const token = uuid();
      await connection.query(
        `INSERT INTO logged_users ("userId",token) VALUES ($1,$2)`,
        [userId, token]
      );
      res.send({ token, name, userId }).status(status);
    } else {
      res.sendStatus(status);
    }
  } catch {
    res.sendStatus(500);
  }
});

app.get("/mywallets/finances", async (req, res) => {
  try {
    const tokenExists = await connection.query(
      `
      SELECT * FROM logged_users WHERE token = $1
    `,
      [req.headers.authorization.replace("Bearer ", "")]
    );
    if (tokenExists.rows.length !== 0) {
      const finances = await connection.query(
        `SELECT type, description, date, value FROM finance`
      );
      res.send(finances.rows);
    } else {
      res.sendStatus(401);
    }
  } catch {
    res.sendStatus(500);
  }
});

app.post("/mywallet/finances/add/finance", async (req, res) => {
  try {
    const tokenExists = await connection.query(
      `
      SELECT * FROM logged_users WHERE token = $1
    `,
      [req.headers.authorization.replace("Bearer ", "")]
    );
    if (tokenExists.rows.length !== 0) {
      const userId = tokenExists.rows[0].userId;
      const date = dayjs().format("YYYY-MM-DD");
      const validate = validateAddFinance(req.body);
      if (validate) {
        const { type, value, description } = req.body;
        await connection.query(
          `INSERT INTO finance ("userId",type,description,date,value) VALUES ($1,$2,$3,$4,$5)`,
          [userId, type, description, date, 100 * value.replace(",", "")]
        );
        res.sendStatus(201);
      } else {
        res.sendStatus(400);
      }
    } else {
      res.sendStatus(401);
    }
  } catch {
    res.sendStatus(500);
  }
});

//app.delete logged user by id /mywallet/users/session

export default app;
