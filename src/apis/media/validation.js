import { checkSchema, validationResult } from "express-validator";
import createError from "http-errors";

const mediaSchema = {
  Title: {
    optional: true,
    in: ["body"],
    isString: {
      errorMessage: "Title is required as a string in the Body",
    },
  },
  Year: {
    optional: true,
    in: ["body"],
    isInt: {
      errorMessage: "Year is required as an integer in the Body",
    },
  },
  imdbID: {
    optional: true,
    in: ["body"],
    isString: {
      errorMessage: "imdbID is required as a string in the Body",
    },
    Type: {
      optional: true,
      in: ["body"],
      isString: {
        errorMessage: "Type is required in the Body",
      },
      Poster: {
        optional: true,
        in: ["body"],
        isString: {
          errorMessage: "Poster is required in the body",
        },
      },
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
