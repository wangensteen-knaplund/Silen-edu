// AI utility functions for OpenAI/Azure integration

interface SummaryRequest {
  content: string;
  type?: "short" | "long";
}

interface QuizRequest {
  content: string;
  numQuestions?: number;
}

export async function generateSummary(
  request: SummaryRequest
): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;
  
  if (!apiKey) {
    throw new Error("OpenAI API key not configured");
  }

  const prompt =
    request.type === "short"
      ? `Lag et kort sammendrag (2-3 setninger) av følgende notat:\n\n${request.content}`
      : `Lag et detaljert sammendrag av følgende notat:\n\n${request.content}`;

  // This is a placeholder for actual OpenAI integration
  // You'll need to implement the actual API call here
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to generate summary");
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

export async function generateQuiz(request: QuizRequest): Promise<any> {
  const apiKey = process.env.OPENAI_API_KEY;
  
  if (!apiKey) {
    throw new Error("OpenAI API key not configured");
  }

  const numQuestions = request.numQuestions || 5;
  const prompt = `Basert på følgende notat, lag ${numQuestions} flervalgs spørsmål med 4 alternativer hver. Returner som JSON array med format: [{"question": "...", "options": ["A", "B", "C", "D"], "correct": 0}]\n\n${request.content}`;

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to generate quiz");
  }

  const data = await response.json();
  const content = data.choices[0].message.content;
  
  try {
    return JSON.parse(content);
  } catch {
    return { questions: [], error: "Failed to parse quiz data" };
  }
}
