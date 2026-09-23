import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, network, size, validity, description, customerPrice, agentPrice, active } = body;

    if (!name || !network || !size || customerPrice === undefined || agentPrice === undefined) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const newPlan = await prisma.dataPlan.create({
      data: {
        name,
        network,
        size,
        validity: validity || "Non Expiry",
        description,
        customerPrice: parseFloat(customerPrice),
        agentPrice: parseFloat(agentPrice),
        active: active ?? true,
      },
    });

    return NextResponse.json(newPlan, { status: 201 });
  } catch (error: any) {
    console.error("Error creating data plan:", error);
    return NextResponse.json({ error: "Failed to create data plan", details: error.message }, { status: 500 });
  }
}