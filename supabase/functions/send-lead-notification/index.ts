import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface LeadNotification {
  type: 'lead_magnet' | 'email_capture';
  data: {
    company_name?: string;
    contact_name?: string;
    email: string;
    phone?: string;
    challenge_description?: string;
    arr_range?: string;
    acv?: string;
    sales_cycle_days?: number;
    additional_context?: string;
    source?: string;
  };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { type, data }: LeadNotification = await req.json();

    let emailSubject = '';
    let emailBody = '';

    if (type === 'lead_magnet') {
      emailSubject = `🎯 New CRO Command Brief Request from ${data.company_name}`;
      emailBody = `
New CRO Command Brief™ Submission

═══════════════════════════════════════
COMPANY INFORMATION
═══════════════════════════════════════
Company: ${data.company_name}
Contact: ${data.contact_name}
Email: ${data.email}
Phone: ${data.phone || 'Not provided'}

═══════════════════════════════════════
REVENUE CHALLENGE
═══════════════════════════════════════
${data.challenge_description}

═══════════════════════════════════════
COMPANY METRICS
═══════════════════════════════════════
ARR Range: ${data.arr_range || 'Not provided'}
ACV: ${data.acv || 'Not provided'}
Sales Cycle: ${data.sales_cycle_days ? data.sales_cycle_days + ' days' : 'Not provided'}

${data.additional_context ? '═══════════════════════════════════════\nADDITIONAL CONTEXT\n═══════════════════════════════════════\n' + data.additional_context : ''}

═══════════════════════════════════════
NEXT STEPS
═══════════════════════════════════════
1. Review challenge description
2. Prepare 20-minute discovery questions
3. Deliver board-grade memo within 72 hours

Submitted: ${new Date().toLocaleString('en-US', { timeZone: 'America/New_York' })} ET
      `;
    } else if (type === 'email_capture') {
      emailSubject = `📧 New Email Capture: ${data.email}`;
      emailBody = `
New Email Captured

═══════════════════════════════════════
Email: ${data.email}
Source: ${data.source || 'Unknown'}
Captured: ${new Date().toLocaleString('en-US', { timeZone: 'America/New_York' })} ET
═══════════════════════════════════════
      `;
    }

    // Get SMTP credentials from environment
    const smtpHost = Deno.env.get('SMTP_HOST') || 'smtp.gmail.com';
    const smtpPort = parseInt(Deno.env.get('SMTP_PORT') || '587');
    const smtpUser = Deno.env.get('SMTP_USER');
    const smtpPass = Deno.env.get('SMTP_PASS');
    const smtpFrom = Deno.env.get('SMTP_FROM');
    const notificationEmail = Deno.env.get('NOTIFICATION_EMAIL');

    if (!smtpUser || !smtpPass || !smtpFrom || !notificationEmail) {
      throw new Error('SMTP configuration missing in environment variables');
    }

    // Create SMTP client
    const client = new SMTPClient({
      connection: {
        hostname: smtpHost,
        port: smtpPort,
        tls: true,
        auth: {
          username: smtpUser,
          password: smtpPass,
        },
      },
    });

    // Send email
    await client.send({
      from: smtpFrom,
      to: notificationEmail,
      subject: emailSubject,
      content: emailBody,
    });

    await client.close();

    console.log('Email sent successfully:', { type, email: data.email });

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Email notification sent successfully',
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error('Error sending notification:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});