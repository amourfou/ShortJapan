import { redirect } from "next/navigation";

/** Old sentence test URL → kanji hub */
export default function AdvancedTestRedirect() {
  redirect("/advanced");
}
