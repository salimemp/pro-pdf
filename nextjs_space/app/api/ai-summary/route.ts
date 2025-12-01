import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Convert PDF to base64
    const arrayBuffer = await file.arrayBuffer();
    const base64String = Buffer.from(arrayBuffer).toString("base64");

    // Prepare messages for LLM
    const messages = [
      {
        role: "user",
        content: [
          {
            type: "file",
            file: {
              filename: file.name,
              file_data: `data:application/pdf;base64,${base64String}`,
            },
          },
          {
            type: "text",
            text: `Analyze this PDF document and provide a comprehensive summary in JSON format. Respond with the following structure:

{
  "quickSummary": "A concise 2-3 sentence overview of the document",
  "keyPoints": ["List of 5-7 main points or takeaways"],
  "insights": ["List of 3-5 deeper insights or implications"],
  "actionItems": ["List of 3-5 actionable next steps or recommendations"],
  "sentiment": "Overall tone: Positive/Neutral/Negative/Mixed",
  "wordCount": estimated_word_count_as_number,
  "readingTime": estimated_reading_time_in_minutes_as_number
}

Respond with raw JSON only. Do not include code blocks, markdown, or any other formatting.`,
          },
        ],
      },
    ];

    // Call LLM API with streaming
    const response = await fetch("https://apps.abacus.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.ABACUSAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        messages: messages,
        stream: true,
        max_tokens: 3000,
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      throw new Error("LLM API request failed");
    }

    // Stream response back to client
    const stream = new ReadableStream({
      async start(controller) {
        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        const encoder = new TextEncoder();

        let buffer = "";
        let partialRead = "";

        try {
          while (true) {
            const { done, value } = await reader!.read();
            if (done) break;

            partialRead += decoder.decode(value, { stream: true });
            let lines = partialRead.split("\n");
            partialRead = lines.pop() || "";

            for (const line of lines) {
              if (line.startsWith("data: ")) {
                const data = line.slice(6);
                if (data === "[DONE]") {
                  // Parse and send final result
                  const finalResult = JSON.parse(buffer);
                  const finalData = JSON.stringify({
                    status: "completed",
                    result: finalResult,
                  });
                  controller.enqueue(encoder.encode(`data: ${finalData}\n\n`));
                  return;
                }
                try {
                  const parsed = JSON.parse(data);
                  buffer += parsed.choices?.[0]?.delta?.content || "";
                  const progressData = JSON.stringify({
                    status: "processing",
                    message: "Analyzing document",
                  });
                  controller.enqueue(encoder.encode(`data: ${progressData}\n\n`));
                } catch (e) {
                  // Skip invalid JSON
                }
              }
            }
          }
        } catch (error) {
          console.error("Stream error:", error);
          const errorData = JSON.stringify({
            status: "error",
            message: "Failed to generate summary",
          });
          controller.enqueue(encoder.encode(`data: ${errorData}\n\n`));
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 });
  }
}
