/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ServiceItem, Language, Booking, User } from '../types';
import { DynamicIcon } from './Icons';

interface BookingModalProps {
  service: ServiceItem;
  language: Language;
  onClose: () => void;
  onSuccess: (booking: Booking) => void;
  currentUser?: User | null;
}

interface AddOn {
  id: string;
  nameHi: string;
  nameEn: string;
  price: number;
}

export default function BookingModal({ service, language, onClose, onSuccess, currentUser }: BookingModalProps) {
  const isHi = language === 'hi';
  const [step, setStep] = useState<number>(1);
  const [selectedAddOns, setSelectedAddOns] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [name, setName] = useState<string>(currentUser?.fullName || '');
  const [phone, setPhone] = useState<string>(currentUser?.mobile || '');
  const [address, setAddress] = useState<string>('');
  const [paymentMode, setPaymentMode] = useState<'COD' | 'ONLINE'>('COD');
  
  // Simulation states
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [bookingResult, setBookingResult] = useState<Booking | null>(null);

  // Suggested Add-ons based on service
  const addOnsMap: Record<string, AddOn[]> = {
    'ac-repair': [
      { id: 'gas', nameHi: 'गैस टॉप-अप और लीक सुधार', nameEn: 'Gas top-up & leaks fix', price: 599 },
      { id: 'foam', nameHi: 'फोम जेट वाश (अल्ट्रा सफाई)', nameEn: 'Foam jet wash (Deep clean)', price: 299 },
    ],
    'beauty-salon': [
      { id: 'facial', nameHi: 'हर्बल फेस पैक ग्लो ट्रीटमेंट', nameEn: 'Herbal face pack glow treatment', price: 349 },
      { id: 'massage', nameHi: 'हेड मसाज (15 मिनट रिलेक्स)', nameEn: 'Head massage (15 mins relax)', price: 199 },
    ],
    'plumbing': [
      { id: 'seal', nameHi: 'वाटरप्रूफ सीलेंट पेस्ट कोटिंग', nameEn: 'Waterproof sealant paste coating', price: 99 },
      { id: 'pipe', nameHi: 'पाइपलाइन वैक्यूम फ्लशिंग', nameEn: 'Pipeline vacuum flushing', price: 199 },
    ],
    'home-cleaning': [
      { id: 'disinfect', nameHi: 'एंटी-बैक्टीरियल डिसइन्फेक्शन स्प्रे', nameEn: 'Anti-bacterial disinfection spray', price: 249 },
      { id: 'fragrance', nameHi: 'प्रीमियम लैवेंडर सुगंध स्प्रे', nameEn: 'Premium lavender fragrance spray', price: 99 },
    ],
  };

  const genericAddOns: AddOn[] = [
    { id: 'safeguard', nameHi: 'कवर इंश्योरेंस और डैमेज प्रोटेक्शन', nameEn: 'Damage Protection Insurance', price: 49 },
    { id: 'express', nameHi: 'फास्ट ट्रैक स्लॉट (अगले 2 घंटे में)', nameEn: 'Express slot priority (under 2 hours)', price: 149 },
  ];

  const currentAddOns = addOnsMap[service.id] || genericAddOns;

  const toggleAddOn = (id: string) => {
    setSelectedAddOns(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const getAddOnTotal = () => {
    return currentAddOns
      .filter(item => selectedAddOns.includes(item.id))
      .reduce((sum, item) => sum + item.price, 0);
  };

  const getSubtotal = () => {
    return service.basePrice + getAddOnTotal();
  };

  const getPlatformFee = () => {
    return 39; // Fixed commission/platform fee as mentioned in business profile
  };

  const getGST = () => {
    return Math.round(getSubtotal() * 0.18); // 18% standard Indian GST
  };

  const getGrandTotal = () => {
    return getSubtotal() + getPlatformFee() + getGST();
  };

  // Pre-configured slots
  const dates = [
    { value: '2026-05-30', displayHi: 'आज (30 मई)', displayEn: 'Today (30 May)' },
    { value: '2026-05-31', displayHi: 'कल (31 मई)', displayEn: 'Tomorrow (31 May)' },
    { value: '2026-06-01', displayHi: 'सोमवार (01 जून)', displayEn: 'Monday (01 June)' },
    { value: '2026-06-02', displayHi: 'मंगलवार (02 जून)', displayEn: 'Tuesday (02 June)' }
  ];

  const times = [
    { value: '09:00 AM - 12:00 PM', hi: 'सुबह 09:00 - दोपहर 12:00', en: '09:00 AM - 12:00 PM' },
    { value: '12:00 PM - 03:00 PM', hi: 'दोपहर 12:00 - शाम 03:00', en: '12:00 PM - 03:00 PM' },
    { value: '03:00 PM - 06:00 PM', hi: 'शाम 03:00 - शाम 06:00', en: '03:00 PM - 06:00 PM' },
    { value: '06:00 PM - 09:00 PM', hi: 'शाम 06:00 - रात 09:00', en: '06:00 PM - 09:00 PM' }
  ];

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 3) {
      setStep(prev => prev + 1);
    } else {
      triggerSimulation();
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(prev => prev - 1);
    }
  };

  // Service partner database for simulations
  const partners = [
    { name: 'Rakesh Maurya', phone: '+91 98452 11094', rating: 4.9 },
    { name: 'Shiv Kumar Prasad', phone: '+91 87621 44521', rating: 4.8 },
    { name: 'Sunil Nishad', phone: '+91 76594 22351', rating: 4.9 },
    { name: 'Karan Chaudhary', phone: '+91 91102 33481', rating: 4.7 },
    { name: 'Satyendra Yadav', phone: '+91 94503 66721', rating: 4.9 }
  ];

  const triggerSimulation = () => {
    setIsSearching(true);
    
    // Simulate a network search delay for a verified service partner
    setTimeout(() => {
      const randomPartner = partners[Math.floor(Math.random() * partners.length)];
      const randomId = 'RC-' + Math.floor(100000 + Math.random() * 900000);
      
      const newBooking: Booking = {
        id: randomId,
        serviceId: service.id,
        serviceNameHi: service.nameHi,
        serviceNameEn: service.nameEn,
        customerName: name,
        customerPhone: phone,
        customerAddress: address,
        slotDate: selectedDate,
        slotTime: selectedTime,
        price: getGrandTotal(),
        status: 'CONFIRMED',
        partnerName: randomPartner.name,
        partnerPhone: randomPartner.phone,
        partnerRating: randomPartner.rating,
        timestamp: new Date().toISOString(),
      };

      setBookingResult(newBooking);
      setIsSearching(false);
    }, 2800);
  };

  const handleFinish = () => {
    if (bookingResult) {
      onSuccess(bookingResult);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md bg-black/60 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="relative bg-white w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl flex flex-col my-8"
      >
        {/* Header decoration */}
        <div className="relative bg-gradient-to-r from-teal-800 to-emerald-900 text-white p-6">
          <button
            onClick={onClose}
            className="absolute top-6 right-6 text-white/80 hover:text-white transition-colors bg-white/10 hover:bg-white/20 p-2 rounded-full"
            aria-label="Close"
          >
            <DynamicIcon name="X" size={16} />
          </button>
          
          <div className="flex items-center gap-3">
            <span className="p-2.5 rounded-2xl bg-white/15 text-emerald-300">
              <DynamicIcon name={service.iconName} size={22} />
            </span>
            <div>
              <p className="text-xs text-white/70 uppercase tracking-widest font-bold">
                {isHi ? 'भरोसेमंद ऑनलाइन बुकिंग' : 'Trusted Online Booking'}
              </p>
              <h3 className="text-xl font-bold font-display mt-0.5">
                {isHi ? service.nameHi : service.nameEn}
              </h3>
            </div>
          </div>

          {/* Stepper progress */}
          {!isSearching && !bookingResult && (
            <div className="flex justify-between items-center mt-6 pt-6 border-t border-white/10 text-xs">
              <div className="flex items-center gap-2">
                <span className={`w-6 h-6 rounded-full flex items-center justify-center font-bold ${step >= 1 ? 'bg-emerald-400 text-teal-950' : 'bg-white/20 text-white/70'}`}>1</span>
                <span>{isHi ? 'सेवाएं चुनें' : 'Customize'}</span>
              </div>
              <div className="w-10 h-[2px] bg-white/20" />
              <div className="flex items-center gap-2">
                <span className={`w-6 h-6 rounded-full flex items-center justify-center font-bold ${step >= 2 ? 'bg-emerald-400 text-teal-950' : 'bg-white/20 text-white/70'}`}>2</span>
                <span>{isHi ? 'समय चुनें' : 'Schedule'}</span>
              </div>
              <div className="w-10 h-[2px] bg-white/20" />
              <div className="flex items-center gap-2">
                <span className={`w-6 h-6 rounded-full flex items-center justify-center font-bold ${step >= 3 ? 'bg-emerald-400 text-teal-950' : 'bg-white/20 text-white/70'}`}>3</span>
                <span>{isHi ? 'पूरी जानकारी' : 'Address'}</span>
              </div>
            </div>
          )}
        </div>

        {/* Dynamic content cards */}
        <div className="p-6 md:p-8 flex-1 max-h-[60vh] overflow-y-auto">
          <AnimatePresence mode="wait">
            
            {/* SEARCHING LOADER */}
            {isSearching && (
              <motion.div
                key="searching"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="py-12 text-center flex flex-col items-center justify-center"
              >
                <div className="relative flex items-center justify-center">
                  {/* Outer spinning ring */}
                  <div className="w-20 h-20 border-4 border-emerald-100 border-t-teal-700 rounded-full animate-spin"></div>
                  {/* Inner static icon with pulsing */}
                  <div className="absolute animate-pulse text-teal-700">
                    <DynamicIcon name="Search" size={32} />
                  </div>
                </div>
                <h4 className="text-lg font-bold text-gray-900 mt-6 font-display">
                  {isHi ? 'सत्यापित पेशेवरों की खोज...' : 'Searching Verified Experts...'}
                </h4>
                <p className="text-sm text-gray-500 mt-2 max-w-sm">
                  {isHi
                    ? 'खलीलाबाद क्षेत्र में सक्रिय ४७,८८८+ पेशेवरों में से आपके पास सबसे नजदीकी और सर्वोत्तम रेटेड पार्टनर की उपलब्धता जाँची जा रही है...'
                    : 'Matching you with the highest-rated service partner from 47,888+ experts active in India & Khalilabad region...'}
                </p>
                <div className="w-full max-w-xs bg-gray-100 h-1.5 rounded-full overflow-hidden mt-6">
                  <motion.div
                    className="h-full bg-emerald-500"
                    initial={{ width: '0%' }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 2.8, ease: 'easeInOut' }}
                  />
                </div>
              </motion.div>
            )}

            {/* CONFIRMED BOOKING DETAILS */}
            {bookingResult && (
              <motion.div
                key="confirmed"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col"
              >
                <div className="text-center mb-6">
                  <div className="w-14 h-14 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                    <DynamicIcon name="CheckCircle" size={32} />
                  </div>
                  <h4 className="text-2xl font-black text-gray-900 font-display">
                    {isHi ? 'स्मार्ट बुकिंग पुष्ट हुई!' : 'Booking Confirmed!'}
                  </h4>
                  <p className="text-sm text-gray-500 mt-1">
                    {isHi ? `बुकिंग नंबर: ${bookingResult.id}` : `ID Code: ${bookingResult.id}`}
                  </p>
                </div>

                {/* Ticket Body */}
                <div className="bg-emerald-50/50 border border-emerald-100 rounded-3xl p-5 mb-6 text-sm flex flex-col gap-4">
                  <div className="flex justify-between items-center pb-3 border-b border-emerald-100/50">
                    <span className="font-semibold text-teal-900">
                      {isHi ? 'सेवा का प्रकार:' : 'Service Type:'}
                    </span>
                    <span className="text-gray-800 font-medium">
                      {isHi ? bookingResult.serviceNameHi : bookingResult.serviceNameEn}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pb-3 border-b border-emerald-100/50">
                    <div>
                      <span className="text-xs text-gray-500 block uppercase font-bold">
                        {isHi ? 'दिनांक / समय:' : 'Date & Time:'}
                      </span>
                      <strong className="text-gray-800 font-medium text-xs">
                        {bookingResult.slotDate} ({bookingResult.slotTime})
                      </strong>
                    </div>
                    <div>
                      <span className="text-xs text-gray-500 block uppercase font-bold">
                        {isHi ? 'अपेक्षित मूल्य (₹)' : 'Estimated Price(₹)'}
                      </span>
                      <strong className="text-teal-800 font-extrabold text-sm">
                        ₹{bookingResult.price}
                      </strong>
                    </div>
                  </div>

                  {/* Assigned Partner details */}
                  <div className="bg-white rounded-2xl p-4 border border-emerald-200 shadow-xs flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-700 text-white flex items-center justify-center font-bold text-lg">
                      {bookingResult.partnerName[0]}
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-emerald-800 font-bold uppercase tracking-wider">
                        {isHi ? 'सत्यापित सेवा भागीदार आवंटित' : 'Verified Partner Assigned'}
                      </p>
                      <h5 className="font-bold text-gray-900 mt-0.5">
                        {bookingResult.partnerName}
                      </h5>
                      <span className="text-xs text-amber-500 font-semibold flex items-center gap-1">
                        ★ {bookingResult.partnerRating} ({isHi ? 'प्रीमियम एक्सपर्ट' : 'Premium Expert'})
                      </span>
                    </div>
                    <div className="text-right">
                      <a
                        href={`tel:${bookingResult.partnerPhone}`}
                        className="p-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-full inline-block transition-colors"
                      >
                        <DynamicIcon name="Phone" size={16} />
                      </a>
                    </div>
                  </div>

                  <div>
                    <span className="text-xs text-gray-500 block uppercase font-bold">
                      {isHi ? 'सेवा का पता:' : 'Service Address:'}
                    </span>
                    <p className="text-gray-700 leading-relaxed mt-0.5 text-xs">
                      {bookingResult.customerName} - {bookingResult.customerPhone} <br />
                      {bookingResult.customerAddress}
                    </p>
                  </div>
                </div>

                <div className="bg-teal-950 text-white text-xs p-4 rounded-2xl text-center leading-relaxed">
                  {isHi
                    ? '👍 हमारे सेवा नियम के तहत, आपको कोई एडवांस भुगतान करने की आवश्यकता नहीं है। काम पूरा होने के बाद ही पेमेंट करें।'
                    : '👍 Direct commitment: No advance fees. Fully evaluate quality first, and then transfer the payment directly.'}
                </div>

                <button
                  type="button"
                  onClick={handleFinish}
                  className="mt-6 w-full py-4 bg-teal-800 hover:bg-teal-900 text-white bg-linear-to-r from-teal-800 to-emerald-800 rounded-2xl font-bold shadow-lg shadow-teal-900/10 hover:shadow-teal-900/20 transition-all text-center"
                >
                  {isHi ? 'मुख्य पृष्ठ पर वापस जाएँ' : 'Back to Main Page'}
                </button>
              </motion.div>
            )}

            {/* STEP 1: SELECT ADD-ONS & SERVICE DURATION */}
            {step === 1 && !isSearching && !bookingResult && (
              <motion.form
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                onSubmit={handleNext}
                className="space-y-6"
              >
                <div>
                  <h4 className="text-sm font-bold text-gray-500 uppercase tracking-widest">
                    {isHi ? 'सेवा विवरण' : 'Service Description'}
                  </h4>
                  <p className="text-sm text-gray-600 leading-relaxed mt-2 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                    {isHi ? service.descriptionHi : service.descriptionEn}
                  </p>
                </div>

                {/* Base price notification */}
                <div className="flex justify-between items-center p-4 bg-teal-50/50 border border-teal-100 rounded-2xl">
                  <div>
                    <span className="text-xs font-semibold text-teal-800 block">
                      {isHi ? 'मूल प्रारंभिक मूल्य' : 'Standard Base Price'}
                    </span>
                    <p className="text-xs text-gray-500">
                      {isHi ? '*सेवा निरीक्षण एवं प्राथमिक निदान शामिल' : '*Includes consultation and basic diagnosis'}
                    </p>
                  </div>
                  <strong className="text-2xl font-black text-teal-900 font-display">
                    ₹{service.basePrice}
                  </strong>
                </div>

                {/* Custom Addon Selection */}
                <div>
                  <h4 className="text-sm font-bold text-gray-900 mb-3">
                    {isHi ? 'अतिरिक्त विकल्प जोड़ें (Add-ons)' : 'Select Extra Options (Add-ons)'}
                  </h4>
                  <div className="space-y-3">
                    {currentAddOns.map(addon => {
                      const isSelected = selectedAddOns.includes(addon.id);
                      return (
                        <div
                          key={addon.id}
                          onClick={() => toggleAddOn(addon.id)}
                          className={`p-4 rounded-2xl border flex justify-between items-center cursor-pointer transition-all ${
                            isSelected
                              ? 'border-teal-700 bg-teal-50/40 shadow-xs'
                              : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50/30'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${
                              isSelected ? 'bg-teal-700 border-teal-700 text-white' : 'border-gray-300 bg-white'
                            }`}>
                              {isSelected && <DynamicIcon name="CheckCircle" size={12} />}
                            </div>
                            <span className="text-sm text-gray-700 font-medium">
                              {isHi ? addon.nameHi : addon.nameEn}
                            </span>
                          </div>
                          <strong className="text-sm text-gray-900">
                            +₹{addon.price}
                          </strong>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Live total display */}
                <div className="flex items-center justify-between border-t border-gray-100 pt-5 mt-6">
                  <div>
                    <span className="text-xs text-gray-400 block font-semibold uppercase">
                      {isHi ? 'अंतरिम सबटोटल' : 'Estimated Subtotal'}
                    </span>
                    <strong className="text-xl font-bold text-gray-900">
                      ₹{getSubtotal()}
                    </strong>
                  </div>
                  
                  <button
                    type="submit"
                    className="px-6 py-3 bg-teal-800 hover:bg-teal-900 text-white rounded-xl font-bold flex items-center gap-2 transition-colors duration-200"
                  >
                    <span>{isHi ? 'समय चुनें' : 'Schedule Setup'}</span>
                    <DynamicIcon name="ArrowRight" size={16} />
                  </button>
                </div>
              </motion.form>
            )}

            {/* STEP 2: SELECT DATE & TIME SLOT */}
            {step === 2 && !isSearching && !bookingResult && (
              <motion.form
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                onSubmit={(e) => {
                  e.preventDefault();
                  if (selectedDate && selectedTime) setStep(3);
                }}
                className="space-y-6"
              >
                <div>
                  <h4 className="text-sm font-bold text-gray-900 mb-3">
                    {isHi ? 'दिनांक सिलेक्ट करें' : 'Select Service Date'}
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    {dates.map(d => {
                      const isSelected = selectedDate === d.value;
                      return (
                        <div
                          key={d.value}
                          onClick={() => setSelectedDate(d.value)}
                          className={`p-4 rounded-2xl border text-center cursor-pointer transition-all ${
                            isSelected
                              ? 'border-teal-700 bg-teal-50/40 text-teal-800 font-bold'
                              : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50/20'
                          }`}
                        >
                          <p className="text-sm">
                            {isHi ? d.displayHi : d.displayEn}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-gray-900 mb-3">
                    {isHi ? 'उपयुक्त समय स्लॉट' : 'Available Time Windows'}
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {times.map(t => {
                      const isSelected = selectedTime === t.value;
                      return (
                        <div
                          key={t.value}
                          onClick={() => setSelectedTime(t.value)}
                          className={`p-3.5 rounded-2xl border flex items-center gap-2 cursor-pointer transition-all ${
                            isSelected
                              ? 'border-teal-700 bg-teal-50/40 text-teal-800 font-bold'
                              : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50/20'
                          }`}
                        >
                          <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                            isSelected ? 'bg-teal-700 border-teal-700 text-white' : 'border-gray-300'
                          }`}>
                            {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white block" />}
                          </div>
                          <span className="text-xs">
                            {isHi ? t.hi : t.en}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex items-center justify-between border-t border-gray-100 pt-5 mt-6">
                  <button
                    type="button"
                    onClick={handleBack}
                    className="px-5 py-3 border border-gray-200 hover:bg-gray-50/30 text-gray-600 rounded-xl font-bold transition-all text-sm"
                  >
                    {isHi ? 'पीछे जाएँ' : 'Back'}
                  </button>
                  
                  <button
                    type="submit"
                    disabled={!selectedDate || !selectedTime}
                    className={`px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-colors duration-200 ${
                      selectedDate && selectedTime
                        ? 'bg-teal-800 hover:bg-teal-900 text-white cursor-pointer'
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    <span>{isHi ? 'पता भरें' : 'Fill Address'}</span>
                    <DynamicIcon name="ArrowRight" size={16} />
                  </button>
                </div>
              </motion.form>
            )}

            {/* STEP 3: ADDRESS VALIDATION & SECURE PLACE */}
            {step === 3 && !isSearching && !bookingResult && (
              <motion.form
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                onSubmit={handleNext}
                className="space-y-4"
              >
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                    {isHi ? 'आपका पूरा नाम *' : 'Your Full Name *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={isHi ? 'अमित कुमार रंजन' : 'e.g. John Doe'}
                    className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-hidden focus:border-teal-700 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                    {isHi ? 'मोबाइल नंबर (१० अंक) *' : 'Mobile Number (10 digits) *'}
                  </label>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    minLength={10}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                    placeholder="94503 XXXX"
                    className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-hidden focus:border-teal-700 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                    {isHi ? 'घर का पता / स्थान (खलीलाबाद क्षेत्र आदि) *' : 'Service Delivery Address *'}
                  </label>
                  <textarea
                    required
                    rows={2}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder={isHi ? 'मकान नंबर १०, गोला बाजार रोड, खलीलहाबाद, संत कबीर नगर' : 'e.g. Flat 104, Industrial Area, Khalilabad'}
                    className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-hidden focus:border-teal-700 text-sm resize-none"
                  />
                </div>

                <div className="border-t border-gray-100 pt-4 mt-6">
                  <h5 className="text-xs font-extrabold text-gray-400 uppercase tracking-widest mb-3">
                    {isHi ? 'पारदर्शी रसीद ब्रेकडाउन' : 'Transparent Fee Receipt'}
                  </h5>
                  <div className="space-y-2 text-xs text-gray-600 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                    <div className="flex justify-between">
                      <span>{isHi ? 'सेवा सबटोटल शुल्क:' : 'Base & Items Subtotal:'}</span>
                      <span>₹{getSubtotal()}</span>
                    </div>
                    <div className="flex justify-between text-emerald-800">
                      <span>{isHi ? 'कमीशन एवं प्लेटफॉर्म शुल्क:' : 'Secure Platform Fee:'}</span>
                      <span>+₹{getPlatformFee()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>{isHi ? 'सरकारी कर (GST 18%):' : 'Estimated Tax (GST 18%):'}</span>
                      <span>+₹{getGST()}</span>
                    </div>
                    <div className="flex justify-between font-black text-sm text-gray-900 border-t border-gray-200/60 pt-2 mt-2">
                      <span>{isHi ? 'कुल देय राशि:' : 'Amount Due:'}</span>
                      <span className="text-teal-800 font-extrabold text-base">₹{getGrandTotal()}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                    {isHi ? 'भुगतान का माध्यम' : 'Choose Mode of Payment'}
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <div
                      onClick={() => setPaymentMode('COD')}
                      className={`p-3 rounded-2xl border text-center cursor-pointer transition-all flex items-center justify-center gap-1.5 ${
                        paymentMode === 'COD'
                          ? 'border-teal-700 bg-teal-50/40 text-teal-800 font-bold'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <DynamicIcon name="Coins" size={14} />
                      <span className="text-xs">{isHi ? 'काम के बाद नकद' : 'Cash on Delivery'}</span>
                    </div>
                    <div
                      onClick={() => setPaymentMode('ONLINE')}
                      className={`p-3 rounded-2xl border text-center cursor-pointer transition-all flex items-center justify-center gap-1.5 ${
                        paymentMode === 'ONLINE'
                          ? 'border-teal-700 bg-teal-50/40 text-teal-800 font-bold'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <DynamicIcon name="CreditCard" size={14} />
                      <span className="text-xs">{isHi ? 'सुरक्षित ऑनलाइन' : 'Secure Online'}</span>
                    </div>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex items-center justify-between border-t border-gray-100 pt-5 mt-6">
                  <button
                    type="button"
                    onClick={handleBack}
                    className="px-5 py-3 border border-gray-200 hover:bg-gray-50/30 text-gray-600 rounded-xl font-bold transition-all text-sm"
                  >
                    {isHi ? 'पीछे जाएँ' : 'Back'}
                  </button>
                  
                  <button
                    type="submit"
                    className="px-6 py-3 bg-gradient-to-r from-teal-800 to-emerald-800 hover:from-teal-900 hover:to-emerald-900 text-white rounded-xl font-black flex items-center gap-2 shadow-md hover:shadow-lg transition-all text-sm cursor-pointer"
                  >
                    <DynamicIcon name="ShieldCheck" size={16} />
                    <span>{isHi ? 'सुरक्षित बुकिंग रसीद पाएँ' : 'Confirm Secured Booking'}</span>
                  </button>
                </div>
              </motion.form>
            )}

          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
