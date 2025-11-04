
import { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { message, conversationHistory } = await request.json();

    // Build the messages array for the LLM
    const messages = [
      {
        role: 'system',
        content: `You are PRO PDF Assistant, a helpful and friendly AI assistant for the PRO PDF web application. 

Your purpose is to help users understand and use the PDF tools available on the website. Here are the available tools:

1. **Convert PDF**: Convert PDFs to images or extract text from PDFs
2. **Merge PDF**: Combine multiple PDF files into a single document
3. **Split PDF**: Split a PDF into separate pages or ranges
4. **Compress PDF**: Reduce PDF file size while maintaining quality
5. **Protect PDF**: Encrypt PDFs with password protection
6. **Sign PDF**: Add digital signatures to PDF documents
7. **Decrypt PDF**: Remove password protection from encrypted PDFs

Other features:
- Dark/Light theme support
- Multi-language support (English, Spanish, French, German, Italian, Chinese, Arabic, Hindi)
- Secure file processing with encryption
- User authentication and session management
- 2FA (Two-Factor Authentication) for enhanced security
- Pricing plans (Free and Pro)

When users ask questions:
- Be concise and helpful
- Guide them to the appropriate tool or page
- Explain features clearly
- If they need help with a specific tool, provide step-by-step guidance
- For technical issues, recommend checking the Help page or contacting support
- Always maintain a friendly, professional tone

Important: All PDF processing happens client-side in the browser for maximum security and privacy.`,
      },
      ...conversationHistory,
      {
        role: 'user',
        content: message,
      },
    ];

    // Call the LLM API with streaming
    const response = await fetch('https://apps.abacus.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.ABACUSAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4.1-mini',
        messages: messages,
        stream: true,
        max_tokens: 1000,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`LLM API error: ${response.statusText}`);
    }

    // Stream the response back to the client
    const stream = new ReadableStream({
      async start(controller) {
        const reader = response.body?.getReader();
        if (!reader) {
          controller.error(new Error('No reader available'));
          return;
        }

        const decoder = new TextDecoder();
        const encoder = new TextEncoder();

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            const chunk = decoder.decode(value);
            controller.enqueue(encoder.encode(chunk));
          }
        } catch (error) {
          console.error('Stream error:', error);
          controller.error(error);
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Chatbot error:', error);
    return Response.json(
      { error: 'Failed to process chat message' },
      { status: 500 }
    );
  }
}
