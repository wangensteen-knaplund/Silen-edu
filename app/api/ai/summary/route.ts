import { NextRequest, NextResponse } from "next/server";
import { generateSummary } from "@/lib/ai";
import { supabase } from "@/lib/supabaseClient";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { content, noteId } = body;

    if (!content) {
      return NextResponse.json(
        { error: "Content is required" },
        { status: 400 }
      );
    }

    // Generate summary using AI
    const summary = await generateSummary({ content, type: "long" });

    // Save to ai_history if noteId is provided
    if (noteId) {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        await supabase.from("ai_history").insert({
          user_id: user.id,
          note_id: noteId,
          type: "summary",
          result: { summary },
        });
      }
    }

    return NextResponse.json({ summary });
  } catch (error: any) {
    console.error("Error generating summary:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate summary" },
      { status: 500 }
    );
  }
}
