import multer from "multer";

export const badRequestErrorHandler = (err, req, res, next) => {
  if (err.status === 400) {
    res
      .status(400)
      .send({
        status: "error",
        message: err.message,
        errorsList: err.errorsList,
      });
  } else if (err instanceof multer.MulterError) {
    res.status(400).send({ status: "error", message: err.message });
  } else {
    next(err);
  }
};

export const unauthorizedErrorHandler = (err, req, res, next) => {
  if (err.status === 401) {
    res.status(401).send({ status: "error", message: err.message });
  } else {
    next(err);
  }
};

export const notFoundErrorHandler = (err, req, res, next) => {
  if (err.status === 404) {
    res.status(404).send({ status: "error", message: err.message });
  } else {
    next(err);
  }
};

export const genericErrorHandler = (err, req, res, next) => {
  console.log("ERROR --> ", err);
  res
    .status(500)
    .send({ message: "Generic Server Error! We are going to fix this ASAP!" });
};
