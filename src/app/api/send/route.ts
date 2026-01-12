import { Resend } from 'resend';
import { NextResponse } from 'next/server';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const { name, email, details } = await request.json();

    const data = await resend.emails.send({
      from: 'CLT Systems <onboarding@resend.dev>', // Update once you have a domain
      to: ['anthony.c.joyner@gmail.com'],
      subject: `New Lead: ${name}`,
      html: `<p><strong>Customer:</strong> ${name}</p>
             <p><strong>Email:</strong> ${email}</p>
             <p><strong>Device:</strong> ${details}</p>`
    });

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error });
  }
}