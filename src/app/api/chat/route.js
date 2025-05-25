import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { message, articleContent, articleTitle, conversationHistory } = await request.json();

    // Debug logging
    console.log("Chat API called with:", { 
      hasMessage: !!message, 
      hasContent: !!articleContent, 
      hasTitle: !!articleTitle,
      hasApiKey: !!process.env.XAI_API_KEY,
      contentLength: articleContent?.length || 0
    });

    if (!process.env.XAI_API_KEY) {
      console.error("XAI_API_KEY is not set in environment variables");
      return NextResponse.json(
        { error: "API key not configured" },
        { status: 500 }
      );
    }

    if (!message || !articleContent) {
      return NextResponse.json(
        { error: "Message and article content are required" },
        { status: 400 }
      );
    }

    // Better HTML extraction - preserve structure while removing tags
    let textContent = articleContent
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove scripts
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '') // Remove styles
      .replace(/<[^>]*>/g, ' ') // Remove HTML tags
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();

    // Take more content for better context (5000 chars instead of 3000)
    if (textContent.length > 5000) {
      textContent = textContent.substring(0, 5000) + "...";
    }

    console.log("Extracted article text (first 200 chars):", textContent.substring(0, 200));

    // Build conversation context
    let conversationContext = "";
    if (conversationHistory && conversationHistory.length > 0) {
      conversationContext = conversationHistory
        .slice(-4) // Reduced to keep focus on article, not conversation
        .map(msg => `${msg.isBot ? 'Assistant' : 'User'}: ${msg.text}`)
        .join('\n');
    }

    // Prepare messages for XAI API with improved system prompt
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

    // Add conversation history (reduced to maintain article focus)
    if (conversationContext) {
      const historyLines = conversationContext.split('\n');
      historyLines.forEach(line => {
        if (line.startsWith('User: ')) {
          messages.push({
            role: "user",
            content: line.substring(6)
          });
        } else if (line.startsWith('Assistant: ')) {
          messages.push({
            role: "assistant",
            content: line.substring(11)
          });
        }
      });
    }

    // Add current user message
    messages.push({
      role: "user",
      content: message
    });

    console.log("Sending request to XAI with messages count:", messages.length);

    const requestBody = {
      model: "grok-3-mini",
      messages: messages,
      temperature: 0.3, // Lower temperature for more focused responses
      max_tokens: 800,
      stream: false
    };

    const xaiResponse = await fetch("https://api.x.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.XAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    console.log("XAI Response status:", xaiResponse.status);

    if (!xaiResponse.ok) {
      const errorDetails = await xaiResponse.json().catch(() => ({}));
      console.error("XAI API error details:", errorDetails);
      console.error("XAI Response status:", xaiResponse.status);
      console.error("XAI Response statusText:", xaiResponse.statusText);
      
      return NextResponse.json({ 
        error: errorDetails.error?.message || `XAI API error: ${xaiResponse.status} ${xaiResponse.statusText}`, 
        status: xaiResponse.status,
        details: errorDetails
      }, { status: xaiResponse.status });
    }

    const data = await xaiResponse.json();
    console.log("XAI Response data choices:", data.choices?.length);
    
    // Handle new XAI response structure - content might be in reasoning_content
    const choice = data.choices?.[0];
    let response = "Sorry, I couldn't generate a response based on the article content.";
    
    if (choice && choice.message) {
      // Try content first, then reasoning_content as fallback
      response = choice.message.content || 
                choice.message.reasoning_content || 
                "Sorry, I couldn't generate a response based on the article content.";
      
      // If response is empty string, try reasoning_content
      if (response === "" && choice.message.reasoning_content) {
        response = choice.message.reasoning_content;
      }
      
      // Clean up the response - remove reasoning artifacts
      if (response.includes("First, the user is")) {
        // This indicates reasoning content, extract the actual response
        const lines = response.split('\n');
        const responseLines = lines.filter(line => 
          !line.includes("First, the user is") && 
          !line.includes("This seems like") &&
          !line.includes("As Grok") &&
          !line.includes("My core instructions") &&
          line.trim().length > 0
        );
        response = responseLines.join(' ').trim();
      }
    }

    console.log("Final response:", response.substring(0, 100) + "...");

    return NextResponse.json({ response });

  } catch (error) {
    console.error("Chat API error:", error);
    console.error("Error stack:", error.stack);
    
    if (error.message?.includes("API key")) {
      return NextResponse.json(
        { error: "API key not configured" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: `Failed to generate response: ${error.message}` },
      { status: 500 }
    );
  }
} 