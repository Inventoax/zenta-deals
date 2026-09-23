import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const reference = searchParams.get("reference");

    if (!reference) {
      return NextResponse.json({ error: "Missing transaction reference" }, { status: 400 });
    }

    // Verify transaction with Paystack API
    const verifyResponse = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      },
    });

    const verifyData = await verifyResponse.json();

    if (!verifyData.status || verifyData.data.status !== "success") {
      return NextResponse.json({ error: "Payment verification failed or pending" }, { status: 400 });
    }

    const txRecord = await prisma.transaction.findUnique({
      where: { reference },
    });

    if (!txRecord || txRecord.status === "COMPLETED") {
      return NextResponse.json({ message: "Transaction already processed or not found" });
    }

    const totalPaid = verifyData.data.amount / 100; // Convert from pesewas to Cedis
    
    // Deduct 2% fee, crediting 98% to the user's wallet balance
    const fee = totalPaid * 0.02;
    const amountToCredit = totalPaid - fee;
    const userId = txRecord.userId;

    // Atomically credit net user balance and mark transaction completed
    await prisma.$transaction([
      prisma.user.update({
        where: { id: userId },
        data: { balance: { increment: amountToCredit } },
      }),
      prisma.transaction.update({
        where: { reference },
        data: { 
          status: "COMPLETED",
          description: `Wallet top-up of ₵${totalPaid} (Fee: ₵${fee.toFixed(2)}, Credited: ₵${amountToCredit.toFixed(2)})`
        },
      }),
    ]);

    return NextResponse.json({ 
      success: true, 
      message: "Wallet credited successfully", 
      totalPaid,
      feeDeducted: fee,
      creditedBalance: amountToCredit 
    });
  } catch (error: any) {
    console.error("Verification error:", error);
    return NextResponse.json({ error: "Internal server error during verification", details: error.message }, { status: 500 });
  }
}