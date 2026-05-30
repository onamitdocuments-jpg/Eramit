import React from 'react';
import { 
  Briefcase, MapPin, Phone, CheckCircle2, Navigation, 
  Map, Play, ShieldCheck, XCircle, Clock, Calendar, IndianRupee
} from 'lucide-react';
import { Booking, ServiceItem, User } from '../types';

interface ProviderPanelProps {
  currentUser: User;
  bookings: Booking[];
  setBookings: React.Dispatch<React.SetStateAction<Booking[]>>;
  services: ServiceItem[];
  isHi: boolean;
  onLogout: () => void;
}

export default function ProviderPanel({
  currentUser,
  bookings,
  setBookings,
  services,
  isHi,
  onLogout
}: ProviderPanelProps) {
  
  // Filter bookings assigned to this current service provider by matching their registered phone
  const assignedJobs = bookings.filter(b => b.partnerPhone === currentUser.mobile);

  // Status indexer helper matching types.ts values
  const STATUS_STEPS = [
    'CONFIRMED',
    'PARTNER_ASSIGNED',
    'PARTNER_TRAVELING',
    'PARTNER_REACHED',
    'SERVICE_STARTED',
    'SERVICE_IN_PROGRESS',
    'COMPLETED'
  ];

  // Helper to get Hindi/English translation for display
  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'CONFIRMED': return isHi ? '✓ बुकिंग पुष्ट हुई' : '✓ Booking Confirmed';
      case 'PARTNER_ASSIGNED': return isHi ? '✓ सेवा पार्टनर असाइन' : '✓ Partner Assigned';
      case 'PARTNER_TRAVELING': return isHi ? '✓ पार्टनर मार्ग में है' : '✓ Partner Traveling';
      case 'PARTNER_REACHED': return isHi ? '✓ पार्टनर स्थान पर पहुंच गया' : '✓ Partner Reached Location';
      case 'SERVICE_STARTED': return isHi ? '✓ सेवा शुरू हुई' : '✓ Service Started';
      case 'SERVICE_IN_PROGRESS': return isHi ? '✓ कार्य प्रगति पर है' : '✓ Service In Progress';
      case 'COMPLETED': return isHi ? '✓ सेवा सफलतापूर्वक पूर्ण' : '✓ Service Completed';
      case 'CANCELLED': return isHi ? '❌ रद्द की गई' : '❌ Cancelled';
      default: return status;
    }
  };

  // Accept job (advances status to traveling)
  const handleAcceptJob = (bookingId: string) => {
    const updated = bookings.map(b => {
      if (b.id === bookingId) {
        const history = [...(b.statusHistory || [])];
        if (!history.some(h => h.status === 'PARTNER_TRAVELING')) {
          history.push({
            status: 'PARTNER_TRAVELING',
            timestamp: new Date().toISOString()
          });
        }
        return {
          ...b,
          status: 'PARTNER_TRAVELING' as const,
          statusHistory: history
        };
      }
      return b;
    });
    setBookings(updated);
    localStorage.setItem('RC_BOOKINGS', JSON.stringify(updated));
  };

  // Decline/Reject job
  const handleRejectJob = (bookingId: string) => {
    if (confirm(isHi ? 'क्या आप इस काम को अस्वीकार करना चाहते हैं?' : 'Are you sure you want to decline/reject this job?')) {
      const updated = bookings.map(b => {
        if (b.id === bookingId) {
          return {
            ...b,
            partnerName: 'Seeking Provider...',
            partnerPhone: '',
            status: 'CONFIRMED' as const // reset back to needing assignment
          };
        }
        return b;
      });
      setBookings(updated);
      localStorage.setItem('RC_BOOKINGS', JSON.stringify(updated));
    }
  };

  // Advance status to next step
  const handleAdvanceStatus = (bookingId: string, currentStatus: string) => {
    // If status is "BOOKING_CONFIRMED" alias, match to "CONFIRMED"
    const alignedStatus = currentStatus === 'BOOKING_CONFIRMED' ? 'CONFIRMED' : currentStatus;
    const currentIndex = STATUS_STEPS.indexOf(alignedStatus);
    if (currentIndex === -1 || currentIndex >= STATUS_STEPS.length - 1) return;

    const nextStatus = STATUS_STEPS[currentIndex + 1];

    const updated = bookings.map(b => {
      if (b.id === bookingId) {
        const history = [...(b.statusHistory || [])];
        if (!history.some(h => h.status === nextStatus)) {
          history.push({
            status: nextStatus,
            timestamp: new Date().toISOString()
          });
        }
        return {
          ...b,
          status: nextStatus as any,
          statusHistory: history
        };
      }
      return b;
    });

    setBookings(updated);
    localStorage.setItem('RC_BOOKINGS', JSON.stringify(updated));
  };

  // Helper values for current actions based on state index
  const getNextActionLabel = (currentStatus: string) => {
    const alignedStatus = currentStatus === 'BOOKING_CONFIRMED' ? 'CONFIRMED' : currentStatus;
    switch (alignedStatus) {
      case 'PARTNER_ASSIGNED': 
        return {
          label: isHi ? 'यात्रा शुरू करें (Start Travel)' : 'Start Traveling Now',
          icon: <Navigation size={14} />
        };
      case 'PARTNER_TRAVELING': 
        return {
          label: isHi ? 'पहुंचने की पुष्टि करें (Confirm Arrival)' : 'Confirm Arrival At Site',
          icon: <Map size={14} />
        };
      case 'PARTNER_REACHED': 
        return {
          label: isHi ? 'सेवा शुरू करें (Start Job)' : 'Initiate Customer Service',
          icon: <Play size={14} />
        };
      case 'SERVICE_STARTED': 
        return {
          label: isHi ? 'कार्य प्रगति पर मार्क करें' : 'Mark Task in Progress',
          icon: <Clock size={14} />
        };
      case 'SERVICE_IN_PROGRESS': 
        return {
          label: isHi ? 'सफलतापूर्वक पूरा चिह्नित करें' : 'Mark Service fully Completed',
          icon: <CheckCircle2 size={14} />
        };
      default: return null;
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen py-6 px-4 md:px-8 max-w-7xl mx-auto text-gray-800">
      
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 pb-5 mb-6">
        <div>
          <div className="flex items-center gap-2 text-teal-850">
            <Briefcase size={18} className="text-teal-700" />
            <span className="text-xs font-black uppercase tracking-widest text-teal-800 bg-teal-50 px-2.5 py-1 rounded-md">
              {isHi ? 'सेवा प्रदाता (Partner) पोर्टल' : 'Service Expert Partner Console'}
            </span>
          </div>
          <h2 className="text-xl md:text-2xl font-black text-gray-900 tracking-tight mt-1">
            {isHi ? `नमस्ते, ${currentUser.fullName}` : `Welcome, Partner ${currentUser.fullName}`}
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            {isHi 
              ? 'यहाँ आप अपने कस्टमाइज्ड असाइन कार्यों को स्वीकार कर सकते हैं और उनका लाइव स्टेटस अपडेट कर सकते हैं।' 
              : 'Keep track of assigned field appointments, accept job sheets, and update your real-time status.'}
          </p>
        </div>

        <button
          onClick={onLogout}
          className="px-4 py-2 border border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800 text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer self-start md:self-center"
        >
          {isHi ? 'लॉगआउट करें' : 'Logout Partner'}
        </button>
      </div>

      {/* Stats micro counters */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <div className="bg-white border border-gray-200 p-4 rounded-2xl">
          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{isHi ? 'कुल असाइन जॉब्स' : 'Total Assigned'}</div>
          <div className="text-2xl font-black text-gray-900 mt-1">{assignedJobs.length}</div>
        </div>
        <div className="bg-white border border-gray-200 p-4 rounded-2xl">
          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{isHi ? 'चालू / सक्रिय' : 'Active Tasks'}</div>
          <div className="text-2xl font-black text-teal-850 mt-1">
            {assignedJobs.filter(j => j.status !== 'COMPLETED' && j.status !== 'CANCELLED').length}
          </div>
        </div>
        <div className="bg-white border border-gray-200 p-4 rounded-2xl">
          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{isHi ? 'सफलतापूर्वक पूर्ण' : 'Fully Completed'}</div>
          <div className="text-2xl font-black text-emerald-800 mt-1">
            {assignedJobs.filter(j => j.status === 'COMPLETED').length}
          </div>
        </div>
        <div className="bg-white border border-gray-200 p-4 rounded-2xl font-black text-emerald-800 flex items-center gap-1">
          <ShieldCheck size={20} className="text-emerald-700" />
          <span className="text-xs uppercase tracking-widest">{isHi ? 'वेरीफाइड एक्सपर्ट' : 'Verified Partner'}</span>
        </div>
      </div>

      {/* Main jobs list */}
      <h3 className="text-sm font-black text-gray-400 uppercase tracking-wider mb-4">
        {isHi ? 'आपके असाइन कार्य बोर्ड' : 'Your Scheduled Job Sheets'} ({assignedJobs.length})
      </h3>

      <div className="space-y-6">
        {assignedJobs.map(job => {
          const matchedService = services.find(s => s.id === job.serviceId);
          const nextAction = getNextActionLabel(job.status);

          return (
            <div 
              key={job.id} 
              className="bg-white border border-gray-200 rounded-3xl p-5 hover:shadow-sm transition-shadow space-y-4"
            >
              
              {/* Job Header */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-gray-100 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-teal-850 bg-teal-50 px-2.5 py-1 rounded-md">
                      {isHi ? matchedService?.nameHi || job.serviceNameHi : matchedService?.nameEn || job.serviceNameEn}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                      job.status === 'COMPLETED' 
                        ? 'bg-emerald-50 text-emerald-855 text-emerald-800'
                        : job.status === 'CANCELLED'
                        ? 'bg-red-50 text-red-800'
                        : 'bg-amber-55 text-amber-900 border border-amber-200'
                    }`}>
                      {getStatusLabel(job.status)}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-500 mt-1">
                    Job ID: #{job.id?.substring(0, 8).toUpperCase()} | Appointment slot: <strong>{job.slotDate} ({job.slotTime})</strong>
                  </p>
                </div>

                <div className="text-teal-850 font-black text-base flex items-center">
                  <IndianRupee size={12} />
                  <span>{job.price}</span>
                </div>
              </div>

              {/* Grid content */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Client Profile */}
                <div className="bg-neutral-50/70 p-4 rounded-2xl border border-neutral-100 space-y-2">
                  <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                    <span>👤</span>
                    <span>{isHi ? 'ग्राहक एवं संपर्क विवरण' : 'Customer & Contact details'}</span>
                  </h4>
                  <div className="text-xs space-y-1">
                    <p className="font-extrabold text-gray-800">{job.customerName}</p>
                    <a 
                      href={`tel:${job.customerPhone}`} 
                      className="text-teal-800 hover:underline font-bold flex items-center gap-1.5 mt-2"
                    >
                      <Phone size={11} />
                      <span>📞 {job.customerPhone}</span>
                    </a>

                    <div className="mt-3 pt-2 border-t border-gray-150/50">
                      <p className="text-[10px] text-gray-400 uppercase font-bold">{isHi ? 'सेवा स्थल का पता:' : 'Service Address Location:'}</p>
                      <p className="font-bold text-gray-800 flex items-start gap-1.5 mt-1">
                        <MapPin size={14} className="text-red-500 shrink-0 mt-0.5" />
                        <span>{job.customerAddress}</span>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Job Step Updater Board */}
                <div className="space-y-3">
                  <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    {isHi ? 'स्थिति लाइव ट्रैकिंग गतिविधियां' : 'Live Physical Workspace Operations'}
                  </h4>

                  {/* Initial accept flow if PARTNER_ASSIGNED */}
                  {job.status === 'PARTNER_ASSIGNED' && (
                    <div className="p-4 bg-teal-50/50 border border-teal-150 rounded-2xl space-y-3 text-center">
                      <p className="text-xs text-teal-900 font-bold">
                        {isHi ? 'आपको यह नया काम असाइन किया गया है! क्या आप इसे स्वीकार करते हैं?' : 'A new home service dispatch has reached your channel. Respond below:'}
                      </p>
                      <div className="grid grid-cols-2 gap-2 max-w-xs mx-auto">
                        <button
                          type="button"
                          onClick={() => handleRejectJob(job.id || '')}
                          className="flex items-center justify-center gap-1 py-2 border border-red-200 text-red-700 bg-white hover:bg-red-50 rounded-xl text-xs font-bold cursor-pointer"
                        >
                          <XCircle size={14} />
                          <span>{isHi ? 'अस्वीकार करें' : 'Decline'}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAcceptJob(job.id || '')}
                          className="flex items-center justify-center gap-1 py-2 bg-teal-850 hover:bg-teal-950 text-white rounded-xl text-xs font-black cursor-pointer shadow-xs"
                        >
                          <CheckCircle2 size={14} />
                          <span>{isHi ? 'स्वीकार करें' : 'Accept Job'}</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Progressive action button */}
                  {nextAction && (
                    <div className="p-4 bg-gray-100 rounded-2xl border border-gray-200 text-center space-y-3">
                      <p className="text-xs font-bold text-gray-500">
                        {isHi ? 'कस्टमर के यहाँ पहुँच कर लाइव कदम बढ़ाएँ:' : 'Advance Job Stage In Real-time:'}
                      </p>
                      <button
                        type="button"
                        onClick={() => handleAdvanceStatus(job.id || '', job.status)}
                        className="w-full max-w-sm mx-auto flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-teal-800 to-emerald-850 hover:from-teal-900 hover:to-emerald-950 text-white rounded-2xl text-xs font-black shadow-lg shadow-teal-900/10 hover:scale-[1.01] transition-transform cursor-pointer"
                      >
                        {nextAction.icon}
                        <span>{nextAction.label}</span>
                      </button>
                    </div>
                  )}

                  {/* Completed status banner */}
                  {job.status === 'COMPLETED' && (
                    <div className="p-4 bg-emerald-50 border border-emerald-150 rounded-2xl flex flex-col items-center text-center gap-1">
                      <span className="text-2xl animate-bounce">🎉</span>
                      <p className="text-xs font-black text-emerald-850">
                        {isHi ? 'बधाई हो! यह सेवा सफलतापूर्वक पूरी हो गयी है।' : 'Excellence achieved! This service invoice is success and completed.'}
                      </p>
                      <p className="text-[10px] text-gray-400 mt-1">
                        {isHi ? 'ग्राहक द्वारा रेटिंग विवरण आपकी समीक्षा पटल पर जुड़ जायेगा' : 'Ratings left by customer will be listed in review tab.'}
                      </p>
                    </div>
                  )}

                  {job.status === 'CANCELLED' && (
                    <div className="p-4 bg-red-50 border border-red-150 rounded-2xl text-center">
                      <p className="text-xs font-bold text-red-700">
                        ❌ {isHi ? 'ग्राहक द्वारा यह ऑर्डर रद्द कर दिया गया है।' : 'Decommissioned: This appointment was cancelled by client.'}
                      </p>
                    </div>
                  )}

                  {/* Status checklist timestamp log */}
                  <div className="pt-2">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                      {isHi ? 'गतिविधि का समय और तिथियां' : 'Dispatcher Realtime Timestamps'}
                    </p>
                    <div className="space-y-1.5 font-mono text-[10px] text-gray-500 bg-gray-50 p-2.5 rounded-xl border border-gray-150">
                      {job.statusHistory && job.statusHistory.length > 0 ? (
                        job.statusHistory.map((sh, idx) => (
                          <div key={idx} className="flex justify-between items-center text-gray-600">
                            <span className="font-sans font-bold text-teal-850">✓ {sh.status.replace(/_/g, ' ')}</span>
                            <span>{new Date(sh.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                          </div>
                        ))
                      ) : (
                        <p className="text-[9px] text-gray-400 italic">{isHi ? 'कोई समय रिकॉर्ड नहीं मिला' : 'No recorded timing logs yet'}</p>
                      )}
                    </div>
                  </div>

                </div>

              </div>
              
            </div>
          );
        })}

        {assignedJobs.length === 0 && (
          <div className="text-center py-20 bg-white border border-dashed border-gray-200 rounded-3xl">
            <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
              <SparklesIcon />
            </div>
            <p className="text-xs font-bold text-gray-500">
              {isHi ? 'अभी आपके पास कोई असाइन कार्य नहीं है।' : 'Your schedule is clear. Dispatch will notify you when assigned.'}
            </p>
          </div>
        )}
      </div>

    </div>
  );
}

// Sparkles helper
function SparklesIcon() {
  return (
    <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  );
}
