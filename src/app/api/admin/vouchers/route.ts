import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    let vouchers = await prisma.voucherProduct.findMany();
    
    // Auto-seed default items if the table is empty
    if (vouchers.length === 0) {
      await prisma.voucherProduct.createMany({
        data: [
          { name: "WAEC BECE Checker", type: "BECE", cost: 12.00, price: 15.00, status: "Active" },
          { name: "WASSCE Result Checker", type: "WASSCE", cost: 12.00, price: 15.00, status: "Active" },
        ],
      });
      vouchers = await prisma.voucherProduct.findMany();
    }
    
    return NextResponse.json(vouchers, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching admin vouchers:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, cost, price, status } = body;

    if (!id) {
      return NextResponse.json({ error: "Voucher product ID is required" }, { status: 400 });
    }

    const updated = await prisma.voucherProduct.update({
      where: { id },
      data: { 
        ...(cost !== undefined && { cost: Number(cost) }),
        ...(price !== undefined && { price: Number(price) }),
        ...(status !== undefined && { status }),
      },
    });

    return NextResponse.json(updated, { status: 200 });
  } catch (error: any) {
    console.error("Error updating admin voucher:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}