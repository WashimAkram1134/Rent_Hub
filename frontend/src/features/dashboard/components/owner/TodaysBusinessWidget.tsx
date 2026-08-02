import { Calendar, AlertCircle, RefreshCw, MessageSquare, ChevronRight } from "lucide-react";

export function TodaysBusinessWidget() {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
      <h2 className="text-sm font-bold text-slate-900 mb-5">Today's Business</h2>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-600">
            <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-md"><Calendar size={14} /></div>
            <span className="text-xs font-semibold">Today's Bookings</span>
          </div>
          <span className="text-sm font-bold text-slate-900">8</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-600">
            <div className="p-1.5 bg-amber-50 text-amber-500 rounded-md"><AlertCircle size={14} /></div>
            <span className="text-xs font-semibold">Pending Pickup</span>
          </div>
          <span className="text-sm font-bold text-slate-900">3</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-600">
            <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-md"><RefreshCw size={14} /></div>
            <span className="text-xs font-semibold">Returns Today</span>
          </div>
          <span className="text-sm font-bold text-slate-900">2</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-600">
            <div className="p-1.5 bg-blue-50 text-blue-500 rounded-md"><MessageSquare size={14} /></div>
            <span className="text-xs font-semibold">New Messages</span>
          </div>
          <span className="text-sm font-bold text-slate-900">5</span>
        </div>
      </div>
      <button className="w-full mt-5 bg-indigo-50 text-indigo-600 font-bold py-2 rounded-lg text-xs hover:bg-indigo-100 transition-colors flex items-center justify-center gap-1">
        View Schedule <ChevronRight size={14} />
      </button>
    </div>
  );
}
