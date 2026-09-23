import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, amount } = body;

    const paystackAmount = Math.round(Number(amount) * 100);
    
    console.log("🔵 Initializing Paystack for:", email, paystackAmount);

    const response = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      },
      body: JSON.stringify({
        email: email,
        amount: paystackAmount,
        currency: "GHS",
        callback_url: "http://localhost:3000/wallet", 
      }),
    });

    const data = await response.json();

    if (!data.status) {
      return NextResponse.json({ error: data.message }, { status: 400 });
    }

    return NextResponse.json({ 
      success: true, 
      url: data.data.authorization_url 
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}