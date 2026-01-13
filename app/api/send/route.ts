import { Resend } from 'resend';
import { NextResponse } from 'next/server';

// This check prevents the build from crashing if the key is empty
const apiKey = process.env.RESEND_API_KEY;
const resend = apiKey ? new Resend(apiKey) : null;

export async function POST(request: Request) {
  if (!resend) {
    return NextResponse.json({ error: "Resend API key is not configured" }, { status: 500 });
  }

  try {
    const { customerName, details } = await request.json();

    const data = await resend.emails.send({
      from: 'CLT Systems <onboarding@resend.dev>',
      to: ['anthony.c.joyner@gmail.com'],
      subject: 'New Laptop Quote Request',
      html: `<p><strong>Customer:</strong> ${customerName}</p><p><strong>Device:</strong> ${details}</p>`,
    });

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error }, { status: 500 });
  }
}