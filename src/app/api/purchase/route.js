import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request) {
  try {
    const body = await request.json();
    const { userId, network, phone, dataSize, price } = body;

    // 1. Fetch user from database to check wallet balance
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || user.walletBalance < price) {
      return NextResponse.json({ success: false, error: "Insufficient wallet balance" }, { status: 400 });
    }

    // 2. Generate a unique transaction tracking reference for Zenta Deals
    const zentaReference = `ZNT-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;

    // 3. Forward the order immediately to Inventor Datahub
    const apiResponse = await fetch("https://inventor-datahub.com", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.INVENTOR_DATAHUB_API_KEY}`,
      },
      body: JSON.stringify({
        network: network, // MTN, AT ISHARE, or TELECEL
        Phone: phone,
        Datasize: Number(dataSize),
        reference: zentaReference,
      }),
    });

    const apiData = await apiResponse.json();

    if (!apiData.success) {
      return NextResponse.json({ success: false, error: apiData.error || "Supplier API error" }, { status: 400 });
    }

    // 4. Everything matches! Safely deduct money and log the transaction in our database
    const transaction = await prisma.$transaction([
      prisma.user.update({
        where: { id: userId },
        data: { walletBalance: { decrement: price } },
      }),
      prisma.transaction.create({
        data: {
          userId: userId,
          type: "BUNDLE_PURCHASE",
          amount: price,
          phoneNumber: phone,
          dataGigabytes: Number(dataSize),
          status: "PROCESSING", // Matches the vendor's tracking state
          reference: zentaReference,
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      message: "Order placed and processing!",
      reference: zentaReference,
    });

  } catch (error) {
    console.error("Purchase route crash:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}