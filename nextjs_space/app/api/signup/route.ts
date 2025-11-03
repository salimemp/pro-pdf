
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

// Email validation regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Password validation: min 8 chars, at least 1 letter and 1 number
const PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/;

function sanitizeInput(input: string): string {
  return input.trim().replace(/[<>]/g, '');
}

function validateEmail(email: string): boolean {
  return EMAIL_REGEX.test(email) && email.length <= 255;
}

function validatePassword(password: string): boolean {
  return PASSWORD_REGEX.test(password) && password.length >= 8 && password.length <= 128;
}

function validateName(name: string): boolean {
  return name.length >= 1 && name.length <= 100 && /^[a-zA-Z\s'-]+$/.test(name);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, firstName, lastName, acceptTerms } = body;

    // Validate required fields
    if (!email || !password || !firstName || !lastName || !acceptTerms) {
      return NextResponse.json(
        { error: "All fields are required and terms must be accepted" },
        { status: 400 }
      );
    }

    // Validate email format
    if (!validateEmail(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Validate password strength
    if (!validatePassword(password)) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters long and contain at least one letter and one number" },
        { status: 400 }
      );
    }

    // Validate names
    if (!validateName(firstName)) {
      return NextResponse.json(
        { error: "First name contains invalid characters or is too long" },
        { status: 400 }
      );
    }

    if (!validateName(lastName)) {
      return NextResponse.json(
        { error: "Last name contains invalid characters or is too long" },
        { status: 400 }
      );
    }

    // Sanitize inputs
    const sanitizedEmail = sanitizeInput(email.toLowerCase());
    const sanitizedFirstName = sanitizeInput(firstName);
    const sanitizedLastName = sanitizeInput(lastName);

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: {
        email: sanitizedEmail,
      },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 400 }
      );
    }

    // Hash password with strong cost factor
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user with sanitized inputs
    const user = await prisma.user.create({
      data: {
        email: sanitizedEmail,
        password: hashedPassword,
        firstName: sanitizedFirstName,
        lastName: sanitizedLastName,
        name: `${sanitizedFirstName} ${sanitizedLastName}`,
      },
    });

    return NextResponse.json(
      {
        message: "User created successfully",
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
