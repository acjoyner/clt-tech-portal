import { Resend } from 'resend';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const resend = process.env.RESEND_API_KEY 
  ? new Resend(process.env.RESEND_API_KEY) 
  : null;

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST() {
  if (!resend) {
    return NextResponse.json({ error: "Resend API key not configured" }, { status: 500 });
  }

  // Calculate date range: last 7 days
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  
  // Fetch sold items from the past week
  const { data: soldItems, error } = await supabase
    .from('inventory')
    .select('*')
    .eq('status', 'sold')
    .gte('created_at', weekAgo.toISOString())
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Calculate metrics
  const totalUnits = soldItems?.length || 0;
  const totalRevenue = soldItems?.reduce((sum, item) => sum + (item.sale_price_listing || 0), 0) || 0;
  const totalCost = soldItems?.reduce((sum, item) => sum + (item.purchase_price || 0), 0) || 0;
  const netProfit = totalRevenue - totalCost;
  const avgProfitPerUnit = totalUnits > 0 ? netProfit / totalUnits : 0;

  // Group by brand for breakdown
  const brandBreakdown: Record<string, { count: number; revenue: number; profit: number }> = {};
  soldItems?.forEach(item => {
    const brand = item.brand || 'Unknown';
    if (!brandBreakdown[brand]) {
      brandBreakdown[brand] = { count: 0, revenue: 0, profit: 0 };
    }
    brandBreakdown[brand].count++;
    brandBreakdown[brand].revenue += item.sale_price_listing || 0;
    brandBreakdown[brand].profit += (item.sale_price_listing || 0) - (item.purchase_price || 0);
  });

  // Build HTML report
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; }
          .header h1 { margin: 0; font-size: 28px; }
          .header p { margin: 10px 0 0; opacity: 0.9; }
          .metrics { display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin: 20px 0; }
          .metric { background: #f8fafc; padding: 20px; border-radius: 8px; border-left: 4px solid #2563eb; }
          .metric-label { font-size: 12px; text-transform: uppercase; color: #64748b; font-weight: 600; }
          .metric-value { font-size: 24px; font-weight: 700; color: #1e293b; margin-top: 5px; }
          .metric-value.profit { color: #16a34a; }
          .section { margin: 30px 0; }
          .section h2 { font-size: 18px; color: #1e293b; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px; }
          table { width: 100%; border-collapse: collapse; margin-top: 15px; }
          th, td { padding: 12px; text-align: left; border-bottom: 1px solid #e2e8f0; }
          th { background: #f1f5f9; font-weight: 600; font-size: 14px; }
          .footer { background: #f8fafc; padding: 20px; border-radius: 0 0 8px 8px; font-size: 12px; color: #64748b; text-align: center; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📊 Weekly Profit Report</h1>
            <p>${weekAgo.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} — ${now.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
          </div>

          <div class="metrics">
            <div class="metric">
              <div class="metric-label">Units Sold</div>
              <div class="metric-value">${totalUnits}</div>
            </div>
            <div class="metric">
              <div class="metric-label">Total Revenue</div>
              <div class="metric-value">$${totalRevenue.toFixed(2)}</div>
            </div>
            <div class="metric">
              <div class="metric-label">Total Cost</div>
              <div class="metric-value">$${totalCost.toFixed(2)}</div>
            </div>
            <div class="metric">
              <div class="metric-label">Net Profit</div>
              <div class="metric-value profit">$${netProfit.toFixed(2)}</div>
            </div>
          </div>

          ${Object.keys(brandBreakdown).length > 0 ? `
            <div class="section">
              <h2>Breakdown by Brand</h2>
              <table>
                <thead>
                  <tr>
                    <th>Brand</th>
                    <th>Units</th>
                    <th>Revenue</th>
                    <th>Profit</th>
                  </tr>
                </thead>
                <tbody>
                  ${Object.entries(brandBreakdown).map(([brand, data]) => `
                    <tr>
                      <td><strong>${brand}</strong></td>
                      <td>${data.count}</td>
                      <td>$${data.revenue.toFixed(2)}</td>
                      <td style="color: ${data.profit >= 0 ? '#16a34a' : '#dc2626'}; font-weight: 600;">$${data.profit.toFixed(2)}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          ` : '<div class="section"><p>No sales this week. Keep grinding! 💪</p></div>'}

          <div class="section">
            <h2>Top Performers</h2>
            ${soldItems && soldItems.length > 0 ? `
              <table>
                <thead>
                  <tr>
                    <th>Model</th>
                    <th>Profit</th>
                  </tr>
                </thead>
                <tbody>
                  ${soldItems.slice(0, 5).map(item => `
                    <tr>
                      <td>${item.brand} ${item.model}</td>
                      <td style="color: #16a34a; font-weight: 600;">+$${((item.sale_price_listing || 0) - (item.purchase_price || 0)).toFixed(2)}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            ` : '<p>No data available</p>'}
          </div>

          <div class="footer">
            <p>Generated automatically by CLT Systems Portal</p>
            <p>Want to adjust this report? Reply to this email.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  try {
    const result = await resend.emails.send({
      from: 'CLT Systems <onboarding@resend.dev>',
      to: ['anthony.c.joyner@gmail.com'],
      subject: `📊 Weekly Profit Report: $${netProfit.toFixed(2)} net (${totalUnits} units)`,
      html,
    });

    return NextResponse.json({ 
      success: true, 
      emailId: result.id,
      weekStart: weekAgo.toISOString(),
      weekEnd: now.toISOString(),
      metrics: { totalUnits, totalRevenue, totalCost, netProfit, avgProfitPerUnit }
    });
  } catch (error) {
    console.error('Email send failed:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}
