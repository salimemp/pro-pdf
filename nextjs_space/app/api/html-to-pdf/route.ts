import { NextRequest, NextResponse } from 'next/server';

// This API endpoint is deprecated - HTML to PDF conversion is now done client-side
// We keep this endpoint for backward compatibility but return an error
export async function POST(request: NextRequest) {
  return NextResponse.json(
    { error: 'HTML to PDF conversion is now handled client-side. Please use the tool directly.' },
    { status: 400 }
  );
}
