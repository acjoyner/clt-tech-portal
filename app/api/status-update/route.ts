import { Resend } from 'resend';
import { NextResponse } from 'next/server';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const { email, customerName, device, status } = await request.json();

    // Custom messages based on status
    let message = `The status of your ${device} has been updated to: ${status}.`;
    let subject = `Update on your CLT SYSTEMS Repair`;

    if (status === 'ready') {
      subject = `Ready for Pickup! - CLT SYSTEMS`;
      message = `Great news, ${customerName}! Your ${device} is ready for pickup. Come see us during normal business hours.`;
    }

    const data = await resend.emails.send({
      from: 'CLT Systems <onboarding@resend.dev>', // Update to your domain later
      to: [email],
      subject: subject,
      html: `
        <div style="font-family: sans-serif; border: 8px solid black; padding: 20px;">
          <h1 style="text-transform: uppercase; font-style: italic;">CLT SYSTEMS</h1>
          <p style="font-size: 18px; font-weight: bold;">Hi ${customerName},</p>
          <p style="font-size: 16px;">${message}</p>
          <hr style="border: 2px solid black;" />
          <p style="font-size: 12px; font-weight: bold;">TRACK YOUR REPAIR AT: <a href="https://clt-tech-portal.vercel.app/profile">YOUR PORTAL</a></p>
        </div>
      `,
    });

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error }, { status: 500 });
  }
}