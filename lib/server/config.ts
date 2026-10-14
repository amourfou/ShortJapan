export const APP = "shortjapan";
export const SESSION_COOKIE = "sj_session";
/** Public sign-up is off unless ALLOW_PUBLIC_SIGNUP=1 (admins add users + PINs instead). */
export const SIGNUP_ENABLED = process.env.ALLOW_PUBLIC_SIGNUP === "1";
