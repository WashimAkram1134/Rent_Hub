import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const earningsData = [
  { name: "May 13", thisMonth: 15000, lastMonth: 12000 },
  { name: "May 14", thisMonth: 22000, lastMonth: 18000 },
  { name: "May 15", thisMonth: 18000, lastMonth: 24000 },
  { name: "May 16", thisMonth: 32000, lastMonth: 19000 },
  { name: "May 17", thisMonth: 28000, lastMonth: 22000 },
  { name: "May 18", thisMonth: 38000, lastMonth: 28000 },
  { name: "May 19", thisMonth: 35000, lastMonth: 30000 },
];

const bookingTrendData = [
  { name: "Mon", bookings: 12 },
  { name: "Tue", bookings: 18 },
  { name: "Wed", bookings: 24 },
  { name: "Thu", bookings: 16 },
  { name: "Fri", bookings: 32 },
  { name: "Sat", bookings: 42 },
  { name: "Sun", bookings: 38 },
];

export function EarningsChartWidget() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-sm font-bold text-slate-900">Earnings Overview</h2>
          <button className="text-indigo-600 hover:text-indigo-700 text-xs font-semibold">View report</button>
        </div>
        <div className="flex items-center gap-4 text-[10px] font-bold mb-6">
          <div className="flex items-center gap-1.5 text-indigo-600"><span className="w-3 h-0.5 bg-indigo-600 rounded-full"></span> This Month</div>
          <div className="flex items-center gap-1.5 text-slate-400"><span className="w-3 h-0.5 bg-slate-300 rounded-full border border-dashed border-slate-400"></span> Last Month</div>
        </div>
        <div className="h-[180px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={earningsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorThisMonth" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#4F46E5" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#94A3B8' }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#94A3B8' }} tickFormatter={(val) => `৳${val/1000}k`} />
              <Tooltip cursor={{ stroke: '#CBD5E1', strokeWidth: 1, strokeDasharray: '4 4' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
              <Area type="monotone" dataKey="lastMonth" stroke="#CBD5E1" strokeDasharray="5 5" fill="none" strokeWidth={2} />
              <Area type="monotone" dataKey="thisMonth" stroke="#4F46E5" strokeWidth={2} fillOpacity={1} fill="url(#colorThisMonth)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-sm font-bold text-slate-900">Booking Trend</h2>
          <button className="text-indigo-600 hover:text-indigo-700 text-xs font-semibold">View report</button>
        </div>
        <div className="flex items-center gap-4 text-[10px] font-bold mb-6">
          <div className="flex items-center gap-1.5 text-indigo-600"><div className="w-2 h-2 bg-indigo-600 rounded-full"></div> Bookings</div>
        </div>
        <div className="h-[180px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={bookingTrendData} margin={{ top: 10, right: 10, left: -30, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#94A3B8' }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#94A3B8' }} />
              <Tooltip cursor={{ fill: '#F1F5F9' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
              <Bar dataKey="bookings" fill="#4F46E5" radius={[4, 4, 0, 0]} barSize={16} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
