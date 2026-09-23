import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";

export async function GET() {
  try {
    const plans = await prisma.dataPlan.findMany();
    return NextResponse.json(plans);
  } catch (error: any) {
    console.error("Error fetching data plans:", error);
    return NextResponse.json(
      { error: "Failed to fetch plans", details: error.message },
      { status: 500 }
    );
  }
}