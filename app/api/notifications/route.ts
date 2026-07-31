import { NextResponse } from "next/server";
import { getDataSource } from "@/lib/data";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const data = getDataSource();
  const [stories, supabase] = await Promise.all([
    data.searchStories(""),
    createClient(),
  ]);

  const { data: auth } = await supabase.auth.getUser();
  let lastSeenAt: string | null = null;

  if (auth.user) {
    const { data: state } = await supabase
      .from("user_notification_state")
      .select("last_seen_at")
      .eq("user_id", auth.user.id)
      .maybeSingle();
    lastSeenAt = state?.last_seen_at ?? null;
  }

  return NextResponse.json({
    items: stories.slice(0, 30).map((story) => ({
      id: story.id,
      slug: story.slug,
      title: story.title,
      category: story.category,
      publishedAt: story.publishedAt,
      editionDate: story.editionDate,
    })),
    lastSeenAt,
  });
}

export async function POST() {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }

  const now = new Date().toISOString();
  const { error } = await supabase.from("user_notification_state").upsert(
    { user_id: auth.user.id, last_seen_at: now, updated_at: now },
    { onConflict: "user_id" },
  );
  if (error) {
    return NextResponse.json({ error: "Could not mark notifications read" }, { status: 500 });
  }
  return NextResponse.json({ lastSeenAt: now });
}
