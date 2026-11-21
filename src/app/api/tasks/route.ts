import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { validateTaskInput } from "@/lib/task-utils";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export async function GET(req: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: "Supabase is not configured", configured: false },
      { status: 503 }
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const includeArchived = searchParams.get("archived") === "true";
  const includeDeleted = searchParams.get("deleted") === "true";

  let query = supabase
    .from("tasks")
    .select(`
      *,
      category:categories(*),
      tags:task_tags(tag:tags(*))
    `)
    .eq("user_id", user.id);

  if (includeDeleted) {
    query = query.not("deleted_at", "is", null);
  } else {
    query = query.is("deleted_at", null);
    if (includeArchived) {
      query = query.not("archived_at", "is", null);
    } else {
      query = query.is("archived_at", null);
      if (status && status !== "all") {
        query = query.eq("status", status as any);
      }
    }
  }

  query = query.order("created_at", { ascending: false });

  const { data, error } = await query;

  if (error) {
    if (
      (error as any).code === "PGRST205" ||
      error.message?.includes("schema cache") ||
      error.message?.includes("Could not find the table")
    ) {
      return NextResponse.json(
        {
          error: "Database tables have not been created yet in Supabase.",
          code: "TABLES_NOT_FOUND",
          tasks: [],
        },
        { status: 503 }
      );
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Format tags array cleanly
  const formattedTasks = ((data as any[]) || []).map((t: any) => ({
    ...t,
    tags: (t.tags || []).map((item: any) => item.tag).filter(Boolean),
  }));

  return NextResponse.json({ tasks: formattedTasks });
}

export async function POST(req: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: "Supabase is not configured", configured: false },
      { status: 503 }
    );
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
    const body = await req.json();
    const validation = validateTaskInput(body);

    if (!validation.valid) {
      return NextResponse.json({ errors: validation.errors }, { status: 400 });
    }

    const {
      title,
      url,
      hostname,
      favicon_url,
      description,
      notes,
      status = "todo",
      priority = "medium",
      category_id,
      due_date,
      tag_ids = [],
    } = body;

    const { data: task, error: insertError } = await supabase
      .from("tasks")
      .insert({
        user_id: user.id,
        title: title.trim(),
        url: url?.trim() || null,
        hostname: hostname?.trim() || null,
        favicon_url: favicon_url || null,
        description: description?.trim() || null,
        notes: notes?.trim() || null,
        status,
        priority,
        category_id: category_id || null,
        due_date: due_date || null,
        completed_at: status === "completed" ? new Date().toISOString() : null,
      })
      .select(`
        *,
        category:categories(*)
      `)
      .single();

    if (insertError || !task) {
      if (
        insertError?.code === "PGRST205" ||
        insertError?.message?.includes("schema cache") ||
        insertError?.message?.includes("Could not find the table")
      ) {
        return NextResponse.json(
          {
            error:
              "Database table 'public.tasks' was not found in Supabase. Please execute the migration SQL in your Supabase SQL Editor (supabase/migrations/20261029000000_taskvault_schema.sql).",
            code: "TABLES_NOT_FOUND",
          },
          { status: 503 }
        );
      }
      return NextResponse.json({ error: insertError?.message || "Failed to insert task" }, { status: 500 });
    }

    const createdTask = task as any;

    // Associate tags if provided
    if (Array.isArray(tag_ids) && tag_ids.length > 0) {
      const taskTagsPayload = tag_ids.map((tagId: string) => ({
        task_id: createdTask.id,
        tag_id: tagId,
      }));
      await supabase.from("task_tags").insert(taskTagsPayload as any);
    }

    // Re-fetch complete task with tags
    const { data: completeTask } = await supabase
      .from("tasks")
      .select(`
        *,
        category:categories(*),
        tags:task_tags(tag:tags(*))
      `)
      .eq("id", createdTask.id)
      .single();

    const fetchedTask = completeTask as any;

    const formattedTask = {
      ...fetchedTask,
      tags: (fetchedTask?.tags || []).map((item: any) => item.tag).filter(Boolean),
    };

    return NextResponse.json({ task: formattedTask }, { status: 201 });
  } catch (_err) {
    return NextResponse.json({ error: "Invalid request payload" }, { status: 400 });
  }
}
