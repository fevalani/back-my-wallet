import Joi from "joi";

export default async function validateSignUp(
  { name, password, email },
  connection
) {
  const schema = Joi.object({
    name: Joi.string().trim().required(),
    password: Joi.string().trim().required(),
    email: Joi.string().email().required(),
  });
  const userExists = await connection.query(
    `SELECT * FROM users WHERE email = $1`,
    [email]
  );
  if (userExists.rows.length !== 0) {
    return { type: false, status: 409 };
  }

  if (schema.validate({ name, password, email })?.error === undefined) {
    return { type: true, status: 201 };
  } else {
    return { type: false, status: 400 };
  }
}
