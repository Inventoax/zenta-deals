import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET: Fetch all voucher products
export async function GET() {
  try {
    const products = await prisma.voucherProduct.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ products }, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching voucher products:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST / PATCH: Create or update a voucher product
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { id, name, type, cost, price, status } = body;

    if (!name) {
      return NextResponse.json({ error: "Product name is required" }, { status: 400 });
    }

    let product;
    if (id) {
      // Update existing
      product = await prisma.voucherProduct.update({
        where: { id },
        data: { name, type, cost, price, status },
      });
    } else {
      // Create new
      product = await prisma.voucherProduct.create({
        data: {
          name,
          type: type || "E-PIN",
          cost: cost || 0,
          price: price || 0,
          status: status || "Active",
        },
      });
    }

    return NextResponse.json({ message: "Saved successfully", product }, { status: 200 });
  } catch (error: any) {
    console.error("Error saving voucher product:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}