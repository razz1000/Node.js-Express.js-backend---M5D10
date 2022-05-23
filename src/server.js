import express from "express";
import fs from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import mediaRouter from "./apis/media/index.js";
import cors from "cors";
import listEndpoints from "express-list-endpoints";
import {
  genericErrorHandler,
  notFoundErrorHandler,
  badRequestErrorHandler,
  unauthorizedErrorHandler,
} from "./errorHandlers.js";

export const publicFolderPath = join(process.cwd(), "./public");

const server = express();
const port = process.env.PORT || 5001;

const whitelist = [process.env.FE_DEV_URL, process.env.FE_PROD_URL];

const corsOptions = {
  origin: (origin, next) => {
    console.log("CURRENT ORIGIN: ", origin);
    if (!origin || whitelist.indexOf(origin) !== -1) {
      next(null, true);
    } else {
      next(
        createError(
          400,
          `Cors Error! your origin ${origin} is not in the list!`
        )
      );
    }
  },
};

server.use(express.static(publicFolderPath));
server.use(cors(/* corsOptions */));
server.use(express.json());

//-----ENDPOINTS--------
server.use("/media", mediaRouter);

//------------ERRORHANDLERS ----------
server.use(badRequestErrorHandler); // 400
server.use(unauthorizedErrorHandler); // 401
server.use(notFoundErrorHandler); // 404
server.use(genericErrorHandler); // 500

server.listen(port, () => {
  console.table(listEndpoints(server));
  console.log(`Server is listening on port ${port}`);
});
server.on("error", (error) => {
  console.log("new error", error);
});
