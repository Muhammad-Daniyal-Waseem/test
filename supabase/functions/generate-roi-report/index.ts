import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.4";
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { email, calculatorData } = await req.json();

    if (!email || !calculatorData) {
      return new Response(
        JSON.stringify({ error: "Email and calculator data are required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Store calculator submission in database
    const { error: dbError } = await supabase
      .from("roi_calculator_submissions")
      .insert({
        email,
        current_arr: calculatorData.currentARR,
        growth_goal: calculatorData.growthGoal,
        avg_deal_size: calculatorData.avgDealSize,
        sales_cycle: calculatorData.salesCycle,
        team_size: calculatorData.teamSize,
        projected_revenue: calculatorData.projectedRevenue,
        monthly_deals: calculatorData.monthlyDeals,
        pipeline_value: calculatorData.pipelineValue,
        submitted_at: new Date().toISOString(),
      });

    if (dbError) {
      console.error("Database error:", dbError);
    }

    // Generate HTML report
    const htmlContent = generateHTMLReport(email, calculatorData);

    // Get SMTP credentials from environment
    const smtpHost = Deno.env.get('SMTP_HOST') || 'smtp.gmail.com';
    const smtpPort = parseInt(Deno.env.get('SMTP_PORT') || '587');
    const smtpUser = Deno.env.get('SMTP_USER');
    const smtpPass = Deno.env.get('SMTP_PASS');
    const smtpFrom = Deno.env.get('SMTP_FROM');
    const notificationEmail = Deno.env.get('NOTIFICATION_EMAIL');

    if (!smtpUser || !smtpPass || !smtpFrom) {
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

    // Send HTML email to user
    await client.send({
      from: smtpFrom,
      to: email,
      subject: 'Your Custom Revenue Growth Report - ConTech GTM',
      html: htmlContent,
    });

    // Also send notification to Mo
    const notificationContent = `
New ROI Calculator Report Request

═══════════════════════════════════════
Contact: ${email}
Current ARR: $${calculatorData.currentARR.toLocaleString()}
Growth Goal: ${calculatorData.growthGoal}%
Avg Deal Size: $${calculatorData.avgDealSize.toLocaleString()}
Sales Cycle: ${calculatorData.salesCycle} months
Team Size: ${calculatorData.teamSize}
Target Revenue: $${calculatorData.projectedRevenue.toLocaleString()}

Submitted: ${new Date().toLocaleString('en-US', { timeZone: 'America/New_York' })} ET
═══════════════════════════════════════
    `;

    await client.send({
      from: smtpFrom,
      to: notificationEmail || smtpFrom,
      subject: `📊 New ROI Report Request from ${email}`,
      content: notificationContent,
    });

    await client.close();

    console.log('Report email sent successfully to:', email);

    return new Response(
      JSON.stringify({ success: true, message: "Report sent to " + email }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

function generateHTMLReport(email: string, data: any): string {
  const formatCurrency = (num: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num);
  };

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #1a1a1a;
      max-width: 800px;
      margin: 0 auto;
      padding: 40px 20px;
      background-color: #ffffff;
    }
    .header {
      text-align: center;
      margin-bottom: 40px;
      padding-bottom: 30px;
      border-bottom: 3px solid #EA580C;
    }
    .header h1 {
      color: #0A1628;
      font-size: 32px;
      margin: 20px 0 10px 0;
      font-weight: 700;
    }
    .header p {
      color: #64748b;
      font-size: 14px;
      margin: 5px 0;
    }
    .intro {
      background: linear-gradient(135deg, #0A1628 0%, #1e3a5f 100%);
      color: white;
      padding: 30px;
      border-radius: 12px;
      margin-bottom: 30px;
    }
    .intro h2 {
      margin-top: 0;
      font-size: 24px;
    }
    .metrics {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 20px;
      margin-bottom: 30px;
    }
    @media (max-width: 600px) {
      .metrics {
        grid-template-columns: 1fr;
      }
    }
    .metric-card {
      background: #f8fafc;
      border: 2px solid #e2e8f0;
      border-radius: 8px;
      padding: 20px;
    }
    .metric-card h3 {
      color: #EA580C;
      font-size: 14px;
      font-weight: 600;
      text-transform: uppercase;
      margin: 0 0 10px 0;
      letter-spacing: 0.5px;
    }
    .metric-card .value {
      font-size: 28px;
      font-weight: 700;
      color: #0A1628;
      margin: 0;
    }
    .insights {
      background: #fff7ed;
      border-left: 4px solid #EA580C;
      padding: 25px;
      margin-bottom: 30px;
      border-radius: 4px;
    }
    .insights h3 {
      color: #0A1628;
      margin-top: 0;
      font-size: 20px;
    }
    .insights ul {
      margin: 15px 0;
      padding-left: 20px;
    }
    .insights li {
      margin-bottom: 12px;
      color: #334155;
    }
    .cta-section {
      background: linear-gradient(135deg, #EA580C 0%, #c2410c 100%);
      color: white;
      padding: 35px;
      border-radius: 12px;
      text-align: center;
      margin-top: 40px;
    }
    .cta-section h3 {
      margin: 0 0 15px 0;
      font-size: 24px;
    }
    .cta-section p {
      margin: 0 0 25px 0;
      font-size: 16px;
      opacity: 0.95;
    }
    .cta-button {
      display: inline-block;
      background: white;
      color: #EA580C;
      padding: 14px 32px;
      border-radius: 8px;
      text-decoration: none;
      font-weight: 700;
      font-size: 16px;
      margin: 5px;
    }
    .footer {
      text-align: center;
      margin-top: 40px;
      padding-top: 30px;
      border-top: 1px solid #e2e8f0;
      color: #64748b;
      font-size: 12px;
    }
    .recommendation-box {
      background: #f0fdf4;
      border: 2px solid #86efac;
      border-radius: 8px;
      padding: 20px;
      margin: 20px 0;
    }
    .recommendation-box h4 {
      color: #15803d;
      margin: 0 0 10px 0;
      font-size: 18px;
    }
    .highlight-metric {
      background: linear-gradient(135deg, #0A1628 0%, #1e3a5f 100%);
      border: none;
    }
    .highlight-metric h3 {
      color: #EA580C !important;
    }
    .highlight-metric .value {
      color: white !important;
    }
    .highlight-metric-orange {
      background: linear-gradient(135deg, #EA580C 0%, #c2410c 100%);
      border: none;
    }
    .highlight-metric-orange h3 {
      color: white !important;
    }
    .highlight-metric-orange .value {
      color: white !important;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>ConTech GTM</h1>
    <p>Your Custom Revenue Growth Report</p>
    <p style="font-size: 12px; color: #94a3b8;">Generated for ${email} on ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
  </div>

  <div class="intro">
    <h2>Your Revenue Growth Potential</h2>
    <p style="margin-bottom: 0;">Based on your current situation and growth goals, here's what's possible when you implement a systematic revenue engine.</p>
  </div>

  <h2 style="color: #0A1628; margin-bottom: 20px;">Your Current Situation</h2>
  <div class="metrics">
    <div class="metric-card">
      <h3>Current ARR</h3>
      <p class="value">${formatCurrency(data.currentARR)}</p>
    </div>
    <div class="metric-card">
      <h3>Growth Goal</h3>
      <p class="value">${data.growthGoal}%</p>
    </div>
    <div class="metric-card">
      <h3>Avg Deal Size</h3>
      <p class="value">${formatCurrency(data.avgDealSize)}</p>
    </div>
    <div class="metric-card">
      <h3>Sales Cycle</h3>
      <p class="value">${data.salesCycle} months</p>
    </div>
  </div>

  <h2 style="color: #0A1628; margin-bottom: 20px;">Your Revenue Engine Blueprint</h2>
  <div class="metrics">
    <div class="metric-card highlight-metric">
      <h3>Target Revenue (12 months)</h3>
      <p class="value">${formatCurrency(data.projectedRevenue)}</p>
    </div>
    <div class="metric-card highlight-metric-orange">
      <h3>Required Monthly Deals</h3>
      <p class="value">${data.monthlyDeals}</p>
    </div>
    <div class="metric-card">
      <h3>Pipeline Required (4x)</h3>
      <p class="value">${formatCurrency(data.pipelineValue)}</p>
    </div>
    <div class="metric-card">
      <h3>Current Team Size</h3>
      <p class="value">${data.teamSize} ${data.teamSize === 1 ? 'person' : 'people'}</p>
    </div>
  </div>

  <div class="insights">
    <h3>Mo's Take on Your Situation</h3>
    <p><strong>Here's what I see:</strong></p>
    <ul>
      <li><strong>The Math:</strong> To hit ${formatCurrency(data.projectedRevenue)} in 12 months, you need to close ${data.monthlyDeals} deals per month at ${formatCurrency(data.avgDealSize)} average deal size.</li>
      <li><strong>Pipeline Reality:</strong> With a ${data.salesCycle}-month sales cycle in construction, you need ${formatCurrency(data.pipelineValue)} in active pipeline (4x coverage) working right now.</li>
      <li><strong>Team Capacity:</strong> ${data.teamSize === 1 ? 'As a solo founder/seller, you need systems that multiply your effectiveness' : `With ${data.teamSize} people, you need clear playbooks, coaching rhythms, and forecast discipline`}.</li>
      <li><strong>ConTech Reality:</strong> Construction sales cycles are long (${data.salesCycle} months). You can't afford to waste 90 days learning this the hard way.</li>
    </ul>
  </div>

  <div class="recommendation-box">
    <h4>✓ Recommended Path Forward</h4>
    <p style="margin: 0; color: #166534; line-height: 1.8;">
      Based on your ARR and growth goals, I recommend starting with a <strong>CRO Command Brief</strong> (complimentary 30-minute diagnostic) to identify your #1 revenue constraint. Then we'll discuss whether LITE ($4.2K/mo) or CORE ($6.8K/mo) is the right fit for your situation.
    </p>
  </div>

  <div class="cta-section">
    <h3>Ready to Build This Engine?</h3>
    <p>Book a 30-minute Pipeline Plan Session. No pitch, no pressure—just an honest diagnosis of your revenue constraints.</p>
    <a href="https://calendly.com/contechgtm/60-min-session" class="cta-button">Book Your Discovery Call</a>
    <a href="https://contechgtm.com/#command-brief" class="cta-button">Apply for Command Brief</a>
  </div>

  <div class="footer">
    <p><strong>ConTech GTM</strong> | Fractional CRO for Construction SaaS</p>
    <p>Email: mdaudi@contechgtm.com | Web: contechgtm.com</p>
    <p style="margin-top: 15px; font-size: 11px;">This report is based on industry benchmarks for ConTech/PropTech B2B SaaS companies.<br>Actual results depend on market conditions, ICP clarity, and execution discipline.</p>
  </div>
</body>
</html>`;
}
