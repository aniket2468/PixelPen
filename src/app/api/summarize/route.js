import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const body = await req.json();
    const { articleText } = body;

    if (!articleText) {
      return NextResponse.json({ error: "Article text is required" }, { status: 400 });
    }

    // Check if XAI_API_KEY is available
    if (!process.env.XAI_API_KEY) {
      console.error("XAI_API_KEY is not set in environment variables");
      return NextResponse.json({ error: "API key not configured" }, { status: 500 });
    }

    // Use the xAI API for summarization with grok-3-mini-beta model
    const xaiResponse = await fetch("https://api.x.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.XAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "grok-3-mini",
        messages: [
          {
            role: "system",
            content: "You are a helpful assistant that summarizes articles. Provide a concise, informative summary that captures the main points. Your summary MUST NOT exceed 120 words."
          },
          {
            role: "user",
            content: `Please summarize the following article in no more than 120 words:\n\n${articleText}`
          }
        ],
        temperature: 0.3,
        stream: false
      }),
    });

    if (!xaiResponse.ok) {
      const errorDetails = await xaiResponse.json().catch(() => ({}));
      console.error("xAI API error:", errorDetails);
      return NextResponse.json({ 
        error: errorDetails.error?.message || "xAI API error", 
        status: xaiResponse.status 
      }, { status: xaiResponse.status });
    }

    const data = await xaiResponse.json();
    let summary = data.choices?.[0]?.message?.content || "Could not generate summary";
    
    // Remove any word count information from the summary
    summary = summary.replace(/\(?\d+\s*words?\)?/gi, '');
    summary = summary.replace(/Word count:?\s*\d+/gi, '');
    summary = summary.replace(/Summary length:?\s*\d+\s*words?/gi, '');
    
    // Ensure the summary doesn't exceed 120 words
    const words = summary.split(/\s+/);
    if (words.length > 120) {
      summary = words.slice(0, 120).join(' ') + '...';
    }

    return NextResponse.json({ summary });
  } catch (error) {
    console.error("Summarization error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// Improved summarization function
function generateSummary(text) {
  // Remove HTML tags if present
  const cleanText = text.replace(/<[^>]*>/g, ' ');
  // Split into sentences
  const sentences = cleanText.split(/[.!?]+/).filter(sentence => sentence.trim().length > 0);
  
  // If text is too short, return it as is
  if (sentences.length <= 3) {
    return cleanText;
  }
  
  // Calculate sentence importance based on position and length
  const sentenceScores = sentences.map((sentence, index) => {
    // Position score (first and last sentences are more important)
    const positionScore = index === 0 || index === sentences.length - 1 ? 0.5 : 0.1;
    
    // Length score (medium-length sentences are better)
    const words = sentence.trim().split(/\s+/).length;
    const lengthScore = words >= 10 && words <= 30 ? 0.3 : 0.1;
    
    // Keyword score (sentences with important words are better)
    const importantWords = ['important', 'key', 'significant', 'conclusion', 'summary', 'result', 'finding', 'study', 'research', 'data'];
    const keywordScore = importantWords.some(word => 
      sentence.toLowerCase().includes(word)
    ) ? 0.4 : 0;
    
    return {
      sentence,
      score: positionScore + lengthScore + keywordScore
    };
  });
  
  // Sort sentences by score
  sentenceScores.sort((a, b) => b.score - a.score);
  
  // Take top 3 sentences
  const topSentences = sentenceScores.slice(0, 3).map(item => item.sentence.trim());
  
  // Sort them by original position
  const originalIndices = topSentences.map(sentence => 
    sentences.findIndex(s => s.trim() === sentence)
  );
  
  const sortedIndices = [...originalIndices].sort((a, b) => a - b);
  const finalSentences = sortedIndices.map(index => sentences[index].trim());
  
  // Combine the sentences
  return finalSentences.join('. ') + '.';
}
