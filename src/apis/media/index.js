import express from "express";
import fs from "fs";
import uniqid from "uniqid";
import { getMedia, writeMedia } from "../../lib/fs-tools.js";
import { checkMediaSchema, mediaValidationResult } from "./validation.js";

const mediaRouter = express.Router();

mediaRouter.post(
  "",
  checkMediaSchema,
  mediaValidationResult,
  async (req, res, next) => {
    try {
      const newMediaPost = {
        ...req.body,
        createdAt: new Date(),
        id: uniqid(),
      };
      const media = await getMedia();
      media.push(newMediaPost);
      await writeMedia(media);
      res.status(201).send({ id: newMediaPost.id });
    } catch (error) {
      next(error);
    }
  }
);

mediaRouter.get("/", async (req, res, next) => {
  try {
    const media = await getMedia();
    console.log("Current Media Posts:", media);
    res.send(media);
  } catch (error) {
    next(error);
  }
});
mediaRouter.get("/:id", async (req, res, next) => {
  try {
    const media = await getMedia();
    const founcMediaPost = media.find((m) => m.id === req.params.id);
    res.send(founcMediaPost);
  } catch (error) {
    next(error);
  }
});
mediaRouter.put("", (req, res, next) => {});
mediaRouter.delete("", (req, res, next) => {});

export default mediaRouter;
