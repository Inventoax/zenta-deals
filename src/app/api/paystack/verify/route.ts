import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { withAccelerate } from "@prisma/extension-accelerate";

const prisma = new PrismaClient().$extends(withAccelerate()); 

export async function POST(request: Request) {
  try {
    const { reference } = await request.json();

    if (!reference) {
      return NextResponse.json({ error: "No reference provided" }, { status: 400 });
    }

    console.log("🔍 Verifying Payment Ref:", reference);

    // 1. Verify with Paystack
    const verifyReq = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      },
    });

    const verifyData = await verifyReq.json();

    if (!verifyData.status || verifyData.data.status !== 'success') {
      return NextResponse.json({ error: "Payment verification failed" }, { status: 400 });
    }

    // 2. Get Data
    const amountPaid = verifyData.data.amount / 100; 
    const userEmail = verifyData.data.customer.email;

    console.log(`✅ Verified! Crediting ₵${amountPaid} to ${userEmail}`);

    // 3. THE FIX: UPSERT USER (Targeting the clean User and Transaction models)
    const result = await prisma.$transaction(async (tx) => {
      
      // We handle existing or newly discovered customer profiles directly via the balance field
      const user = await tx.user.upsert({
        where: { email: userEmail },
        // CASE A: User Exists -> Add money directly to their profile balance
        update: {
          balance: { increment: amountPaid }
        },
        // CASE B: User Missing -> Auto-generate user with initial base balance
        create: {
          email: userEmail,
          password: "temporary_password", // Secure fallback parameter string
          name: "New Agent",
          balance: amountPaid,
        }
      });

      // 4. Record Transaction History log entries
      await tx.transaction.create({
        data: {
          userId: user.id, // Linked cleanly using your modern schema rules
          amount: Number(amountPaid),
          type: "TOPUP",
          status: "COMPLETED",
          reference: reference,
          description: "Wallet Funding via Paystack",
        }
      });

      // Re-fetch or calculate fresh balance figures safely
      const finalUser = await tx.user.findUnique({
        where: { id: user.id }
      });

      return finalUser?.balance ?? amountPaid;
    });

    return NextResponse.json({ 
      success: true, 
      newBalance: result 
    });

  } catch (error: any) {
    console.error("Verification Crash:", error);
    return NextResponse.json({ error: "System Error: " + error.message }, { status: 500 });
  }
}