import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// PATCH: Update data plan prices
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { customerPrice, agentPrice } = body;

    const updatedPlan = await prisma.dataPlan.update({
      where: { id },
      data: {
        ...(customerPrice !== undefined && { customerPrice: parseFloat(customerPrice) }),
        ...(agentPrice !== undefined && { agentPrice: parseFloat(agentPrice) }),
      },
    });

    return NextResponse.json(updatedPlan);
  } catch (error: any) {
    console.error("Error updating data plan:", error);
    return NextResponse.json({ error: "Failed to update prices", details: error.message }, { status: 500 });
  }
}

// DELETE: Remove a data plan
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await prisma.dataPlan.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Plan deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting data plan:", error);
    return NextResponse.json({ error: "Failed to delete plan", details: error.message }, { status: 500 });
  }
}