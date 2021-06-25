import cors from "cors";
import express from "express";
import bcrypt from "bcrypt";
import { v4 as uuid } from "uuid";

import connection from "./database.js";

import validateSignUp from "./validations/validateSignUp.js";
import validateLogIn from "./validations/validateLogIn.js";

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

app.get("/banana", (req, res) => {
  res.sendStatus(200);
});

export default app;
