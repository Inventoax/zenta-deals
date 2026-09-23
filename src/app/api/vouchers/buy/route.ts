import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

const BASE_URL = "https://agent.inventor-datahub.com";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, voucherType, recipient, quantity = 1 } = body;

    if (!userId || !voucherType || !recipient) {
      return NextResponse.json({ error: "Missing required voucher details (userId, voucherType, recipient)" }, { status: 400 });
    }

    const upperType = voucherType.toUpperCase();
    if (upperType !== "BECE" && upperType !== "WASSCE") {
      return NextResponse.json({ error: "Invalid voucherType. Accepted values: BECE, WASSCE" }, { status: 400 });
    }

    // 1. Fetch user to check wallet balance
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const apiKey = process.env.INVENTOR_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "Server configuration error: Missing API Key" }, { status: 500 });
    }

    // 2. Submit Voucher Purchase Order to Provider API
    const purchaseRes = await fetch(`${BASE_URL}/api/developer/vouchers`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        voucherType: upperType,
        recipient,
        quantity: Number(quantity) || 1,
      }),
    });

    const purchaseData = await purchaseRes.json();

    if (!purchaseRes.ok || !purchaseData.success) {
      return NextResponse.json(
        { 
          error: "Provider failed to process voucher purchase", 
          details: purchaseData.error || purchaseData.message || "Unknown provider error" 
        }, 
        { status: 502 }
      );
    }

    const totalCost = purchaseData.data?.totalCost || 0;

    // 3. Verify user has sufficient balance before finalizing local ledger
    if (user.balance < totalCost) {
      return NextResponse.json(
        { error: `Insufficient wallet balance. Required: ₵${totalCost.toFixed(2)}, Available: ₵${user.balance.toFixed(2)}` },
        { status: 400 }
      );
    }

    // 4. Deduct user balance and record order atomically in database
    const [updatedUser, order] = await prisma.$transaction([
      prisma.user.update({
        where: { id: userId },
        data: { balance: { decrement: totalCost } },
      }),
      prisma.order.create({
        data: {
          userId,
          type: "VOUCHER_PURCHASE",
          network: upperType, // Store type in network field for tracking
          phone: recipient,
          amount: totalCost,
          description: `Purchased ${quantity}x ${upperType} Voucher(s) sent to ${recipient}`,
          status: "COMPLETED",
        },
      }),
    ]);

    return NextResponse.json({
      message: purchaseData.data?.message || "Successfully purchased voucher(s)!",
      vouchers: purchaseData.data?.vouchers || [],
      reference: purchaseData.data?.reference,
      newBalance: updatedUser.balance,
    }, { status: 200 });

  } catch (error: any) {
    console.error("Voucher purchase error:", error);
    return NextResponse.json({ error: "Internal server error during voucher purchase", details: error.message }, { status: 500 });
  }
}