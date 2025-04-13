import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

// Configure the email transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_SERVER || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

export async function POST(req: NextRequest) {
  try {
    // Parse the request body
    const body = await req.json();
    const { name, email, subject, message, recipients } = body;

    // Validate the request data
    if (!name || !email || !message || !recipients || !Array.isArray(recipients)) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Format the email content
    const formattedSubject = subject
      ? `Flock Contact: ${subject}`
      : 'Flock Contact Form Submission';
    const emailContent = `
      <h2>New Contact Form Submission</h2>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      ${subject ? `<p><strong>Subject:</strong> ${subject}</p>` : ''}
      <p><strong>Message:</strong></p>
      <p style="white-space: pre-line;">${message}</p>
      <hr />
      <p>This email was sent from the Flock contact form.</p>
    `;

    // Send the email
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || 'noreply@getflock.app',
      to: recipients.join(', '),
      subject: formattedSubject,
      html: emailContent,
      replyTo: email,
    });

    // Send an acknowledgment to the user who submitted the form
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || 'noreply@getflock.app',
      to: email,
      subject: 'We received your message - Flock',
      html: `
        <h2>Thank you for contacting Flock!</h2>
        <p>We've received your message and will get back to you as soon as possible.</p>
        <p>Here's a copy of your message:</p>
        <div style="background-color: #f9f9f9; padding: 15px; border-radius: 4px; margin: 15px 0;">
          <p style="white-space: pre-line;">${message}</p>
        </div>
        <p>Best regards,<br>The Flock Team</p>
      `,
    });

    return NextResponse.json(
      { success: true, message: 'Email sent successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error sending email:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to send email',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
