import { Resend } from 'resend';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  // 1. Check for the key INSIDE the function
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    console.error("RESEND_API_KEY is missing from environment variables.");
    return NextResponse.json({ error: "Email configuration missing" }, { status: 500 });
  }

  // 2. Initialize Resend only when this function is actually called
  const resend = new Resend(apiKey);

  try {
    const { email, customerName, device, status } = await request.json();

    const data = await resend.emails.send({
      from: 'CLT Systems <onboarding@resend.dev>',
      to: [email],
      subject: `Update on your CLT SYSTEMS Repair`,
      html: `
        <div style="font-family: sans-serif; border: 8px solid black; padding: 20px;">
          <h1 style="text-transform: uppercase;">Status Update</h1>
          <p>Hi ${customerName},</p>
          <p>The status of your ${device} has been updated to: <strong>${status}</strong>.</p>
        </div>
      `,
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error("Resend Error:", error);
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
  }
}