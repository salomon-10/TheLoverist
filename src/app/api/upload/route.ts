import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { requireAuthor } from "@/lib/session";

const MAX_IMAGE_SIZE = 10 * 1024 * 1024;
const IMAGE_TYPES = new Map([
  ["image/jpeg", ".jpg"],
  ["image/png", ".png"],
  ["image/webp", ".webp"],
  ["image/gif", ".gif"]
]);

export async function POST(request: Request) {
  try {
    await requireAuthor();
  } catch {
    return NextResponse.json({ message: "Connectez-vous en tant qu'auteur pour envoyer une image." }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ message: "Aucune image n'a été sélectionnée." }, { status: 400 });
  }

  const extension = IMAGE_TYPES.get(file.type);
  if (!extension) {
    return NextResponse.json({ message: "Format accepté : JPG, PNG, WebP ou GIF." }, { status: 400 });
  }

  if (file.size > MAX_IMAGE_SIZE) {
    return NextResponse.json({ message: "L'image ne doit pas dépasser 10 Mo." }, { status: 400 });
  }

  const uploadDirectory = path.join(process.cwd(), "public", "uploads");
  const filename = `${randomUUID()}${extension}`;
  await mkdir(uploadDirectory, { recursive: true });
  await writeFile(path.join(uploadDirectory, filename), Buffer.from(await file.arrayBuffer()));

  return NextResponse.json({ url: `/uploads/${filename}` });
}
