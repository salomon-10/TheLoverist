import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { requireAuthor } from "@/lib/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHENTICATED") {
      return NextResponse.json({ message: "Connectez-vous pour envoyer une image." }, { status: 401 });
    }
    if (error instanceof Error && error.message === "FORBIDDEN") {
      return NextResponse.json({ message: "Seuls les auteurs peuvent envoyer une image." }, { status: 403 });
    }
    console.error("Image upload failed", error);
    return NextResponse.json(
      { message: "Le serveur n'a pas pu enregistrer cette image. Réessayez dans un instant." },
      { status: 500 }
    );
  }
}
