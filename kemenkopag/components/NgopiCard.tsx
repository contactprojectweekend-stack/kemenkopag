import { Calendar, Clock, MapPin } from 'lucide-react';

export default function NgopiCard({ invitation }: { invitation: any }) {
  return (
    <div className="bg-white rounded-2xl border border-cream p-5 shadow-sm space-y-3">
      <div className="flex justify-between items-center">
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-accent/20 text-accent">
          {invitation.topic}
        </span>
        <span className="text-xs text-gray-400">Maks. {invitation.max_participants} orang</span>
      </div>
      <h4 className="font-bold text-base text-primary-dark leading-snug">{invitation.title}</h4>
      <p className="text-xs text-gray-600">{invitation.description}</p>
      
      <div className="pt-2 text-xs text-gray-500 space-y-1">
        <div className="flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-accent" />
          <span className="font-medium text-primary-dark">{invitation.coffee_shops?.name || 'Spot Ngopi'}</span>
        </div>
        <div className="flex items-center gap-3 text-[11px]">
          <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {invitation.meeting_date}</span>
          <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {invitation.meeting_time}</span>
        </div>
      </div>
    </div>
  );
}