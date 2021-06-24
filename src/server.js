import cors from "cors";
import pg from "pg";
import express from "express";
import bcrypt from "bcrypt";
import { v4 as uuid } from "uuid";

import validateSignUp from "./validations/validateSignUp.js";
import validateLogIn from "./validations/validateLogIn.js";

const app = express();

app.use(express.json());
app.use(cors());

const { Pool } = pg;

const connection = new Pool({
  user: "postgres",
  password: "123456",
  host: "localhost",
  port: 5432,
  database: "my_wallet_database",
});

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

app.listen(4000, () => {
  console.log("Server listening on port 4000!");
});
