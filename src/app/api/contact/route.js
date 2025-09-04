// app/api/contact/route.js
import { NextResponse } from 'next/server';
import { Resend } from 'resend';

// Initialize Resend client
const resend = new Resend(process.env.RESEND_API_KEY);

// Validation helper
const validateEmail = (email) => {
  const re = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,})+$/;
  return re.test(email);
};

const validatePhone = (phone) => {
  // Basic phone validation - allows various formats
  const re = /^\+?[\d\s\-\(\)]{10,}$/;
  return re.test(phone);
};

export async function POST(request) {
  try {
    // Parse form data
    const formData = await request.formData();
    const email = formData.get('email');
    const phone = formData.get('phone');
    const subject = formData.get('subject');
    const message = formData.get('message');
    const file = formData.get('file');

    // Validate required fields
    if (!email || !phone || !subject || !message) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Validate email
    if (!validateEmail(email)) {
      return NextResponse.json(
        { error: 'Please provide a valid email address' },
        { status: 400 }
      );
    }

    // Validate phone
    if (!validatePhone(phone)) {
      return NextResponse.json(
        { error: 'Please provide a valid phone number' },
        { status: 400 }
      );
    }

    // Validate subject length
    if (subject.trim().length < 3) {
      return NextResponse.json(
        { error: 'Subject must be at least 3 characters' },
        { status: 400 }
      );
    }

    // Validate message length
    if (message.trim().length < 10) {
      return NextResponse.json(
        { error: 'Message must be at least 10 characters' },
        { status: 400 }
      );
    }

    // Validate file if provided
    let attachment = null;
    if (file && file.size > 0) {
      // Check file size (1MB max)
      if (file.size > 1048576) {
        return NextResponse.json(
          { error: 'File size must be less than 1MB' },
          { status: 400 }
        );
      }

      // Check file type
      const allowedTypes = ['image/', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.some(type => file.type.startsWith(type))) {
        return NextResponse.json(
          { error: 'File type not allowed. Please upload an image, PDF, or Word document.' },
          { status: 400 }
        );
      }

      // Convert file to buffer for attachment
      const arrayBuffer = await file.arrayBuffer();
      attachment = {
        filename: file.name,
        content: Buffer.from(arrayBuffer),
        contentType: file.type
      };
    }

    // Send email via Resend
    const { data, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'HIGH TECH ISP <onboarding@resend.dev>',
      to: ['sohailamjad39sgd@gmail.com'],
      reply_to: email,
      subject: `Contact Form: ${subject}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone}</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <p><strong>Message:</strong></p>
        <p>${message.replace(/\n/g, '<br>')}</p>
        <p><em>Sent from HIGH TECH ISP contact form</em></p>
      `,
      attachments: attachment ? [attachment] : undefined
    });

    if (error) {
      console.error('Email send error:', error);
      return NextResponse.json(
        { error: 'Failed to send message. Please try again later.' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: 'Message sent successfully' },
      { status: 200 }
    );

  } catch (error) {
    console.error('Contact form error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}