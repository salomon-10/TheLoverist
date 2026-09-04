import "server-only";
import { StackServerApp } from "@stackframe/stack";

/**
 * Instance serveur de Stack Auth.
 * `tokenStore: "nextjs-cookie"` lit la session depuis les cookies de la requête —
 * c'est la source de vérité pour savoir si un visiteur est connecté.
 *
 * Variables requises (voir .env.example) :
 *   NEXT_PUBLIC_STACK_PROJECT_ID
 *   NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY
 *   STACK_SECRET_SERVER_KEY
 */
export const stackServerApp = new StackServerApp({
  tokenStore: "nextjs-cookie",
  urls: {
    signIn: "/login",
    signUp: "/register",
    afterSignIn: "/",
    afterSignUp: "/",
    afterSignOut: "/"
  }
});
