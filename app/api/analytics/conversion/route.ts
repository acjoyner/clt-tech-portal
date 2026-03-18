import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET() {
  try {
    // Fetch all quotes
    const { data: quotes, error } = await supabase
      .from('quotes')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Calculate conversion metrics
    const totalLeads = quotes.length;
    const pendingLeads = quotes.filter(q => q.status?.toLowerCase() === 'pending').length;
    const activeLeads = quotes.filter(q => q.status?.toLowerCase() === 'active').length;
    const completedLeads = quotes.filter(q => q.status?.toLowerCase() === 'completed').length;
    
    // Conversion rate: active + completed / total (excluding brand new pending)
    const convertedLeads = activeLeads + completedLeads;
    const conversionRate = totalLeads > 0 ? (convertedLeads / totalLeads) * 100 : 0;

    // Lead origin analysis
    const originStats: Record<string, { 
      total: number; 
      converted: number; 
      revenue: number; 
      profit: number 
    }> = {};

    // Initialize origins
    quotes.forEach(quote => {
      const origin = quote.lead_origin || 'Unknown';
      if (!originStats[origin]) {
        originStats[origin] = { total: 0, converted: 0, revenue: 0, profit: 0 };
      }
      originStats[origin].total++;
      
      if (quote.status?.toLowerCase() === 'active' || quote.status?.toLowerCase() === 'completed') {
        originStats[origin].converted++;
      }
    });

    // Fetch inventory to calculate profit by origin (match via customer email or approximate)
    // For now, we'll use quotes that have been completed as proxy for revenue
    const completedQuotes = quotes.filter(q => q.status?.toLowerCase() === 'completed');
    
    // Build origin breakdown with conversion rates
    const originBreakdown = Object.entries(originStats).map(([origin, data]) => ({
      origin,
      total: data.total,
      converted: data.converted,
      conversionRate: data.total > 0 ? (data.converted / data.total) * 100 : 0,
      profit: data.profit,
      revenue: data.revenue,
    })).sort((a, b) => b.conversionRate - a.conversionRate);

    // Time series data (last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const recentQuotes = quotes.filter(q => new Date(q.created_at) >= thirtyDaysAgo);
    
    const dailyStats = recentQuotes.reduce((acc, quote) => {
      const date = new Date(quote.created_at).toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = { leads: 0, converted: 0 };
      }
      acc[date].leads++;
      if (quote.status?.toLowerCase() !== 'pending') {
        acc[date].converted++;
      }
      return acc;
    }, {} as Record<string, { leads: number; converted: number }>);

    const timeSeriesData = Object.entries(dailyStats).map(([date, data]) => ({
      date,
      leads: data.leads,
      converted: data.converted,
      conversionRate: data.leads > 0 ? (data.converted / data.leads) * 100 : 0,
    })).sort((a, b) => a.date.localeCompare(b.date));

    return NextResponse.json({
      overview: {
        totalLeads,
        pendingLeads,
        activeLeads,
        completedLeads,
        conversionRate: Math.round(conversionRate * 100) / 100,
      },
      originBreakdown,
      timeSeriesData,
      insights: {
        bestOrigin: originBreakdown[0]?.origin || 'N/A',
        bestConversionRate: originBreakdown[0]?.conversionRate || 0,
        totalOrigins: Object.keys(originStats).length,
      }
    });
  } catch (error) {
    console.error('Analytics fetch failed:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}
