import { Resend } from 'resend';
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const { email, customerName, device, status } = await request.json();

    // 1. Prepare the image file from your public folder
    const filePath = path.join(process.cwd(), 'public', 'banner.png'); // Make sure your image is named this
    const imageBuffer = fs.readFileSync(filePath);
    const base64Image = imageBuffer.toString('base64');

    let message = `The status of your ${device} has been updated to: ${status}.`;
    let subject = `Update on your CLT SYSTEMS Repair`;

    if (status === 'ready') {
      subject = `Ready for Pickup! - CLT SYSTEMS`;
      message = `Great news, ${customerName}! Your ${device} is ready for pickup.`;
    }

    const data = await resend.emails.send({
      from: 'CLT Systems <onboarding@resend.dev>',
      to: [email],
      subject: subject,
      html: `
        <div style="font-family: sans-serif; border: 8px solid black; padding: 20px; max-width: 600px;">
          <img src="cid:logo" alt="CLT SYSTEMS" style="width: 100%; height: auto; border-bottom: 8px solid black; margin-bottom: 20px;" />
          
          <h1 style="text-transform: uppercase; font-style: italic;">Status Update</h1>
          <p style="font-size: 18px; font-weight: bold;">Hi ${customerName},</p>
          <p style="font-size: 16px;">${message}</p>
          <hr style="border: 2px solid black;" />
          <p style="font-size: 12px; font-weight: bold;">TRACK AT: <a href="https://clt-tech-portal.vercel.app/profile">YOUR PORTAL</a></p>
        </div>
      `,
      // 3. Attach the image with the matching Content ID
      attachments: [
        {
          content: base64Image,
          filename: 'banner.png',
          contentId: 'logo', // This MUST match the cid:logo in the img tag
        },
      ],
    });

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error }, { status: 500 });
  }
}