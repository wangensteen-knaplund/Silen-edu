import { NextRequest, NextResponse } from "next/server";
import { generateQuiz } from "@/lib/ai";
import { supabase } from "@/lib/supabaseClient";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { content, noteId, numQuestions = 5 } = body;

    if (!content) {
      return NextResponse.json(
        { error: "Content is required" },
        { status: 400 }
      );
    }

    // Generate quiz using AI
    const quiz = await generateQuiz({ content, numQuestions });

    // Save to ai_history if noteId is provided
    if (noteId) {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        await supabase.from("ai_history").insert({
          user_id: user.id,
          note_id: noteId,
          type: "quiz",
          result: { quiz },
        });
      }
    }

    return NextResponse.json({ quiz });
  } catch (error: any) {
    console.error("Error generating quiz:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate quiz" },
      { status: 500 }
    );
  }
}
