import { checkSchema, validationResult } from "express-validator";
import createError from "http-errors";

const mediaSchema = {
  image: {
    in: ["body"],
    isString: {
      errorMessage: "Image is required as a string in the Body",
    },
  },
  title: {
    in: ["body"],
    isString: {
      errorMessage: "Title is required as a string in the Body",
    },
  },
  description: {
    in: ["body"],
    isString: {
      errorMessage: "Description is required as a string in the Body",
    },
  },
};

export const checkMediaSchema = checkSchema(mediaSchema);

export const mediaValidationResult = (req, res, next) => {
  const errors = validationResult(req);
  console.log(errors);
  if (!errors.isEmpty()) {
    next(createError(400, "validation errors", { errorList: errors.array() }));
  } else {
    next();
  }
};
