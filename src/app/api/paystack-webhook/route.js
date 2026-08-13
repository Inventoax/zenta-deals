import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request) {
  try {
    const payload = await request.json();
    const { event, data } = payload;

    // Check if the payment transaction is fully successful
    if (event === "charge.success") {
      const paystackRef = data.reference;
      const actualAmountGHC = data.amount / 100; // Convert minor units back to standard format
      const userId = data.metadata?.userId;

      const existingTx = await prisma.transaction.findUnique({
        where: { reference: paystackRef },
      });

      // Avoid double-crediting balances if webhook triggers twice
      if (existingTx && existingTx.status === "PENDING") {
        await prisma.$transaction([
          prisma.transaction.update({
            where: { reference: paystackRef },
            data: { status: "COMPLETED" },
          }),
          prisma.user.update({
            where: { id: userId },
            data: { walletBalance: { increment: actualAmountGHC } },
          }),
        ]);
      }
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("Paystack webhook error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}