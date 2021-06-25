import Joi from "joi";

export default function validateAddFinance({ value, description, type }) {
  const schema = Joi.object({
    value: Joi.number().required(),
    description: Joi.string().required(),
  });

  console.log(type);

  if (type !== "expense" && type !== "revenue") {
    return false;
  }

  if (schema.validate({ value, description })?.error === undefined) {
    return true;
  } else {
    return false;
  }
}
