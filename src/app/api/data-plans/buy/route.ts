import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

const BASE_URL = "https://agent.inventor-datahub.com";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, planId, phone, isAgent } = body;

    if (!userId || !planId || !phone) {
      return NextResponse.json({ error: "Missing required purchase details (userId, planId, phone)" }, { status: 400 });
    }

    // 1. Fetch user and data plan
    const [user, plan] = await Promise.all([
      prisma.user.findUnique({ where: { id: userId } }),
      prisma.dataPlan.findUnique({ where: { id: planId } }),
    ]);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (!plan || !plan.active) {
      return NextResponse.json({ error: "Selected data plan is invalid or inactive" }, { status: 404 });
    }

    // 2. Determine price based on user role
    const priceToCharge = isAgent ? plan.agentPrice : plan.customerPrice;

    // 3. Check user balance first
    if (user.balance < priceToCharge) {
      return NextResponse.json(
        { error: `Insufficient wallet balance. Required: ₵${priceToCharge.toFixed(2)}, Available: ₵${user.balance.toFixed(2)}` },
        { status: 400 }
      );
    }

    const apiKey = process.env.INVENTOR_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "Server configuration error: Missing API Key" }, { status: 500 });
    }

    // 4. If network is MTN, verify the number first as recommended by docs
    const isMtn = plan.network.toUpperCase().includes("MTN");
    if (isMtn) {
      try {
        const verifyRes = await fetch(`${BASE_URL}/api/developer/verify-number`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apiKey}`,
          },
          body: JSON.stringify({ phone }),
        });
        const verifyData = await verifyRes.json();

        // If not eligible, automatically try submitting the number to their beneficiary list
        if (!verifyRes.ok || !verifyData.data?.exists) {
          await fetch(`${BASE_URL}/api/developer/submit-numbers`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${apiKey}`,
            },
            body: JSON.stringify({ numbers: [phone] }),
          });
        }
      } catch (err) {
        console.error("Number verification/submission warning:", err);
      }
    }

    // 5. Parse data size in GB (e.g. "1GB" or "1.5" -> number)
    const sizeNumericMatch = plan.size.match(/(\d+(\.\d+)?)/);
    const dataSizeGB = sizeNumericMatch ? parseFloat(sizeNumericMatch[0]) : 1;

    // Generate unique internal reference for tracking
    const customReference = `zenta_${crypto.randomBytes(6).toString("hex")}`;

    // 6. Submit Purchase Order to Provider API
    const purchaseRes = await fetch(`${BASE_URL}/api/developer/purchase`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        network: plan.network.toUpperCase().includes("MTN") ? "MTN" : plan.network,
        Phone: phone,
        Datasize: dataSizeGB,
        reference: customReference,
      }),
    });

    const purchaseData = await purchaseRes.json();

    if (!purchaseRes.ok || !purchaseData.success) {
      return NextResponse.json(
        { 
          error: "Provider failed to process data purchase", 
          details: purchaseData.error || purchaseData.message || "Unknown provider error" 
        }, 
        { status: 502 }
      );
    }

    // 7. Deduct user balance and record order atomically in database
    const [updatedUser, order] = await prisma.$transaction([
      prisma.user.update({
        where: { id: userId },
        data: { balance: { decrement: priceToCharge } },
      }),
      prisma.order.create({
        data: {
          userId,
          planId,
          type: "DATA_PURCHASE",
          network: plan.network,
          phone,
          amount: priceToCharge,
          description: `Purchased ${plan.name} (${plan.size}) for ${phone}`,
          status: purchaseData.data?.order?.status || "PROCESSING",
        },
      }),
    ]);

    return NextResponse.json({
      message: "Data purchase submitted successfully!",
      order,
      providerRef: purchaseData.data?.order?.reference || customReference,
      newBalance: updatedUser.balance,
    }, { status: 200 });

  } catch (error: any) {
    console.error("Purchase processing exception:", error);
    return NextResponse.json({ error: "Internal server error during purchase", details: error.message }, { status: 500 });
  }
}