import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const { userId, action, amount, description } = await request.json();

    if (!userId || !action || !amount || isNaN(amount)) {
      return NextResponse.json({ error: "Missing or invalid required fields" }, { status: 400 });
    }

    const numericAmount = parseFloat(amount);
    if (numericAmount <= 0) {
      return NextResponse.json({ error: "Amount must be greater than zero" }, { status: 400 });
    }

    // Find target user in the database
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found in database" }, { status: 404 });
    }

    // Calculate new balance
    let currentBalance = user.balance || 0;
    let newBalance = currentBalance;

    if (action === "CREDIT") {
      newBalance = currentBalance + numericAmount;
    } else if (action === "DEBIT") {
      if (currentBalance < numericAmount) {
        return NextResponse.json({ error: "User has insufficient balance for this debit" }, { status: 400 });
      }
      newBalance = currentBalance - numericAmount;
    } else {
      return NextResponse.json({ error: "Invalid action type. Must be CREDIT or DEBIT" }, { status: 400 });
    }

    // Use a transaction to update user balance and record the transaction log simultaneously
    const [updatedUser] = await prisma.$transaction([
      prisma.user.update({
        where: { id: userId },
        data: { balance: newBalance },
      }),
      prisma.transaction.create({
        data: {
          userId: userId,
          amount: numericAmount,
          type: action === "CREDIT" ? "TOPUP" : "DEBIT",
          status: "SUCCESS",
          reference: `ADMIN-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          description: description || `Admin manual wallet ${action.toLowerCase()}`,
        },
      }),
    ]);

    return NextResponse.json({
      message: `Wallet successfully ${action.toLowerCase()}ed`,
      newBalance: updatedUser.balance,
    }, { status: 200 });

  } catch (error: any) {
    console.error("Wallet adjustment error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}