import { redirect } from "next/navigation";

/** Old sentence practice URL → kanji hub */
export default function AdvancedPracticeRedirect() {
  redirect("/advanced");
}
