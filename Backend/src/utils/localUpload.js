import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const uploadRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../uploads");

const extensions = new Map([
  ["image/jpeg", ".jpg"], ["image/png", ".png"],
  ["image/webp", ".webp"], ["image/gif", ".gif"],
  ["audio/mpeg", ".mp3"], ["audio/mp4", ".m4a"],
  ["audio/wav", ".wav"], ["audio/x-wav", ".wav"],
  ["audio/webm", ".webm"], ["audio/ogg", ".ogg"],
]);

export async function saveUpload(file, category) {
  if (!["messages", "avatars"].includes(category)) throw new Error("Invalid upload category");
  const extension = extensions.get(file.mimetype);
  if (!extension || (category === "avatars" && !file.mimetype.startsWith("image/"))) {
    const error = new Error("Only supported image or audio files are allowed");
    error.status = 400;
    throw error;
  }
  const name = `${randomUUID()}${extension}`;
  const directory = path.join(uploadRoot, category);
  await mkdir(directory, { recursive: true });
  await writeFile(path.join(directory, name), file.buffer, { flag: "wx" });
  return `/uploads/${category}/${name}`;
}
