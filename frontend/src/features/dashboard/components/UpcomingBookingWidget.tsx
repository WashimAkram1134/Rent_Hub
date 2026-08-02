import { Calendar, Clock } from "lucide-react";

export interface UpcomingBooking {
  product?: {
    image_url?: string;
    title?: string;
  };
  delivery_option: string;
  start_date: string | Date;
}

export function UpcomingBookingWidget({ booking }: { booking: UpcomingBooking | null }) {
  if (!booking) return null;

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
      <h3 className="text-xs font-bold text-slate-900 mb-3 flex items-center gap-2">
        <Calendar size={14} className="text-blue-500" />
        Upcoming Booking
      </h3>
      <div className="flex gap-3">
        <div className="w-16 h-14 rounded-lg overflow-hidden shrink-0 border border-slate-100">
          <img
            src={booking.product?.image_url || "https://images.unsplash.com/photo-1590362891991-f776e747a588?auto=format&fit=crop&w=120&q=80"}
            alt={booking.product?.title || "Product"}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold text-slate-900 truncate">{booking.product?.title || 'Unknown Product'}</p>
          <p className="text-[10px] text-blue-600 font-semibold mt-0.5 capitalize">{booking.delivery_option} Tomorrow</p>
          <div className="flex items-center gap-1 mt-1">
            <Clock size={9} className="text-slate-400" />
            <span className="text-[9px] text-slate-500">{new Date(booking.start_date).toLocaleDateString()}</span>
          </div>
        </div>
      </div>
      <button className="w-full mt-3 py-2 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-xl hover:bg-indigo-100 transition-colors">
        View Booking
      </button>
    </div>
  );
}
