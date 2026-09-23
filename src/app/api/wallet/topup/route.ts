import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, amount } = body;

    if (!userId || !amount || amount <= 0) {
      return NextResponse.json(
        { error: "Invalid user ID or top-up amount" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const reference = `TOPUP_${userId}_${Date.now()}`;
    const amountInPesewas = Math.round(Number(amount) * 100); // Paystack uses pesewas/subunits

    // 1. Initialize transaction with Paystack API
    const paystackResponse = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: user.email,
        amount: amountInPesewas,
        reference,
        callback_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/dashboard`,
        metadata: {
          userId,
          type: "WALLET_TOPUP"
        }
      }),
    });

    const paystackData = await paystackResponse.json();

    if (!paystackData.status) {
      return NextResponse.json(
        { error: "Failed to initialize Paystack checkout", details: paystackData.message },
        { status: 400 }
      );
    }

    // 2. Log pending transaction in database
    await prisma.transaction.create({
      data: {
        userId,
        amount: Number(amount),
        type: "TOPUP",
        status: "PENDING",
        reference,
        description: `Wallet top-up of ₵${amount}`,
      },
    });

    return NextResponse.json({
      success: true,
      authorizationUrl: paystackData.data.authorization_url,
      reference,
    });
  } catch (error: any) {
    console.error("Top-up initialization error:", error);
    return NextResponse.json(
      { error: "Server error during top-up initialization", details: error.message },
      { status: 500 }
    );
  }
}