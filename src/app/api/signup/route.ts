import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  try {
    const { name, email, password, phone } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json({ error: "An account with this email already exists." }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Matches your actual schema fields: balance (Float) & role (Role enum)
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        phone: phone || null,
        balance: 0.0,
        role: "USER",
      },
    });

    const { password: _, ...userWithoutPassword } = newUser;

    return NextResponse.json({
      message: "Account created successfully",
      user: userWithoutPassword,
    }, { status: 201 });

  } catch (error: any) {
    console.error("Sign up error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}