import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request) {
  try {
    const payload = await request.json();
    const { event, data } = payload;

    // We locate the order in our cloud database matching the supplier reference
    const orderRef = data.reference;

    const existingTransaction = await prisma.transaction.findUnique({
      where: { reference: orderRef },
    });

    if (!existingTransaction) {
      return NextResponse.json({ success: false, error: "Transaction not found" }, { status: 404 });
    }

    // 1. Handle Successful Delivery
    if (event === "order.completed") {
      await prisma.transaction.update({
        where: { reference: orderRef },
        data: { status: "COMPLETED" },
      });
      return NextResponse.json({ success: true, message: "Order marked completed" });
    }

    // 2. Handle Failed / Cancelled Delivery (Automate the Wallet Refund!)
    if (event === "order.failed") {
      await prisma.$transaction([
        prisma.transaction.update({
          where: { reference: orderRef },
          data: { status: "REFUNDED" },
        }),
        prisma.user.update({
          where: { id: existingTransaction.userId },
          data: { walletBalance: { increment: existingTransaction.amount } },
        }),
      ]);
      return NextResponse.json({ success: true, message: "Order failed. Funds refunded to wallet." });
    }

    return NextResponse.json({ success: true, message: "Unhandled event type received" });

  } catch (error) {
    console.error("Webhook route error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}