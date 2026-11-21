import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export async function GET() {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ tags: [] });
  }

  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("tags")
    .select("*")
    .eq("user_id", user.id)
    .order("name", { ascending: true });

  if (error) {
    if (
      (error as any).code === "PGRST205" ||
      error.message?.includes("schema cache") ||
      error.message?.includes("Could not find the table")
    ) {
      return NextResponse.json({ tags: [], code: "TABLES_NOT_FOUND" });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ tags: data || [] });
}

export async function POST(req: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
  }

  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { name } = await req.json();

    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json({ error: "Tag name is required" }, { status: 400 });
    }

    const cleanName = name.trim().toLowerCase().replace(/^#/, "");

    const { data, error } = await supabase
      .from("tags")
      .insert({
        user_id: user.id,
        name: cleanName,
      })
      .select("*")
      .single();

    if (error) {
      if (error.code === "23505") {
        // Tag already exists, fetch it
        const { data: existingTag } = await supabase
          .from("tags")
          .select("*")
          .eq("user_id", user.id)
          .eq("name", cleanName)
          .single();
        return NextResponse.json({ tag: existingTag }, { status: 200 });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ tag: data }, { status: 201 });
  } catch (_err) {
    return NextResponse.json({ error: "Invalid request payload" }, { status: 400 });
  }
}
