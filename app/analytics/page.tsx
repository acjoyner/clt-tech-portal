"use client";
import { useEffect, useState } from "react";
import { supabase } from "../../../src/lib/supabase";
import { useRouter } from "next/navigation";
import { getShadow, getBorder } from "@/src/lib/design-tokens";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  LineChart,
  Line,
  Legend,
} from "recharts";

interface ConversionOverview {
  totalLeads: number;
  pendingLeads: number;
  activeLeads: number;
  completedLeads: number;
  conversionRate: number;
}

interface OriginStat {
  origin: string;
  total: number;
  converted: number;
  conversionRate: number;
  revenue: number;
  profit: number;
}

interface TimeSeriesPoint {
  date: string;
  leads: number;
  converted: number;
  conversionRate: number;
}

interface AnalyticsData {
  overview: ConversionOverview;
  originBreakdown: OriginStat[];
  timeSeriesData: TimeSeriesPoint[];
  insights: {
    bestOrigin: string;
    bestConversionRate: number;
    totalOrigins: number;
  };
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAdminAndFetch = async () => {
      const { data: session } = await supabase.auth.getSession();
      if (!session || session.user.email !== "anthony.c.joyner@gmail.com") {
        router.push("/login");
        return;
      }

      try {
        const res = await fetch('/api/analytics/conversion');
        const json = await res.json();
        if (res.ok) {
          setData(json);
        } else {
          console.error('Analytics fetch failed:', json.error);
        }
      } catch (err) {
        console.error('Analytics fetch error:', err);
      }
      
      setLoading(false);
    };
    
    checkAdminAndFetch();
  }, [router]);

  if (loading) {
    return (
      <div className="p-20 font-black uppercase text-center">
        Loading Analytics...
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-20 font-black uppercase text-center text-red-600">
        Failed to load analytics data
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 bg-white min-h-screen text-black">
      <header className="mb-12 border-b-8 border-black pb-8">
        <h1 className="text-6xl font-black uppercase italic tracking-tighter">
          Lead <span className="text-blue-600">Analytics</span>
        </h1>
        <p className="text-xl font-bold mt-4 text-gray-600">
          Track conversion rates and origin performance
        </p>
      </header>

      {/* OVERVIEW METRICS */}
      <section className="mb-16">
        <h2 className="text-3xl font-black mb-6 uppercase italic text-blue-700 underline">
          Overview
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className={`bg-blue-50 ${getBorder('medium')} p-6 ${getShadow('small')}`}>
            <div className="text-xs font-black uppercase text-gray-500 mb-2">Total Leads</div>
            <div className="text-4xl font-black">{data.overview.totalLeads}</div>
          </div>
          <div className={`bg-yellow-50 ${getBorder('medium')} p-6 ${getShadow('small')}`}>
            <div className="text-xs font-black uppercase text-gray-500 mb-2">Pending</div>
            <div className="text-4xl font-black text-yellow-600">{data.overview.pendingLeads}</div>
          </div>
          <div className={`bg-green-50 ${getBorder('medium')} p-6 ${getShadow('small')}`}>
            <div className="text-xs font-black uppercase text-gray-500 mb-2">Active</div>
            <div className="text-4xl font-black text-green-600">{data.overview.activeLeads}</div>
          </div>
          <div className={`bg-purple-50 ${getBorder('medium')} p-6 ${getShadow('small')}`}>
            <div className="text-xs font-black uppercase text-gray-500 mb-2">Completed</div>
            <div className="text-4xl font-black text-purple-600">{data.overview.completedLeads}</div>
          </div>
        </div>
        
        <div className={`mt-4 bg-black text-white ${getBorder('medium')} p-6 ${getShadow('medium')}`}>
          <div className="flex flex-col md:flex-row justify-between items-end gap-4">
            <div>
              <div className="text-xs font-black uppercase text-gray-400 mb-2">Overall Conversion Rate</div>
              <div className="text-5xl font-black">{data.overview.conversionRate.toFixed(1)}%</div>
            </div>
            <div className="text-sm font-bold text-gray-300 max-w-md">
              {data.overview.conversionRate > 50 ? (
                "🔥 Strong conversion! Keep the pipeline moving."
              ) : data.overview.conversionRate > 30 ? (
                "👍 Decent conversion. Focus on following up with pending leads."
              ) : (
                "⚠️ Low conversion. Review your approval process and follow-up timing."
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ORIGIN BREAKDOWN */}
      <section className="mb-16">
        <h2 className="text-3xl font-black mb-6 uppercase italic text-green-700 underline">
          Performance by Origin
        </h2>
        <div className={`${getBorder('medium')} overflow-x-auto ${getShadow('medium')} bg-white`}>
          <table className="w-full text-left min-w-[800px]">
            <thead className="bg-black text-white font-black uppercase text-sm">
              <tr>
                <th className="p-4">Origin</th>
                <th className="p-4 text-center">Total Leads</th>
                <th className="p-4 text-center">Converted</th>
                <th className="p-4 text-right">Conversion Rate</th>
                <th className="p-4 text-right">Insight</th>
              </tr>
            </thead>
            <tbody>
              {data.originBreakdown.map((stat, idx) => (
                <tr key={stat.origin} className="border-b-2 border-black">
                  <td className="p-4 font-bold">
                    <span className={`inline-block px-2 py-1 text-[9px] font-black uppercase mr-2 ${
                      idx === 0 ? 'bg-green-500 text-white' : 'bg-gray-200 text-black'
                    }`}>
                      {idx === 0 ? '🏆 Best' : stat.origin}
                    </span>
                  </td>
                  <td className="p-4 text-center font-bold">{stat.total}</td>
                  <td className="p-4 text-center font-bold">{stat.converted}</td>
                  <td className="p-4 text-right font-black">
                    <span className={stat.conversionRate >= 50 ? 'text-green-600' : stat.conversionRate >= 30 ? 'text-yellow-600' : 'text-red-600'}>
                      {stat.conversionRate.toFixed(1)}%
                    </span>
                  </td>
                  <td className="p-4 text-right text-xs font-bold text-gray-500">
                    {stat.conversionRate >= 50 ? 'High quality leads' : stat.conversionRate >= 30 ? 'Average performance' : 'Needs improvement'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* TIME SERIES CHART */}
      <section className="mb-16">
        <h2 className="text-3xl font-black mb-6 uppercase italic text-purple-700 underline">
          30-Day Conversion Trend
        </h2>
        <div className={`${getBorder('medium')} p-6 ${getShadow('medium')} bg-white`}>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.timeSeriesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(val) => new Date(val).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  stroke="#000"
                  fontSize={12}
                  fontWeight={700}
                />
                <YAxis 
                  yAxisId="left"
                  stroke="#000"
                  fontSize={12}
                  fontWeight={700}
                />
                <YAxis 
                  yAxisId="right"
                  orientation="right"
                  unit="%"
                  stroke="#000"
                  fontSize={12}
                  fontWeight={700}
                  domain={[0, 100]}
                />
                <Tooltip 
                  contentStyle={{ 
                    background: '#fff', 
                    border: '4px solid #000',
                    fontFamily: 'system-ui',
                    fontWeight: 700
                  }}
                />
                <Legend 
                  wrapperStyle={{ 
                    fontFamily: 'system-ui', 
                    fontWeight: 700,
                    fontSize: 12
                  }}
                />
                <Line 
                  yAxisId="left"
                  type="monotone" 
                  dataKey="leads" 
                  stroke="#2563eb" 
                  strokeWidth={3}
                  name="Leads"
                  activeDot={{ r: 6 }}
                />
                <Line 
                  yAxisId="left"
                  type="monian" 
                  dataKey="converted" 
                  stroke="#16a34a" 
                  strokeWidth={3}
                  name="Converted"
                />
                <Line 
                  yAxisId="right"
                  type="monotone" 
                  dataKey="conversionRate" 
                  stroke="#dc2626" 
                  strokeWidth={2}
                  name="Conversion %"
                  strokeDasharray="5 5"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      {/* INSIGHTS SUMMARY */}
      <section className="mb-16">
        <h2 className="text-3xl font-black mb-6 uppercase italic text-orange-700 underline">
          Key Insights
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div className={`bg-orange-50 ${getBorder('medium')} p-6 ${getShadow('small')}`}>
            <div className="text-4xl mb-4">🎯</div>
            <div className="text-xs font-black uppercase text-gray-500 mb-2">Best Performing Origin</div>
            <div className="text-2xl font-black">{data.insights.bestOrigin}</div>
            <div className="text-sm font-bold text-green-600 mt-2">
              {data.insights.bestConversionRate.toFixed(1)}% conversion
            </div>
          </div>
          <div className={`bg-blue-50 ${getBorder('medium')} p-6 ${getShadow('small')}`}>
            <div className="text-4xl mb-4">📊</div>
            <div className="text-xs font-black uppercase text-gray-500 mb-2">Total Channels</div>
            <div className="text-2xl font-black">{data.insights.totalOrigins}</div>
            <div className="text-sm font-bold text-gray-600 mt-2">
              Lead sources tracked
            </div>
          </div>
          <div className={`bg-purple-50 ${getBorder('medium')} p-6 ${getShadow('small')}`}>
            <div className="text-4xl mb-4">💡</div>
            <div className="text-xs font-black uppercase text-gray-500 mb-2">Recommendation</div>
            <div className="text-sm font-bold mt-2">
              {data.insights.bestConversionRate > 60 ? (
                "Double down on your best channel - it's crushing it!"
              ) : data.insights.bestConversionRate > 40 ? (
                "Solid performance across channels. Test paid ads on your best origin."
              ) : (
                "Focus on lead quality over quantity. Review your intake form."
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
