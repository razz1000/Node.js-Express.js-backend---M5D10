import fs from "fs-extra";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const { readJSON, writeFile, writeJSON, createReadStream } = fs;

const dataFolderPath = join(dirname(fileURLToPath(import.meta.url)), "../data");

const mediaJSONPath = join(dataFolderPath, "media.json");

const mediaPublicFolderPath = join(process.cwd(), "./public/img/media");

export const getMedia = () => {
  return readJSON(mediaJSONPath);
};

export const writeMedia = (mediaArray) => {
  return writeJSON(mediaJSONPath, mediaArray);
};
