import { supabaseServer } from "@/lib/supabase-server";
import { NextRequest, NextResponse } from "next/server";

// GET - Fetch all weekly values
export async function GET() {
  try {
    const { data, error } = await supabaseServer
      .from("weekly_portfolio_values")
      .select("*")
      .order("date", { ascending: false });

    if (error) {
      console.error("Supabase select error:", error);
      return NextResponse.json({ error: "Failed to fetch weekly values", details: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST - Create a new weekly value
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { value, date } = body;

    // Validation
    if (value === undefined || !date) {
      return NextResponse.json({ error: "Missing required fields: value and date are required" }, { status: 400 });
    }

    const { data, error } = await supabaseServer
      .from("weekly_portfolio_values")
      .insert([{ value, date }])
      .select()
      .single();

    if (error) {
      console.error("Supabase insert error:", error);
      return NextResponse.json({ error: "Failed to create weekly value", details: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
}

// PATCH - Update a weekly value
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, value, date } = body;

    // Validation
    if (!id || value === undefined || !date) {
      return NextResponse.json({ error: "Missing required fields: id, value, and date are required" }, { status: 400 });
    }

    const { data, error } = await supabaseServer
      .from("weekly_portfolio_values")
      .update({ value, date })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Supabase update error:", error);
      return NextResponse.json({ error: "Failed to update weekly value", details: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
}

// DELETE - Delete a weekly value
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    // Validation
    if (!id) {
      return NextResponse.json({ error: "Missing 'id' query parameter" }, { status: 400 });
    }

    const { error } = await supabaseServer
      .from("weekly_portfolio_values")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Supabase delete error:", error);
      return NextResponse.json({ error: "Failed to delete weekly value", details: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
