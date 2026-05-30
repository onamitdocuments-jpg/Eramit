import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Language, User, Booking, ServiceItem 
} from '../types';
import { 
  Calendar, MapPin, IndianRupee, Phone, Trash2, 
  CheckCircle2, XCircle, Clock, Star 
} from 'lucide-react';

interface DashboardProps {
  language: Language;
  user: User;
  bookings: Booking[];
  setBookings: React.Dispatch<React.SetStateAction<Booking[]>>;
  services: ServiceItem[];
  onLogout: () => void;
  onUpdateProfile: (updatedUser: User) => void;
}

export default function Dashboard({
  language,
  user,
  bookings,
  setBookings,
  services,
  onLogout,
  onUpdateProfile
}: DashboardProps) {
  const isHi = language === 'hi';
  const [profileName, setProfileName] = useState(user.fullName);
  const [profileMobile, setProfileMobile] = useState(user.mobile);
  const [isEditing, setIsEditing] = useState(false);
  const [updateMsg, setUpdateMsg] = useState('');
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // Review states per completed booking
  const [reviewRating, setReviewRating] = useState<number>(5);
  const [reviewText, setReviewText] = useState<string>('');
  const [reviewingBookingId, setReviewingBookingId] = useState<string | null>(null);

  // Filter bookings belonging to this custom customer
  const userBookings = bookings.filter(b => 
    b.customerPhone === user.mobile ||
    b.customerName.toLowerCase() === user.fullName.toLowerCase()
  );

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setUpdateMsg('');

    if (profileName.trim().length < 3) {
      setUpdateMsg(isHi ? 'नाम कम से कम ३ अक्षरों का होना चाहिए' : 'Name must be at least 3 letters');
      return;
    }

    if (!/^[0-9]{10}$/.test(profileMobile)) {
      setUpdateMsg(isHi ? 'सटीक १० अंकों का फ़ोन नंबर डालें' : 'Enter a valid 10-digit number');
      return;
    }

    const updated: User = {
      ...user,
      fullName: profileName.trim(),
      mobile: profileMobile
    };

    onUpdateProfile(updated);
    setIsEditing(false);
    setUpdateMsg(isHi ? '✔ प्रोफ़ाइल सुरक्षित की गई!' : '✔ Profile updated successfully!');
    
    setTimeout(() => {
      setUpdateMsg('');
    }, 3000);
  };

  // Cancel booking (Only permitted BEFORE SERVICE_STARTED)
  const handleCancelBooking = (bookingId: string) => {
    const targetBooking = bookings.find(b => b.id === bookingId);
    if (!targetBooking) return;

    // Check if service starting has blocked cancellation
    const blockCancellationStatuses = [
      'SERVICE_STARTED',
      'SERVICE_IN_PROGRESS',
      'COMPLETED'
    ];

    if (blockCancellationStatuses.includes(targetBooking.status)) {
      alert(isHi 
        ? 'क्षमा करें, सेवा शुरू होने के पश्चात बुकिंग रद्द नहीं की जा सकती!' 
        : 'Once the service has started, the order cannot be cancelled!'
      );
      return;
    }

    if (confirm(isHi ? 'क्या आप सचमुच इस सर्विस बुकिंग को रद्द करना चाहते हैं?' : 'Are you sure you want to cancel this booking?')) {
      const updated = bookings.map(b => {
        if (b.id === bookingId) {
          const history = [...(b.statusHistory || [])];
          history.push({
            status: 'CANCELLED',
            timestamp: new Date().toISOString()
          });
          return {
            ...b,
            status: 'CANCELLED' as const,
            statusHistory: history
          };
        }
        return b;
      });

      setBookings(updated);
      localStorage.setItem('RC_BOOKINGS', JSON.stringify(updated));
    }
  };

  // Submit reviews
  const handleSubmitReview = (booking: Booking) => {
    if (!reviewText.trim()) {
      alert(isHi ? 'कृपया समीक्षा टिप्पणी दर्ज करें!' : 'Please write a brief feedback comment!');
      return;
    }

    // Save mock review to local storage
    const newReview = {
      id: Math.random().toString(),
      userNameHi: user.fullName,
      userNameEn: user.fullName,
      serviceId: booking.serviceId,
      rating: reviewRating,
      commentHi: reviewText,
      commentEn: reviewText,
      date: new Date().toLocaleDateString(),
      locationHi: isHi ? 'खलीलाबाद' : 'Khalilabad',
      locationEn: 'Khalilabad'
    };

    try {
      const existingReviewsStr = localStorage.getItem('RC_REVIEWS');
      const existing = existingReviewsStr ? JSON.parse(existingReviewsStr) : [];
      localStorage.setItem('RC_REVIEWS', JSON.stringify([newReview, ...existing]));
      alert(isHi ? 'प्रतिक्रया देने के लिए धन्यवाद!' : 'Thank you for your rating & feedback!');
      setReviewingBookingId(null);
      setReviewText('');
    } catch (e) {
      console.error(e);
    }
  };

  // Step definitions matching types.ts status checklist
  const TIMELINE_STEPS = [
    { value: 'CONFIRMED', en: 'Booking Confirmed', hi: 'बुकिंग पुष्ट हुई' },
    { value: 'PARTNER_ASSIGNED', en: 'Partner Assigned', hi: 'साथी आवंटित' },
    { value: 'PARTNER_TRAVELING', en: 'Partner Traveling', hi: 'मार्ग में' },
    { value: 'PARTNER_REACHED', en: 'Partner Reached', hi: 'पहुंच गए' },
    { value: 'SERVICE_STARTED', en: 'Service Started', hi: 'सेवा शुरू' },
    { value: 'SERVICE_IN_PROGRESS', en: 'Service In Progress', hi: 'प्रगति पर है' },
    { value: 'COMPLETED', en: 'Completed', hi: 'पूर्ण' }
  ];

  // Helper check status index
  const getStatusStepIndex = (currentStatus: string) => {
    if (currentStatus === 'BOOKING_CONFIRMED') return 0; // alias
    return TIMELINE_STEPS.findIndex(step => step.value === currentStatus);
  };

  return (
    <div className="bg-white rounded-3xl p-6 md:p-8 border border-gray-150 shadow-xs">
      
      {/* 1. Header Hero Panel */}
      <div className="bg-gradient-to-r from-teal-850 to-emerald-950 rounded-3xl p-6 md:p-8 text-white mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden shadow-lg shadow-teal-900/10">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-2xl pointer-events-none" />
        
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-white/10 text-emerald-300 flex items-center justify-center font-black text-2xl shadow-inner uppercase">
            {user.fullName[0]}
          </div>
          <div>
            <span className="text-[10px] font-bold text-emerald-300 uppercase tracking-widest bg-white/10 px-2.5 py-1 rounded-md inline-block">
              {isHi ? 'सत्यापित उपभोक्ता' : 'Verified Customer Dashboard'}
            </span>
            <h3 className="text-xl md:text-2xl font-black mt-2 font-display">
              {isHi ? `नमस्ते, ${user.fullName}` : `Welcome, ${user.fullName}`}
            </h3>
            <p className="text-xs text-teal-200/90 mt-1">
              Email ID: {user.email} | Mobile: {user.mobile}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="px-4 py-2 bg-white/10 hover:bg-white/15 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors border border-white/10 cursor-pointer animate-none"
          >
            <span>{isEditing ? (isHi ? 'रद्द करें' : 'Cancel') : (isHi ? 'प्रोफ़ाइल बदलें' : 'Edit Profile')}</span>
          </button>

          <button
            onClick={() => setShowLogoutConfirm(true)}
            className="px-4 py-2 bg-red-650 hover:bg-red-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer bg-red-605"
          >
            <span>{isHi ? 'लॉग आउट' : 'Log Out'}</span>
          </button>
        </div>
      </div>

      {/* Logout confirmation modal */}
      <AnimatePresence>
        {showLogoutConfirm && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
            <div className="bg-white rounded-3xl p-6 md:p-8 max-w-sm w-full text-center border border-gray-150 shadow-2xl">
              <div className="w-12 h-12 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <XCircle size={24} />
              </div>
              <h4 className="text-lg font-bold text-gray-950 font-display">
                {isHi ? 'लॉग आउट की पुष्टि करें' : 'Confirm Logout'}
              </h4>
              <p className="text-sm text-gray-500 mt-2">
                {isHi ? 'क्या आप सचमुच इस लॉगआउट सत्र को सुरक्षित समाप्त करना चाहते हैं?' : 'Are you sure you want to end your Rural Company active session?'}
              </p>
              <div className="flex items-center gap-3 mt-6 justify-center">
                <button
                  onClick={() => setShowLogoutConfirm(false)}
                  className="px-4 py-2 border border-gray-200 hover:bg-gray-50 rounded-xl text-xs font-bold text-gray-600 transition-colors cursor-pointer"
                >
                  {isHi ? 'नहीं, बने रहें' : 'Cancel'}
                </button>
                <button
                  onClick={() => {
                    setShowLogoutConfirm(false);
                    onLogout();
                  }}
                  className="px-4 py-2 bg-red-650 text-white rounded-xl text-xs font-black transition-colors cursor-pointer"
                >
                  {isHi ? 'हाँ, लॉगआउट करें' : 'Yes, Log Out'}
                </button>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left column: Profile Detail Change Form */}
        <div className="lg:col-span-1 space-y-6">
          
          {updateMsg && (
            <div className={`p-3 rounded-2xl text-xs font-bold ${updateMsg.startsWith('✔') ? 'bg-emerald-50 text-emerald-800 border border-emerald-150' : 'bg-red-50 text-red-800'}`}>
              {updateMsg}
            </div>
          )}

          <div className="bg-gray-50 rounded-3xl p-6 border border-gray-150">
            <h4 className="text-xs font-black text-gray-900 uppercase tracking-widest mb-4">
              {isHi ? 'आपकी प्रोफ़ाइल' : 'Customer Account Profile'}
            </h4>

            {isEditing ? (
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-550 uppercase tracking-wider mb-1">
                    {isHi ? 'पूरा नाम' : 'Full Name'}
                  </label>
                  <input
                    type="text"
                    required
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white border border-gray-200 rounded-xl font-semibold focus:border-teal-700 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-550 uppercase tracking-wider mb-1">
                    {isHi ? 'मोबाइल संख्या' : 'Mobile Number'}
                  </label>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={profileMobile}
                    onChange={(e) => setProfileMobile(e.target.value.replace(/\D/g, ''))}
                    className="w-full px-3 py-2 text-xs bg-white border border-gray-200 rounded-xl font-semibold focus:border-teal-700 focus:outline-hidden"
                  />
                </div>
                <div className="flex gap-2.5 pt-2">
                  <button
                    type="submit"
                    className="px-3 py-1.5 bg-teal-850 hover:bg-teal-900 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
                  >
                    {isHi ? 'सहेजें' : 'Save'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setProfileName(user.fullName);
                      setProfileMobile(user.mobile);
                      setIsEditing(false);
                    }}
                    className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-bold text-gray-600 cursor-pointer"
                  >
                    {isHi ? 'रद्द करें' : 'Discard'}
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4 text-xs font-medium text-gray-600">
                <div className="flex justify-between py-1.5 border-b border-gray-200/50">
                  <span className="text-gray-400">{isHi ? 'पूरा नाम:' : 'Full Name:'}</span>
                  <span className="text-gray-900 font-bold">{user.fullName}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-gray-200/50">
                  <span className="text-gray-400">{isHi ? 'पंजीकृत ईमेल:' : 'Email Address:'}</span>
                  <span className="text-gray-900 text-right truncate max-w-[150px]">{user.email}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-gray-200/50">
                  <span className="text-gray-400">{isHi ? 'मोबाइल नंबर:' : 'Mobile Number:'}</span>
                  <span className="text-gray-900 font-bold">{user.mobile}</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-gray-400">{isHi ? 'पंजीकरण दिनांक:' : 'Registered Date:'}</span>
                  <span className="text-gray-900">{user.registeredAt ? new Date(user.registeredAt).toLocaleDateString() : 'Direct Logged'}</span>
                </div>
              </div>
            )}
          </div>

          <div className="bg-teal-50/50 p-5 rounded-3xl border border-teal-100/70 text-xs text-teal-900 space-y-2">
            <h4 className="font-extrabold flex items-center gap-1.5 text-teal-950 uppercase tracking-wider text-xs">
              <span>🛡️</span>
              <span>{isHi ? 'सुरक्षित ग्राहक सेवा गारंटी' : 'Reliable Customer Guarantee'}</span>
            </h4>
            <p className="leading-relaxed text-gray-600 text-[11px]">
              {isHi 
                ? 'ग्रामीण स्तर पर प्रमाणित तकनीशियन और सर्वोत्तम होम सर्विस का वादा। सेवा शुरू होने तक आप कभी भी बुकिंग निःशुल्क रद्द कर सकते हैं।' 
                : 'Verified local technicians and safe workspace executions. Free cancellations are fully supported anytime until service has officially started at site.'}
            </p>
          </div>
        </div>

        {/* Right column: LIVE TRACKER TIMELINE & BOOKINGS LIST */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-black text-gray-950 font-display">
              {isHi ? 'आपकी बुकिंग एवं लाइव ट्रैकर' : 'Your Live Bookings & Tracker'}
            </h4>
            <span className="text-[10px] bg-gray-100 text-gray-600 px-3 py-1 rounded-full font-black uppercase">
              {userBookings.length} {isHi ? 'बुकिंग्स' : 'Bookings Found'}
            </span>
          </div>

          <div className="space-y-6">
            {userBookings.map(b => {
              const matchedService = services.find(s => s.id === b.serviceId);
              const activeStepIdx = getStatusStepIndex(b.status);
              const canCancel = activeStepIdx !== -1 && activeStepIdx < 4 && b.status !== 'CANCELLED';

              return (
                <div 
                  key={b.id} 
                  className="p-5 border border-gray-150 bg-gray-50/25 rounded-3xl border border-gray-200/80 space-y-5 shadow-xs"
                >
                  {/* Status header bar */}
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-mono text-[10px] font-bold text-gray-400 font-semibold">
                      ID: #{b.id?.toUpperCase().substring(0, 8)}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-wider uppercase ${
                      b.status === 'COMPLETED'
                        ? 'bg-emerald-50 text-emerald-800'
                        : b.status === 'CANCELLED'
                        ? 'bg-red-50 text-red-700'
                        : 'bg-amber-50 text-amber-900 border border-amber-200 animate-pulse'
                    }`}>
                      {b.status}
                    </span>
                  </div>

                  {/* Core details */}
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-extrabold text-sm text-gray-900">
                        {isHi ? matchedService?.nameHi || b.serviceNameHi : matchedService?.nameEn || b.serviceNameEn}
                      </h4>
                      <p className="text-xs text-gray-500 mt-1">
                        📅 Appointment Slot: <strong>{b.slotDate} ({b.slotTime})</strong>
                      </p>
                      <p className="text-[11px] text-gray-450 mt-1 flex items-start gap-1">
                        <MapPin size={11} className="text-red-500 shrink-0 mt-0.5" />
                        <span>{b.customerAddress}</span>
                      </p>
                    </div>

                    <strong className="text-teal-850 text-base font-black shrink-0 flex items-center">
                      <IndianRupee size={12} />
                      <span>{b.price}</span>
                    </strong>
                  </div>

                  {/* STEP-BY-STEP PROGRESS TRACKER TIMELINE */}
                  {b.status !== 'CANCELLED' && (
                    <div className="bg-white p-4 rounded-2xl border border-gray-200/60 shadow-inner">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-4 text-center">
                        📍 {isHi ? 'कदम-दर-कदम लाइव सेवा ट्रैकर' : 'Step-by-Step Live Service Progress Tracker'}
                      </p>

                      {/* Timeline steps */}
                      <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                        {/* Connecting background bar for MD layouts only */}
                        <div className="hidden md:block absolute left-4 right-4 top-4 h-0.5 bg-gray-200 -z-0" />

                        {TIMELINE_STEPS.map((step, idx) => {
                          const isDone = idx <= activeStepIdx;
                          const isCurrent = idx === activeStepIdx;
                          
                          // Look for timestamp in history
                          const histMatch = b.statusHistory?.find(sh => sh.status === step.value);
                          const timeString = histMatch 
                            ? new Date(histMatch.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
                            : null;

                          return (
                            <div key={idx} className="flex md:flex-col items-center gap-3 md:gap-1.5 md:flex-1 text-center relative z-10 w-full md:w-auto">
                              
                              {/* Glowing bullet */}
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black shrink-0 ${
                                isDone || isCurrent
                                  ? 'bg-teal-850 text-white shadow-md shadow-teal-900/10' 
                                  : 'bg-gray-150 text-gray-400'
                              }`}>
                                {isDone || isCurrent ? '✓' : idx + 1}
                              </div>

                              <div className="text-left md:text-center">
                                <p className={`text-[10px] font-bold ${
                                  isCurrent 
                                    ? 'text-teal-905 font-black underline text-teal-800' 
                                    : isDone 
                                    ? 'text-gray-800' 
                                    : 'text-gray-400'
                                }`}>
                                  {isHi ? step.hi : step.en}
                                </p>
                                {timeString && (
                                  <span className="text-[9px] font-mono text-teal-800 font-semibold block">
                                    🕒 {timeString}
                                  </span>
                                )}
                              </div>

                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Assigned Provider Detail card */}
                  {b.status !== 'CANCELLED' && b.partnerName && (
                    <div className="p-3 bg-white border border-gray-100 rounded-2xl flex items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-teal-850 text-white font-black flex items-center justify-center text-xs shrink-0">
                          {b.partnerName[0]}
                        </div>
                        <div>
                          <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">
                            {isHi ? 'आवंटित एक्सपर्ट पार्टनर' : 'Your Assigned Service Expert'}
                          </p>
                          <h6 className="font-extrabold text-gray-900">
                            {b.partnerName}
                          </h6>
                          <span className="text-[10px] text-gray-500 font-medium">📞 {b.partnerPhone}</span>
                        </div>
                      </div>

                      <a
                        href={`tel:${b.partnerPhone}`}
                        className="p-2 bg-teal-50 hover:bg-teal-100 text-teal-800 rounded-full transition-colors inline-block cursor-pointer"
                        title="Call service expert partner"
                      >
                        <Phone size={13} />
                      </a>
                    </div>
                  )}

                  {/* Actions / Cancellation Panel */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-gray-100/60">
                    
                    {b.status === 'COMPLETED' && (
                      <div className="w-full space-y-3">
                        <p className="text-xs text-emerald-850 font-bold text-center">
                          🎉 {isHi ? 'यह सेवा सफलतापूर्वक पूर्ण हो चुकी है!' : 'This home service work is fully solved & done!'}
                        </p>
                        
                        {/* Display rating feedback box */}
                        {reviewingBookingId === b.id ? (
                          <div className="bg-neutral-50 p-3 rounded-2xl border border-neutral-150 space-y-2.5">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                              {isHi ? 'एक्सपर्ट की सर्विस रेटिंग दर्ज करें:' : 'Rate your Service Expert:'}
                            </span>
                            <div className="flex gap-1.5 justify-center">
                              {[1, 2, 3, 4, 5].map(star => (
                                <button
                                  key={star}
                                  type="button"
                                  onClick={() => setReviewRating(star)}
                                  className="text-amber-400 focus:outline-hidden cursor-pointer"
                                >
                                  <Star size={20} fill={reviewRating >= star ? "currentColor" : "none"} />
                                </button>
                              ))}
                            </div>
                            <textarea
                              rows={2}
                              value={reviewText}
                              onChange={(e) => setReviewText(e.target.value)}
                              placeholder={isHi ? 'कैसा रहा आपका अनुभव? सकारात्मक टिप्पणी लिखें...' : 'Write custom feedback about inclusions, safety, hygiene...'}
                              className="w-full bg-white border border-gray-200 rounded-xl p-2 text-xs font-semibold focus:outline-hidden"
                            />
                            <div className="flex justify-end gap-2 text-xs">
                              <button
                                onClick={() => setReviewingBookingId(null)}
                                className="px-3 py-1 border border-gray-200 text-gray-500 rounded-lg cursor-pointer"
                              >
                                {isHi ? 'रद्द करें' : 'Decline'}
                              </button>
                              <button
                                onClick={() => handleSubmitReview(b)}
                                className="px-4 py-1 bg-teal-850 text-white rounded-lg font-black cursor-pointer"
                              >
                                {isHi ? 'जमा करें' : 'Post Feedback'}
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              setReviewingBookingId(b.id || '');
                              setReviewRating(5);
                            }}
                            className="mx-auto flex items-center gap-1 bg-amber-50 hover:bg-amber-100 text-amber-900 py-1.5 px-3 rounded-xl text-[11px] font-black cursor-pointer border border-amber-250/50"
                          >
                            <Star size={11} fill="currentColor" />
                            <span>{isHi ? 'एक्सपर्ट को रेटिंग दें (Add Review)' : 'Rate & Review Expert'}</span>
                          </button>
                        )}
                      </div>
                    )}

                    {canCancel ? (
                      <button
                        type="button"
                        onClick={() => handleCancelBooking(b.id || '')}
                        className="flex items-center gap-1 px-3 py-1.5 border border-red-200 text-red-700 hover:bg-red-50 text-[11px] font-bold rounded-xl cursor-pointer"
                        title={isHi ? 'बुकिंग रद्द करें (सेवा प्रारंभ होने से पहले)' : 'Cancel booking reservation before dispatch starts'}
                      >
                        <Trash2 size={12} />
                        <span>{isHi ? 'बुकिंग रद्द करें (Cancel)' : 'Cancel Booking'}</span>
                      </button>
                    ) : (
                      b.status !== 'COMPLETED' && b.status !== 'CANCELLED' && (
                        <span className="text-[10px] text-yellow-805 bg-yellow-50 px-2 py-0.5 rounded-md font-bold">
                          ⚠️ {isHi ? 'सेवा प्रगति पर है - बुकिंग अब रद्द नहीं की जा सकती।' : 'Active work on going. No cancellations allowed.'}
                        </span>
                      )
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {userBookings.length === 0 && (
            <div className="text-center py-20 bg-white border border-dashed border-gray-200 rounded-3xl">
              <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
                <Calendar size={18} className="text-gray-300" />
              </div>
              <p className="font-bold text-gray-700">
                {isHi ? 'अभी तक आपका कोई बुकिंग टिकट उपलब्ध नहीं है।' : 'Your booking log is currently empty.'}
              </p>
              <button
                onClick={() => {
                  const el = document.getElementById('services');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="mt-3 text-xs text-teal-850 hover:text-teal-950 font-black underline cursor-pointer"
              >
                {isHi ? 'बुकिंग शेड्यूल करने के लिए नीचे सेवा ग्रिड देखें!' : 'Order a home service appointment now'}
              </button>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
