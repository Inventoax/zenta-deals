import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request) {
  try {
    const body = await request.json();
    const { userId, email, amount } = body;

    // Convert amount to Kobo/Pesewas (Paystack expects integers in minor currency units)
    const paystackAmount = Math.round(Number(amount) * 100);
    const paystackReference = `PAY-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;

    // Initialize transaction with Paystack Gateway
    const response = await fetch("https://paystack.co", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      },
      body: JSON.stringify({
        email: email,
        amount: paystackAmount,
        reference: paystackReference,
        metadata: { userId: userId },
      }),
    });

    const data = await response.json();

    if (!data.status) {
      return NextResponse.json({ success: false, error: data.message || "Paystack initialization failed" }, { status: 400 });
    }

    // Log the pending payment inside our database tracker
    await prisma.transaction.create({
      data: {
        userId: userId,
        type: "TOPUP",
        amount: Number(amount),
        status: "PENDING",
        reference: paystackReference,
      },
    });

    return NextResponse.json({
      success: true,
      authorization_url: data.data.authorization_url, // This is the link we open to show their checkout form
      reference: paystackReference,
    });

  } catch (error) {
    console.error("Paystack initialization crash:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}