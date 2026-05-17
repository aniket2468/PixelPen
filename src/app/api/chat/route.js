import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { message, articleContent, articleTitle, conversationHistory } = await request.json();

    console.log("Chat API called with:", {
      hasMessage: !!message,
      hasContent: !!articleContent,
      hasTitle: !!articleTitle,
      hasApiKey: !!process.env.XAI_API_KEY,
      contentLength: articleContent?.length || 0
    });

    if (!process.env.XAI_API_KEY) {
      return NextResponse.json(
        { error: "xAI API key not configured. Add XAI_API_KEY to your .env.local file." },
        { status: 500 }
      );
    }

    if (!message || !articleContent) {
      return NextResponse.json(
        { error: "Message and article content are required" },
        { status: 400 }
      );
    }

    // Strip HTML tags for clean context
    let textContent = articleContent
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
      .replace(/<[^>]*>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    if (textContent.length > 5000) {
      textContent = textContent.substring(0, 5000) + "...";
    }

    console.log("Extracted article text (first 200 chars):", textContent.substring(0, 200));

    // Build conversation context
    let conversationContext = "";
    if (conversationHistory && conversationHistory.length > 0) {
      conversationContext = conversationHistory
        .slice(-4)
        .map(msg => `${msg.isBot ? 'Assistant' : 'User'}: ${msg.text}`)
        .join('\n');
    }

    const messages = [
      {
        role: "system",
        content: `You are an AI assistant specialized in discussing the specific article titled "${articleTitle}".

IMPORTANT: You MUST base all your responses on the article content provided below. Always reference specific points, facts, or concepts from the article when answering questions.

ARTICLE CONTENT:
${textContent}

INSTRUCTIONS:
- Only discuss topics related to this specific article
- Quote or reference specific parts of the article when relevant
- If asked about something not covered in the article, acknowledge this and redirect back to what the article does cover
- Be conversational but always ground your responses in the article content
- Keep responses focused and under 150 words
- If the user asks general questions, relate them back to this specific article

Remember: Your knowledge is limited to what's in this article. Do not provide information from outside sources.`
      }
    ];

    if (conversationContext) {
      conversationContext.split('\n').forEach(line => {
        if (line.startsWith('User: ')) {
          messages.push({ role: "user", content: line.substring(6) });
        } else if (line.startsWith('Assistant: ')) {
          messages.push({ role: "assistant", content: line.substring(11) });
        }
      });
    }

    messages.push({ role: "user", content: message });

    console.log("Sending request to XAI with messages count:", messages.length);

    const xaiResponse = await fetch("https://api.x.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.XAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "grok-3-mini",
        messages,
        temperature: 0.3,
        max_tokens: 800,
        stream: false
      }),
    });

    console.log("XAI Response status:", xaiResponse.status);

    if (!xaiResponse.ok) {
      const errorDetails = await xaiResponse.json().catch(() => ({}));
      console.error("XAI API error:", errorDetails);
      return NextResponse.json(
        { error: errorDetails.error?.message || `xAI API error: ${xaiResponse.status}` },
        { status: xaiResponse.status }
      );
    }

    const data = await xaiResponse.json();
    console.log("XAI Response data choices:", data.choices?.length);

    const choice = data.choices?.[0];
    let response = "Sorry, I couldn't generate a response based on the article content.";

    if (choice?.message) {
      response = choice.message.content || choice.message.reasoning_content || response;

      if (response === "" && choice.message.reasoning_content) {
        response = choice.message.reasoning_content;
      }

      // Strip reasoning artifacts from grok-3-mini thinking mode
      if (response.includes("First, the user is")) {
        const lines = response.split('\n');
        response = lines.filter(line =>
          !line.includes("First, the user is") &&
          !line.includes("This seems like") &&
          !line.includes("As Grok") &&
          !line.includes("My core instructions") &&
          line.trim().length > 0
        ).join(' ').trim();
      }
    }

    console.log("Final response:", response.substring(0, 100) + "...");

    return NextResponse.json({ response });

  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: `Failed to generate response: ${error.message}` },
      { status: 500 }
    );
  }
}
