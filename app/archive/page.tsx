import { redirect } from "next/navigation";

/** Old path — keep so bookmarks / external links still work. */
export default function ArchiveRedirectPage() {
  redirect("/calendar");
}
