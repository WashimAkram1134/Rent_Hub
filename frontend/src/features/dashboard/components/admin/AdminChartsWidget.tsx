import { ChevronDown, ArrowUpRight } from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from "recharts";

const revenueData = [
  { name: "Mon", current: 25000, previous: 20000 },
  { name: "Tue", current: 40000, previous: 25000 },
  { name: "Wed", current: 35000, previous: 22000 },
  { name: "Thu", current: 55000, previous: 38000 },
  { name: "Fri", current: 95000, previous: 50000 },
  { name: "Sat", current: 65000, previous: 45000 },
  { name: "Sun", current: 85000, previous: 55000 },
];

const categoryData = [
  { name: 'Vehicles', value: 1317, color: '#4F46E5', percentage: '22%' },
  { name: 'Electronics', value: 767, color: '#3B82F6', percentage: '15%' },
  { name: 'Furniture', value: 522, color: '#10B981', percentage: '12%' },
  { name: 'Apartments', value: 418, color: '#F59E0B', percentage: '10%' },
  { name: 'Cameras', value: 279, color: '#EF4444', percentage: '8%' },
  { name: 'Others', value: 279, color: '#6B7280', percentage: '8%' },
];

const userGrowthData = Array.from({ length: 24 }).map((_, i) => ({
  date: `May ${i + 1}`,
  users: 2000 + Math.random() * 6000 + (i * 200)
}));

export function AdminChartsWidget() {
  return (
    <>
      <div className="lg:col-span-6 bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-sm font-bold text-slate-900">Revenue Overview</h2>
          <button className="flex items-center gap-1 text-xs text-slate-500 font-medium hover:text-slate-700">
            This Week <ChevronDown size={14} />
          </button>
        </div>
        <div className="flex items-center gap-6 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-1 bg-indigo-600 rounded-full"></div>
            <span className="text-xs text-slate-600 font-medium">This Week</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-1 bg-indigo-200 rounded-full border border-indigo-200 border-dashed"></div>
            <span className="text-xs text-slate-400 font-medium">Last Week</span>
          </div>
        </div>
        <div className="h-[250px] w-full mt-auto">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={revenueData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorCurrentAdmin" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#4F46E5" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} tickFormatter={(val) => `৳${val/1000}k`} />
              <RechartsTooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                labelStyle={{ color: '#64748b', fontSize: '12px', marginBottom: '4px' }}
              />
              <Area type="monotone" dataKey="previous" stroke="#c7d2fe" strokeWidth={2} strokeDasharray="5 5" fill="none" />
              <Area type="monotone" dataKey="current" stroke="#4F46E5" strokeWidth={3} fillOpacity={1} fill="url(#colorCurrentAdmin)" activeDot={{ r: 6, strokeWidth: 0, fill: '#4F46E5' }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="lg:col-span-3 bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-sm font-bold text-slate-900">Bookings by Category</h2>
          <button className="flex items-center gap-1 text-[10px] text-slate-500 font-medium hover:text-slate-700">
            This Week <ChevronDown size={14} />
          </button>
        </div>
        <div className="h-[180px] w-full relative mb-6">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
                stroke="none"
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-xl font-bold text-slate-900">3,482</span>
            <span className="text-[10px] text-slate-500">Total</span>
          </div>
        </div>
        <div className="space-y-3 mt-auto">
          {categoryData.map((cat, i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }}></div>
                <span className="text-xs text-slate-600 font-medium">{cat.name}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-slate-900">{cat.percentage}</span>
                <span className="text-[10px] text-slate-400 w-8 text-right">({cat.value})</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export function AdminUserGrowthChart() {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-sm font-bold text-slate-900">User Growth</h2>
        <button className="flex items-center gap-1 text-[10px] text-slate-500 font-medium hover:text-slate-700 bg-slate-50 px-2 py-1 rounded-md">
          This Month <ChevronDown size={14} />
        </button>
      </div>
      <div className="h-[180px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={userGrowthData} margin={{ top: 0, right: 0, left: -25, bottom: 0 }}>
            <XAxis dataKey="date" hide />
            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} tickFormatter={(val) => `${val/1000}K`} />
            <RechartsTooltip 
              cursor={{ fill: '#f8fafc' }}
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '12px' }}
            />
            <Bar dataKey="users" fill="#6366f1" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
