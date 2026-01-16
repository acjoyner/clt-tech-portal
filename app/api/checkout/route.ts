import Stripe from "stripe";
import { NextResponse } from "next/server";

// This ensures the build doesn't fail if the key is temporarily missing
const stripeKey = process.env.STRIPE_SECRET_KEY || "";

const stripe = new Stripe(stripeKey, {
  apiVersion: "2025-12-15.clover",
});

// Define the shape of the item coming from your Cart
interface StripeItem {
  brand: string;
  model: string;
  price: number;
}

export async function POST(req: Request) {
  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json(
      { error: "Stripe API key is not configured" },
      { status: 500 }
    );
  }
  try {
    const { items }: { items: StripeItem[] } = await req.json(); // Explicitly type items

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: items.map((item) => ({
        // item is now typed correctly
        price_data: {
          currency: "usd",
          product_data: {
            name: `${item.brand} ${item.model}`,
          },
          unit_amount: Math.round(item.price * 100), // Stripe uses cents
        },
        quantity: 1,
      })),
      mode: "payment",
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/success`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/inventory`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    const errorMessage =
      err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
