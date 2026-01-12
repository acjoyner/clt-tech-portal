import { Resend } from 'resend';
import { NextResponse } from 'next/server';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const { email, customerName, details } = await request.json();

    const data = await resend.emails.send({
      from: 'CLT Systems <onboarding@resend.dev>',
      to: ['anthony.c.joyner@gmail.com'], // Send the lead to yourself
      subject: 'New Laptop Quote Request',
      html: `<p><strong>Customer:</strong> ${customerName}</p><p><strong>Device:</strong> ${details}</p>`,
    });

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error });
  }
}