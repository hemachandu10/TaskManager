import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { validateTaskInput } from "@/lib/task-utils";
import { isSupabaseConfigured } from "@/lib/supabase/config";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
  }

  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: task, error } = await supabase
    .from("tasks")
    .select(`
      *,
      category:categories(*),
      tags:task_tags(tag:tags(*))
    `)
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (error || !task) {
    return NextResponse.json({ error: "Task not found" }, { status: 404 });
  }

  const taskObj = task as any;
  const formattedTask = {
    ...taskObj,
    tags: (taskObj.tags || []).map((item: any) => item.tag).filter(Boolean),
  };

  return NextResponse.json({ task: formattedTask });
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
  }

  const { id } = await params;
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

    // Partial validation if title or url are provided
    if (body.title !== undefined || body.url !== undefined) {
      const validation = validateTaskInput({
        title: body.title ?? "Valid Existing Title",
        url: body.url,
        priority: body.priority,
        status: body.status,
      });

      if (!validation.valid) {
        return NextResponse.json({ errors: validation.errors }, { status: 400 });
      }
    }

    const updates: Record<string, any> = {};

    if (body.title !== undefined) updates.title = body.title.trim();
    if (body.url !== undefined) updates.url = body.url ? body.url.trim() : null;
    if (body.hostname !== undefined) updates.hostname = body.hostname ? body.hostname.trim() : null;
    if (body.favicon_url !== undefined) updates.favicon_url = body.favicon_url;
    if (body.description !== undefined) updates.description = body.description ? body.description.trim() : null;
    if (body.notes !== undefined) updates.notes = body.notes;
    if (body.priority !== undefined) updates.priority = body.priority;
    if (body.category_id !== undefined) updates.category_id = body.category_id || null;
    if (body.due_date !== undefined) updates.due_date = body.due_date || null;

    // Status transition handling
    if (body.status !== undefined) {
      updates.status = body.status;
      if (body.status === "completed") {
        updates.completed_at = new Date().toISOString();
      } else {
        updates.completed_at = null;
      }
    }

    // Lifecycle actions: archive, restore, trash, undo
    if (body.archived_at !== undefined) {
      updates.archived_at = body.archived_at;
    }
    if (body.deleted_at !== undefined) {
      updates.deleted_at = body.deleted_at;
    }

    // Perform task update
    const { data: updatedTask, error: updateError } = await supabase
      .from("tasks")
      .update(updates as any)
      .eq("id", id)
      .eq("user_id", user.id)
      .select(`
        *,
        category:categories(*)
      `)
      .single();

    if (updateError || !updatedTask) {
      return NextResponse.json({ error: updateError?.message || "Task not found" }, { status: 404 });
    }

    // Update tags if tag_ids was passed
    if (body.tag_ids !== undefined && Array.isArray(body.tag_ids)) {
      // Remove existing task tags
      await supabase.from("task_tags").delete().eq("task_id", id);

      // Re-insert new tag associations
      if (body.tag_ids.length > 0) {
        const taskTagsPayload = body.tag_ids.map((tagId: string) => ({
          task_id: id,
          tag_id: tagId,
        }));
        await supabase.from("task_tags").insert(taskTagsPayload as any);
      }
    }

    // Fetch refreshed task
    const { data: completeTask } = await supabase
      .from("tasks")
      .select(`
        *,
        category:categories(*),
        tags:task_tags(tag:tags(*))
      `)
      .eq("id", id)
      .single();

    const completeObj = completeTask as any;
    const formattedTask = {
      ...completeObj,
      tags: (completeObj?.tags || []).map((item: any) => item.tag).filter(Boolean),
    };

    return NextResponse.json({ task: formattedTask });
  } catch (_err) {
    return NextResponse.json({ error: "Failed to update task" }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
  }

  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Permanently delete task
  const { error } = await supabase
    .from("tasks")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, message: "Task permanently deleted" });
}
