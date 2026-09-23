import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Fetch all transactions ordered by newest first
    const orders = await prisma.transaction.findMany({
      orderBy: { createdAt: "desc" },
    });

    // Optionally fetch users to map their emails if needed
    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true }
    });

    const userMap = new Map(users.map(u => [u.id, u]));

    const ordersWithUser = orders.map(order => ({
      ...order,
      user: userMap.get(order.userId) || { name: "Unknown", email: "N/A" }
    }));

    return NextResponse.json({ orders: ordersWithUser }, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching admin orders:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}