import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const DATAHUB_BASE_URL = "https://agent.inventor-datahub.com";
const DATAHUB_API_KEY = process.env.DATAHUB_API_KEY || ""; // Make sure to add your API key to .env

export async function POST(request: Request) {
  try {
    const { userId, network, phone, datasize, planId } = await request.json();

    if (!userId || !network || !phone || !datasize) {
      return NextResponse.json({ error: "Missing required purchase fields" }, { status: 400 });
    }

    // 1. Fetch user from database to check balance
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json({ error: "User account not found" }, { status: 404 });
    }

    // Determine cost based on DataPlan model if planId is provided, or calculate estimate
    let orderAmount = datasize * 3.5; // fallback base calculation per GB if plan missing
    let selectedPlanName = `${datasize}GB ${network} Data`;

    if (planId) {
      const plan = await prisma.dataPlan.findUnique({ where: { id: planId } });
      if (plan) {
        orderAmount = user.role === "AGENT" ? plan.agentPrice : plan.customerPrice;
        selectedPlanName = plan.name;
      }
    }

    if (user.balance < orderAmount) {
      return NextResponse.json({ 
        error: `Insufficient wallet balance. Required: ₵${orderAmount.toFixed(2)}, Available: ₵${user.balance.toFixed(2)}` 
      }, { status: 400 });
    }

    // 2. If network is MTN, run Provider Verification & Auto-Submission workflow
    if (network.toUpperCase() === "MTN") {
      try {
        // Verify number first
        const verifyRes = await fetch(`${DATAHUB_BASE_URL}/api/developer/verify-number`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${DATAHUB_API_KEY}`,
          },
          body: JSON.stringify({ phone, is_ported_number: false }),
        });

        const verifyData = await verifyRes.json();

        // If number is not on beneficiary list, auto-submit it
        if (!verifyRes.ok || !verifyData?.data?.exists) {
          await fetch(`${DATAHUB_BASE_URL}/api/developer/submit-numbers`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${DATAHUB_API_KEY}`,
            },
            body: JSON.stringify({ numbers: phone }),
          });
        }
      } catch (err) {
        console.warn("Auto-verification/submission warning:", err);
        // Continue with purchase attempt even if pre-check encounters network blip
      }
    }

    // 3. Make Purchase Request to Inventor Datahub API
    const customRef = `ZENTA-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    
    const purchaseRes = await fetch(`${DATAHUB_BASE_URL}/api/developer/purchase`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${DATAHUB_API_KEY}`,
      },
      body: JSON.stringify({
        network: network.toUpperCase(),
        Phone: phone,
        Datasize: Number(datasize),
        reference: customRef,
      }),
    });

    const purchaseData = await purchaseRes.json();

    if (!purchaseRes.ok || !purchaseData.success) {
      return NextResponse.json({ 
        error: purchaseData.error || purchaseData.message || "Provider failed to process data purchase" 
      }, { status: 400 });
    }

    // 4. Deduct user balance and create database order & transaction records simultaneously
    const newBalance = user.balance - orderAmount;

    const [updatedUser, order] = await prisma.$transaction([
      prisma.user.update({
        where: { id: userId },
        data: { balance: newBalance },
      }),
      prisma.order.create({
        data: {
          userId: userId,
          type: "DATA",
          network: network.toUpperCase(),
          phone: phone,
          amount: orderAmount,
          planId: planId || null,
          description: `Purchased ${selectedPlanName} for ${phone}`,
          status: "SUCCESS",
        },
      }),
      prisma.transaction.create({
        data: {
          userId: userId,
          amount: orderAmount,
          type: "PURCHASE",
          status: "SUCCESS",
          reference: customRef,
          description: `Data purchase: ${selectedPlanName}`,
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      message: `Successfully purchased ${selectedPlanName}!`,
      newBalance: updatedUser.balance,
      orderId: order.id,
      providerResponse: purchaseData.data,
    }, { status: 200 });

  } catch (error: any) {
    console.error("Purchase processing error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}