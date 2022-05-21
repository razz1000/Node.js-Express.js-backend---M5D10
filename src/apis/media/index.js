import express from "express";
import fs, { writeFile } from "fs";
import { pipeline } from "stream";
import uniqid from "uniqid";
import { getMedia, writeMedia } from "../../lib/fs-tools.js";
import { getPDFReadableStream } from "../../lib/pdf-tools.js";
import { checkMediaSchema, mediaValidationResult } from "./validation.js";
import { mediaJSONPath, dataFolderPath } from "../../lib/fs-tools.js";
import { stringify } from "querystring";
import axios from "axios";
import "dotenv/config";

const mediaRouter = express.Router();

mediaRouter.post(
  "/",
  checkMediaSchema,
  mediaValidationResult,
  async (req, res, next) => {
    try {
      const newMediaPost = {
        ...req.body,
        reviews: [],
        createdAt: new Date(),
        imdbID: uniqid(),
      };
      const media = await getMedia();
      media.push(newMediaPost);
      await writeMedia(media);
      res.status(201).send({ imdbID: newMediaPost.imdbID });
    } catch (error) {
      next(error);
    }
  }
);

mediaRouter.get("/", async (req, res, next) => {
  try {
    const media = await getMedia();
    if (req.query && req.query.Title) {
      const filteredMedia = media.filter(
        (media) => media.Title === req.query.Title
      );
      if (filteredMedia.length >= 0) {
        console.log("TEST");
        let omdbKey = process.env.OMDB_KEY;
        console.log("this is the PATH: ", omdbKey);
        let url =
          "https://www.omdbapi.com/?s=" +
          req.query.Title +
          "&apikey=" +
          process.env.OMDB_KEY;
        const { data } = await axios.get(url);
        let tempArray = [];
        data.Search.map((m) => {
          const OMDBMediaPosts = {
            Title: m.Title,
            Year: m.Year,
            Type: m.Type,
            Poster: m.Poster,
            imdbID: m.imdbID,
            reviews: [],
            createdAt: new Date(),
          };
          tempArray.push(OMDBMediaPosts);
        });
        console.log("THESE ARE THE TEMP ARRAY", tempArray);
        let media = await getMedia();
        let newArray3 = media.concat(tempArray);
        console.log("This is the Array3:", newArray3);
        await writeMedia(newArray3);
        res.send(newArray3);
      }
    } else {
      res.send(media);
    }
  } catch (error) {
    next(error);
  }
});

// --------------NORMAL GET -----
/* mediaRouter.get("/", async (req, res, next) => {
  try {
    const media = await getMedia();
    console.log("Current Media Posts:", media);
    res.send(media);
  } catch (error) {
    next(error);
  }
}); */

mediaRouter.get("/:imdbID", async (req, res, next) => {
  try {
    const media = await getMedia();
    const founcMediaPost = media.find((m) => m.imdbID === req.params.imdbID);
    res.send(founcMediaPost);
  } catch (error) {
    next(error);
  }
});
mediaRouter.put(
  "/:imdbID",
  checkMediaSchema,
  mediaValidationResult,
  async (req, res, next) => {
    try {
      const media = await getMedia();
      const index = media.findIndex((m) => m.imdbID === req.params.imdbID);
      if (index !== -1) {
        const foundMediaPost = media[index];
        const updatedMediaPost = {
          ...foundMediaPost,
          ...req.body,
          updatedAt: new Date(),
        };
        media[index] = updatedMediaPost;
        await writeMedia(media);
        res.send(updatedMediaPost);
      }
    } catch (error) {
      next(error);
    }
  }
);

mediaRouter.delete("/:imdbID", async (req, res, next) => {
  try {
    const media = await getMedia();

    const remainingMedia = media.filter((m) => m.imdbID !== req.params.imdbID);

    await writeMedia(remainingMedia);

    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

//-----------POSTER-----------

mediaRouter.post("/:imdbID/poster", async (req, res, next) => {
  try {
    const media = await getMedia();

    const index = media.findIndex((m) => m.imdbID === req.params.imdbID);
    if (index !== -1) {
      const oldMediaItem = media[index];
      const updatedMediaItem = {
        ...oldMediaItem,
        ...req.body,
      };
      media[index] = updatedMediaItem;
      await writeMedia(media);
      res.send(updatedMediaItem);
    }
  } catch (error) {
    next(error);
  }
});

//--------------REVIEW------------

mediaRouter.post("/:imdbID/reviews", async (req, res, next) => {
  try {
    const media = await getMedia();
    const newReview = {
      ...req.body,
      elementId: req.params.imdbID,
      createdAt: new Date(),
      _id: uniqid(),
    };

    const findMedia = media.find((m) => m.imdbID === req.params.imdbID);
    if (findMedia) {
      findMedia.reviews.push(newReview);
      await writeMedia(media);
      res.send(newReview);
    }
  } catch (error) {
    next(error);
  }
});

mediaRouter.delete("/:imdbID/reviews/:_id", async (req, res, next) => {
  try {
    const media = await getMedia();

    const mediaIndex = media.findIndex((m) => m.imdbID === req.params.imdbID);
    console.log("Media Index:", mediaIndex);

    if (mediaIndex !== -1) {
      const lengthBefore = media[mediaIndex].reviews.length;
      console.log("Length Before:", lengthBefore);
      media[mediaIndex].reviews = media[mediaIndex].reviews.filter(
        (review) => review._id !== req.params._id
      );
      console.log(media[mediaIndex].reviews);
      await writeMedia(media);
    }

    res.send("THE REVIEW HAS BEEN DELETED");
  } catch (error) {
    next(error);
  }
});

mediaRouter.get("/:imdbID/pdf", async (req, res, next) => {
  try {
    res.setHeader("Content-Type", "application/pdf");
    const media = await getMedia();

    const index = media.findIndex((m) => m.imdbID === req.params.imdbID);
    const oldMedia = media[index];
    const source = await getPDFReadableStream(oldMedia);
    const destination = res;
    pipeline(source, destination, (err) => {
      if (err) console.log(err);
    });
  } catch (error) {
    console.log(error);
    res.send(500).send({ message: error.message });
  }
});

export default mediaRouter;
