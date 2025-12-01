import { NextRequest, NextResponse } from 'next/server';
import { checkPasswordBreach, isCommonWeakPassword } from '@/lib/password-breach-check';

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();

    if (!password || typeof password !== 'string') {
      return NextResponse.json(
        { error: 'Password is required' },
        { status: 400 }
      );
    }

    // Check common weak passwords first (fast, local check)
    if (isCommonWeakPassword(password)) {
      return NextResponse.json({
        isCompromised: true,
        breachCount: -1, // -1 indicates common weak password
        message: 'This password is too common and easily guessed. Please choose a more unique password.',
      });
    }

    // Check against HIBP database
    const result = await checkPasswordBreach(password);

    if (result.isCompromised) {
      return NextResponse.json({
        isCompromised: true,
        breachCount: result.breachCount,
        message: `This password has been exposed in ${result.breachCount.toLocaleString()} data breaches. Please choose a different password for your security.`,
      });
    }

    return NextResponse.json({
      isCompromised: false,
      breachCount: 0,
      message: 'This password has not been found in any known data breaches.',
    });
  } catch (error) {
    console.error('Password breach check error:', error);
    // Don't block users if the check fails
    return NextResponse.json({
      isCompromised: false,
      breachCount: 0,
      message: 'Unable to verify password security at this time.',
      error: true,
    });
  }
}
