import Joi from "joi";
import bcrypt from "bcrypt";

export default async function validateLogIn({ password, email }, connection) {
  const schema = Joi.object({
    password: Joi.string().trim().required(),
    email: Joi.string().email().required(),
  });
  let userId;

  const user = await connection.query(`SELECT * FROM users WHERE email = $1`, [
    email,
  ]);

  if (user.rows.length === 0) {
    return { type: false, status: 403 };
  } else {
    userId = user.rows[0].id;
  }

  if (schema.validate({ password, email })?.error === undefined) {
    if (!bcrypt.compareSync(password, user.rows[0].password)) {
      return { type: false, status: 401 };
    } else {
      const name = user.rows[0].name;
      return { type: true, status: 200, userId, name };
    }
  } else {
    return { type: false, status: 400 };
  }
}
