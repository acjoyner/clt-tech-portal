import Stripe from 'stripe';
import { NextResponse } from 'next/server';

// 1. Define exactly what a Cart Item looks like
interface CartItem {
  brand: string;
  model: string;
  price: number;
}

export async function POST(req: Request) {
  const stripeKey = process.env.STRIPE_SECRET_KEY;

  if (!stripeKey) {
    return NextResponse.json({ error: "Configuration Error" }, { status: 500 });
  }

  const stripe = new Stripe(stripeKey, {

    apiVersion: '2025-12-15.clover',
  });

  try {
    // 2. Tell TypeScript that 'items' is an array of CartItem
    const { items }: { items: CartItem[] } = await req.json();

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: items.map((item: CartItem) => ({
        price_data: {
          currency: 'usd',
          product_data: { 
            name: `${item.brand} ${item.model}`,
          },
          unit_amount: Math.round(item.price * 100),
        },
        quantity: 1,
      })),
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/success`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/inventory`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err: unknown) {
    // 3. Handle the error without using 'any'
    const errorMessage = err instanceof Error ? err.message : "An unknown error occurred";
    console.error("Stripe Error:", errorMessage);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}