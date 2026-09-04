import { z } from "zod";

export const postContentSchema = z
  .string()
  .trim()
  .min(1, "Le contenu ne peut pas être vide.")
  .max(2000, "Le contenu ne peut pas dépasser 2000 caractères.");

export const urlSchema = z
  .string()
  .trim()
  .url("Ce lien n'est pas valide.")
  .max(2048);

export const createPostSchema = z
  .object({
    content: postContentSchema.optional().default(""),
    type: z.enum(["text", "image", "link"]),
    linkUrl: z.string().trim().url().max(2048).optional().or(z.literal("")),
    mediaUrl: z.string().trim().url().max(2048).optional().or(z.literal("")),
    status: z.enum(["draft", "published"])
  })
  .refine((data) => data.content.length > 0 || data.mediaUrl || data.linkUrl, {
    message: "Une publication doit contenir du texte, une image ou un lien."
  });

export const commentContentSchema = z
  .string()
  .trim()
  .min(1, "Le commentaire ne peut pas être vide.")
  .max(500, "Le commentaire ne peut pas dépasser 500 caractères.");

export const usernameSchema = z
  .string()
  .trim()
  .min(3, "3 caractères minimum.")
  .max(24, "24 caractères maximum.")
  .regex(/^[a-z0-9_]+$/, "Lettres minuscules, chiffres et underscore uniquement.");

export const profileUpdateSchema = z.object({
  displayName: z.string().trim().min(1).max(60),
  username: usernameSchema,
  bio: z.string().trim().max(280).optional().default(""),
  avatarUrl: z.string().trim().url().max(2048).optional().or(z.literal(""))
});
