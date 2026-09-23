import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET: Fetch AFA requests (Admin Dashboard)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    const whereClause: any = {};
    if (status && status !== "ALL") {
      whereClause.status = status.toUpperCase();
    }

    const requests = await prisma.afaRequest.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ requests }, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching AFA requests:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST: Submit a public AFA application (Anyone can submit)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { fullName, email, phone, ghanaCardId, region } = body;

    if (!fullName || !phone || !ghanaCardId || !region) {
      return NextResponse.json({ error: "Please fill in all required fields." }, { status: 400 });
    }

    // Optional: Check if Ghana card was already submitted
    const existingCard = await prisma.afaRequest.findFirst({
      where: { ghanaCardId },
    });

    if (existingCard) {
      return NextResponse.json(
        { error: "An application with this Ghana Card number has already been submitted." },
        { status: 400 }
      );
    }

    const newRequest = await prisma.afaRequest.create({
      data: {
        fullName,
        email,
        phone,
        ghanaCardId,
        region,
        status: "PENDING",
      },
    });

    return NextResponse.json(
      { message: "AFA application submitted successfully", request: newRequest },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error submitting AFA request:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PATCH: Admin action (Approve or Reject)
export async function PATCH(request: Request) {
  try {
    const { requestId, status } = await request.json();

    if (!requestId || !status) {
      return NextResponse.json({ error: "Request ID and status are required" }, { status: 400 });
    }

    const updatedAfa = await prisma.afaRequest.update({
      where: { id: requestId },
      data: { status: status.toUpperCase() },
    });

    return NextResponse.json({ message: `AFA request updated successfully`, afa: updatedAfa }, { status: 200 });
  } catch (error: any) {
    console.error("Error updating AFA status:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}