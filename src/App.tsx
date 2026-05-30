/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Language, ServiceItem, Booking, User } from './types';
import { SERVICES_LIST, BUSINESS_STATS, FOUNDERS, CHARACTERISTICS } from './data/servicesData';
import { DynamicIcon } from './components/Icons';
import StatCard from './components/StatCard';
import BookingModal from './components/BookingModal';
import ReviewSection from './components/ReviewSection';
import AuthPortal from './components/AuthScreens';
import Dashboard from './components/Dashboard';
import AdminPanel from './components/AdminPanel';
import ProviderPanel from './components/ProviderPanel';

export default function App() {
  const [language, setLanguage] = useState<Language>('hi');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedService, setSelectedService] = useState<ServiceItem | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'Personal' | 'Repairs' | 'Cleaning'>('all');

  // Dynamic services list state
  const [services, setServices] = useState<ServiceItem[]>(() => {
    try {
      const stored = localStorage.getItem('RC_SERVICES');
      return stored ? JSON.parse(stored) : SERVICES_LIST;
    } catch {
      return SERVICES_LIST;
    }
  });

  // Login flow booking redirect caches
  const [pendingSelection, setPendingSelection] = useState<ServiceItem | null>(null);

  // Customer authentication states
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const loggedStr = localStorage.getItem('RC_LOGGED_USER');
      return loggedStr ? JSON.parse(loggedStr) : null;
    } catch {
      return null;
    }
  });

  const [showAuthPortal, setShowAuthPortal] = useState(false);
  const [authPortalMode, setAuthPortalMode] = useState<'login' | 'signup'>('login');
  const [showDashboard, setShowDashboard] = useState(() => {
    try {
      // Auto-open dashboard if they are already logged in to give instant usability path
      return !!localStorage.getItem('RC_LOGGED_USER');
    } catch {
      return false;
    }
  });

  // Persistent bookings history
  const [activeBookings, setActiveBookings] = useState<Booking[]>(() => {
    try {
      const stored = localStorage.getItem('RC_BOOKINGS');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const isHi = language === 'hi';

  const toggleLanguage = () => {
    setLanguage(prev => (prev === 'hi' ? 'en' : 'hi'));
  };

  // Safe scroll to section Helper
  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Filter services by search input (matching English or Hindi names)
  const filteredServices = services.filter(s => {
    const query = searchQuery.toLowerCase();
    const matchesName = s.nameHi.toLowerCase().includes(query) || s.nameEn.toLowerCase().includes(query);
    const matchesDesc = s.descriptionHi.toLowerCase().includes(query) || s.descriptionEn.toLowerCase().includes(query);
    const matchesCategory = s.categoryHi.toLowerCase().includes(query) || s.categoryEn.toLowerCase().includes(query);
    return matchesName || matchesDesc || matchesCategory;
  });

  // Unique categories
  const categories = [
    { value: 'all', hi: 'सभी सेवाएँ', en: 'All Services' },
    { value: 'Personal', hi: 'व्यक्तिगत सेवाएँ', en: 'Personal Care' },
    { value: 'Repairs', hi: 'उपकरण व मरम्मत', en: 'Repairs & Fixes' },
    { value: 'Cleaning', hi: 'सफाई एवं रखरखाव', en: 'Cleaning' }
  ];

  // Helper to map UI category tabs to base service item
  const getCategorizedServices = () => {
    if (activeTab === 'all') return filteredServices;
    return filteredServices.filter(s => {
      if (activeTab === 'Personal') return s.id === 'beauty-salon';
      if (activeTab === 'Repairs') return ['ac-repair', 'plumbing', 'electrical', 'painting', 'carpentry', 'appliance-repair', 'ro-water'].includes(s.id);
      if (activeTab === 'Cleaning') return ['home-cleaning', 'home-maintenance'].includes(s.id);
      return true;
    });
  };

  const handleBookNowClick = (s: ServiceItem) => {
    if (!currentUser) {
      setPendingSelection(s);
      setAuthPortalMode('login');
      setShowAuthPortal(true);
    } else {
      setSelectedService(s);
    }
  };

  const handleBookingSuccess = (booking: Booking) => {
    setActiveBookings(prev => {
      const updated = [booking, ...prev];
      try {
        localStorage.setItem('RC_BOOKINGS', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    // Scroll to the active bookings section at the top of the body
    setTimeout(() => {
      scrollTo('active-bookings-banner');
    }, 500);
  };

  const handleDismissBooking = (id: string) => {
    setActiveBookings(prev => {
      const updated = prev.filter(b => b.id !== id);
      try {
        localStorage.setItem('RC_BOOKINGS', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  };

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    try {
      localStorage.setItem('RC_LOGGED_USER', JSON.stringify(user));
    } catch (e) {}
    setShowAuthPortal(false);
    
    // Redirect logic: check if they had clicked "Book Now" before login
    if (pendingSelection) {
      // Direct customer accounts to booking modal, others to portal dashboard
      if (!user.role || user.role === 'customer') {
        setSelectedService(pendingSelection);
      } else {
        setShowDashboard(true);
      }
      setPendingSelection(null);
    } else {
      setShowDashboard(true);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    try {
      localStorage.removeItem('RC_LOGGED_USER');
    } catch (e) {}
    setShowDashboard(false);
  };

  const handleUpdateProfile = (updatedUser: User) => {
    setCurrentUser(updatedUser);
    try {
      localStorage.setItem('RC_LOGGED_USER', JSON.stringify(updatedUser));
      const usersStr = localStorage.getItem('RC_USERS');
      if (usersStr) {
        const users: User[] = JSON.parse(usersStr);
        const updatedUsers = users.map(u => u.email.toLowerCase() === updatedUser.email.toLowerCase() ? updatedUser : u);
        localStorage.setItem('RC_USERS', JSON.stringify(updatedUsers));
      }
    } catch (e) {}
  };

  const handleUpdateBookingStatus = (bookingId: string, status: 'PENDING' | 'CONFIRMED' | 'COMPLETED') => {
    setActiveBookings(prev => {
      const updated = prev.map(b => b.id === bookingId ? { ...b, status } : b);
      try {
        localStorage.setItem('RC_BOOKINGS', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  };

  const handleTriggerReview = (serviceId: string) => {
    setTimeout(() => {
      scrollTo('reviews');
    }, 600);
  };

  return (
    <div className="relative min-h-screen bg-neutral-50/50 text-neutral-800 antialiased font-sans flex flex-col justify-between">
      
      {/* BACKGROUND FLOATING GRADIENT OBJECTS */}
      <div className="absolute top-0 inset-x-0 h-[600px] bg-gradient-to-b from-teal-50/40 via-emerald-50/20 to-transparent -z-10 bg-grid-pattern" />
      <div className="absolute top-[800px] left-0 w-80 h-80 rounded-full bg-emerald-100/10 blur-3xl -z-10" />
      <div className="absolute top-[1800px] right-0 w-96 h-96 rounded-full bg-teal-100/10 blur-3xl -z-10" />

      {/* HEADER NAVBAR */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-xl border-b border-gray-100/80 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          
          {/* Logo Brand */}
          <div 
            onClick={() => scrollTo('hero')} 
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-11 h-11 bg-teal-800 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-teal-900/10 group-hover:scale-105 transition-transform duration-300">
              <DynamicIcon name="Home" size={20} className="text-emerald-300" />
            </div>
            <div>
              <span className="text-xl font-black text-gray-900 tracking-tight font-display flex items-center gap-1.5 leading-none">
                Rural Company <span className="text-xs font-bold text-teal-700 bg-teal-50 px-2 py-1 rounded-sm border border-teal-100/80">2026</span>
              </span>
              <p className="text-[10px] text-gray-400 font-bold tracking-widest uppercase mt-1">
                {isHi ? 'स्थापना २०२५ | खलीलाबाद' : 'Estd. 2025 | Khalilabad HQ'}
              </p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-gray-600">
            <button onClick={() => scrollTo('services')} className="hover:text-teal-800 transition-colors cursor-pointer">
              {isHi ? 'सेवाएँ' : 'Services'}
            </button>
            <button onClick={() => scrollTo('stats')} className="hover:text-teal-800 transition-colors cursor-pointer">
              {isHi ? 'प्रमुख आँकड़े' : 'Business Stats'}
            </button>
            <button onClick={() => scrollTo('features')} className="hover:text-teal-800 transition-colors cursor-pointer">
              {isHi ? 'विशेषताएँ' : 'Core Features'}
            </button>
            <button onClick={() => scrollTo('about')} className="hover:text-teal-800 transition-colors cursor-pointer">
              {isHi ? 'हमारे बारे में' : 'About Us'}
            </button>
            <button onClick={() => scrollTo('reviews')} className="hover:text-teal-800 transition-colors cursor-pointer">
              {isHi ? 'समीक्षाएं' : 'Client Reviews'}
            </button>
          </nav>

          {/* Language Switch and Call to Action Booking */}
          <div className="flex items-center gap-3">
            {/* Language Toggle Button */}
            <button
              onClick={toggleLanguage}
              className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 border border-gray-200 rounded-xl font-black text-xs cursor-pointer flex items-center gap-1.5 transition-colors text-gray-700 hover:scale-105"
              aria-label="Toggle Language"
            >
              <span>🌐</span>
              <span>{isHi ? 'English' : 'हिंदी'}</span>
            </button>

            {/* Secure Authentication Trigger / Dashboard View Switcher */}
            {currentUser ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setShowDashboard(!showDashboard);
                    if (!showDashboard) {
                      setTimeout(() => scrollTo('customer-dashboard-viewport'), 200);
                    }
                  }}
                  className={`px-3 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 border cursor-pointer hover:scale-[1.02] ${
                    showDashboard
                      ? 'bg-teal-800 text-white border-teal-800'
                      : 'bg-teal-50 border-teal-150 text-teal-800 hover:bg-teal-100/70'
                  }`}
                >
                  <DynamicIcon name="User" size={12} />
                  <span className="max-w-[70px] truncate sm:max-w-none">
                    {currentUser.fullName.split(' ')[0]}
                  </span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setAuthPortalMode('login');
                  setShowAuthPortal(true);
                }}
                className="px-3.5 py-2 bg-neutral-100 hover:bg-neutral-200 border border-neutral-200 text-neutral-800 font-extrabold text-xs rounded-xl cursor-pointer flex items-center gap-1 transition-all hover:scale-105"
              >
                <DynamicIcon name="Lock" size={11} />
                <span>{isHi ? 'लॉग इन' : 'Login'}</span>
              </button>
            )}

            <button
              onClick={() => scrollTo('services')}
              className="px-4 py-2 bg-teal-800 hover:bg-teal-900 bg-linear-to-r from-teal-800 to-emerald-800 text-white font-black text-xs rounded-xl shadow-lg shadow-teal-900/10 cursor-pointer hidden sm:block hover:scale-[1.02] active:scale-95 transition-all text-center shrink-0"
            >
              {isHi ? 'सेवा बुक करें' : 'Get Service'}
            </button>
          </div>
        </div>
      </header>

      {/* BODY MAIN */}
      <main className="flex-1">

        {/* ACTIVE BOOKINGS FLOATING NOTIFICATIONS */}
        <div id="active-bookings-banner" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
          <AnimatePresence>
            {activeBookings.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-teal-900 text-white p-5 rounded-3xl border border-teal-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="flex gap-3 items-start">
                  <div className="p-2.5 rounded-2xl bg-teal-800 text-emerald-300">
                    <DynamicIcon name="CheckCircle" size={24} className="animate-pulse" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold font-display">
                      {isHi ? 'सक्रिय बुकिंग सफलता!' : 'Successful Local Booking Ticket!'}
                    </h4>
                    <p className="text-xs text-teal-200/90 mt-1 leading-relaxed">
                      {isHi
                        ? `आपकी ${activeBookings[0].serviceNameHi} बुकिंग (ID: ${activeBookings[0].id}) के लिए पेशेवर ${activeBookings[0].partnerName} को आवंटित किया गया है। वे यथासमय आपसे संपर्क करेंगे।`
                        : `Your order for ${activeBookings[0].serviceNameEn} (ID: ${activeBookings[0].id}) is confirmed. Master Expert ${activeBookings[0].partnerName} is en-route for delivery.`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <a
                    href={`tel:${activeBookings[0].partnerPhone}`}
                    className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-teal-950 font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md transition-colors"
                  >
                    <DynamicIcon name="Phone" size={12} />
                    <span>{isHi ? 'एक्सपर्ट को कॉल करें' : 'Dial Expert'}</span>
                  </a>
                  <button
                    onClick={() => handleDismissBooking(activeBookings[0].id)}
                    className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors"
                  >
                    <DynamicIcon name="X" size={14} />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* HERO SECTION */}
        <section id="hero" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16 text-center">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Branding Tagline */}
            <span className="text-xs font-black text-teal-800 bg-teal-50 border border-teal-100 inline-block px-4 py-2 rounded-full uppercase tracking-widest mb-6">
              {isHi ? 'प्रशिक्षित और सत्यापित पेशेवरों का मंच' : 'India\'s Safest Home Services Marketplace'}
            </span>

            {/* Main Display Heading */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-gray-900 tracking-tight font-display max-w-4xl mx-auto leading-tight">
              {isHi ? 'घरेलू सेवाएँ अब और भी' : 'Household Administration Made'} <br />
              <span className="text-teal-800 bg-clip-text">
                {isHi ? 'भरोसेमंद, पारदर्शी और तकनीक-संचालित' : 'Transparent, Safe & Technology-Driven'}
              </span>
            </h1>

            {/* Underline Subtitle */}
            <p className="text-base sm:text-lg text-gray-500 mt-6 max-w-2xl mx-auto leading-relaxed font-normal">
              {isHi
                ? 'Rural Company भारत की अग्रणी होम सर्विसेज़ कंपनी है, जो विश्वसनीय सौंदर्य, सफाई, रिपेयरिंग, और रखरखाव सेवाएं सीधे आपके घर पहुँचाती है।'
                : 'Rural Company connects millions of households to verified, highly skilled local experts for premium household works and beauty services.'}
            </p>
          </motion.div>

          {/* SEARCH INTERACTIVE DISCOVERY AREA */}
          <div className="mt-10 max-w-xl mx-auto">
            <div className="relative bg-white rounded-3xl shadow-xl shadow-gray-200/50 p-2 border border-gray-150 transition-shadow focus-within:shadow-2xl">
              <div className="flex items-center gap-2 px-3">
                <span className="text-gray-400">
                  <DynamicIcon name="Search" size={18} />
                </span>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={isHi ? 'सेवा खोजें: एसी, ब्यूटी, प्लंबर, पेंटिंग...' : 'What help do you need today? e.g. AC repair, salon...'}
                  className="w-full py-3.5 focus:outline-hidden text-sm text-gray-800 font-semibold placeholder-gray-400"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="p-1 hover:bg-gray-150 rounded-full transition-colors"
                  >
                    <DynamicIcon name="X" size={14} />
                  </button>
                )}
              </div>
            </div>

            {/* Quick Helper Tags */}
            <div className="flex flex-wrap items-center justify-center gap-2 mt-4 text-xs font-semibold text-gray-500">
              <span>{isHi ? 'लोकप्रिय खोजें:' : 'Trending Services:'}</span>
              {['एसी रिपेयर', 'ब्यूटी', 'प्लंबिंग', 'सफाई'].map(tag => (
                <button
                  key={tag}
                  onClick={() => setSearchQuery(tag)}
                  className="px-3 py-1 bg-white hover:bg-gray-100 border border-gray-200 rounded-lg text-teal-800 cursor-pointer transition-colors"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* CUSTOMER DASHBOARD CONTAINER */}
        <AnimatePresence mode="wait">
          {currentUser && showDashboard && (
            <motion.section
              key="customer-dashboard-section"
              id="customer-dashboard-viewport"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 border-b border-neutral-100"
            >
              {currentUser.role === 'admin' ? (
                <AdminPanel
                  currentUser={currentUser}
                  services={services}
                  setServices={setServices}
                  bookings={activeBookings}
                  setBookings={setActiveBookings}
                  isHi={isHi}
                  onLogout={handleLogout}
                />
              ) : currentUser.role === 'provider' ? (
                <ProviderPanel
                  currentUser={currentUser}
                  bookings={activeBookings}
                  setBookings={setActiveBookings}
                  services={services}
                  isHi={isHi}
                  onLogout={handleLogout}
                />
              ) : (
                <Dashboard
                  language={language}
                  user={currentUser}
                  bookings={activeBookings}
                  setBookings={setActiveBookings}
                  services={services}
                  onLogout={handleLogout}
                  onUpdateProfile={handleUpdateProfile}
                />
              )}
            </motion.section>
          )}
        </AnimatePresence>

        {/* SERVICES CATEGORIZED SHOWCASE GRID */}
        <section id="services" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 border-t border-gray-100/60">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
            <div>
              <span className="text-xs font-black text-teal-800 uppercase tracking-widest bg-emerald-50 px-3 py-1.5 rounded-full inline-block">
                {isHi ? 'हमारी प्रमुख सेवाएँ' : 'What we offer'}
              </span>
              <h2 className="text-3xl font-black text-gray-900 mt-3 font-display">
                {isHi ? 'पेशेवर सेवाएँ, सीधे आपके घर पर' : '10 Comprehensive In-Home Specializations'}
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                {isHi ? 'प्रीमियम होम ब्यूटी पार्लर से लेकर जटिल इलेक्ट्रिक एवं वाटर प्यूरीफायर सर्विस तक।' : 'From premium beauty consultations to complicated appliance and plumbing repairs.'}
              </p>
            </div>

            {/* Category horizontal filters */}
            <div className="flex flex-wrap gap-1.5 bg-gray-100/70 p-1 rounded-2xl border border-gray-200/50 self-start md:self-auto">
              {categories.map(cat => (
                <button
                  key={cat.value}
                  onClick={() => setActiveTab(cat.value as any)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    activeTab === cat.value
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-500 hover:text-gray-800'
                  }`}
                >
                  {isHi ? cat.hi : cat.en}
                </button>
              ))}
            </div>
          </div>

          {/* Services Grid cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout text">
              {getCategorizedServices().length === 0 ? (
                <div className="col-span-full py-16 text-center text-gray-400 font-semibold text-sm">
                  {isHi
                    ? 'क्षमा करें, आपकी खोज के अनुरूप कोई सेवा नहीं मिली। कृपया अन्य नाम टाइप करें।'
                    : 'No matching services found. Try typing another keyword.'}
                </div>
              ) : (
                getCategorizedServices().map((s, idx) => (
                  <motion.div
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.4, delay: idx * 0.03 }}
                    key={s.id}
                    className="group relative bg-white rounded-3xl p-6 border border-gray-100 flex flex-col justify-between h-72 hover:shadow-2xl hover:border-teal-500/20 transition-all"
                  >
                    <div>
                      {/* Icon */}
                      <div className="w-12 h-12 bg-teal-50 text-teal-800 rounded-2xl flex items-center justify-center transition-colors group-hover:bg-teal-700 group-hover:text-white">
                        <DynamicIcon name={s.iconName} size={22} />
                      </div>

                      <h3 className="text-lg font-bold text-gray-900 mt-5 font-display flex items-center gap-2">
                        {isHi ? s.nameHi : s.nameEn}
                      </h3>
                      
                      <p className="text-xs text-gray-400 uppercase font-black tracking-widest mt-1">
                        {isHi ? s.categoryHi : s.categoryEn}
                      </p>

                      <p className="text-xs text-gray-500 leading-relaxed mt-3 max-w-sm line-clamp-2">
                        {isHi ? s.descriptionHi : s.descriptionEn}
                      </p>
                    </div>

                    <div className="flex items-center justify-between border-t border-gray-100 pt-4 mt-4">
                      <div>
                        <span className="text-[10px] text-gray-400 block font-semibold uppercase">
                          {isHi ? 'प्रारंभिक शुल्क' : 'Base Price Starts'}
                        </span>
                        <strong className="text-lg font-extrabold text-teal-900 font-display">
                          ₹{s.basePrice}
                        </strong>
                      </div>

                      <button
                        onClick={() => handleBookNowClick(s)}
                        className="px-4 py-2 bg-teal-800 hover:bg-teal-900 text-white rounded-xl text-xs font-extrabold transition-all cursor-pointer group-hover:scale-105 active:scale-95"
                      >
                        {isHi ? 'बुक करें' : 'Book Now'}
                      </button>
                    </div>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </section>

        {/* FINANCIALS & FY 2026 STATS DASHBOARD */}
        <section id="stats" className="bg-teal-950 text-white py-20 bg-dot-pattern">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <span className="text-xs font-black text-emerald-300 uppercase tracking-widest bg-white/10 px-4 py-2 rounded-full inline-block">
                📈 FY 2026 {isHi ? 'प्रमुख समीक्षा और वित्तीय प्रदर्शन' : 'Performance Indicators'}
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold font-display leading-tight mt-5 text-white">
                {isHi ? 'भारत के सबसे बड़े होम सर्विस प्लेटफॉर्म्स में से एक' : 'Scale & Reach Worldwide'}
              </h2>
              <p className="text-sm text-teal-200/80 mt-4 leading-relaxed max-w-2xl mx-auto font-normal">
                {isHi
                  ? 'तकनीक और पारदर्शिता के साथ Rural Company ने वित्त वर्ष २०२६ में अभूतपूर्व वित्तीय ऊंचाइयां हासिल की हैं, जो सेवा क्षेत्र में हमारे अटूट नेतृत्व को दर्शाती हैं।'
                  : 'Empowered by top-tier algorithms, we delivered record consolidated cash receipts in FY 2026, marking a monumental presence across international territories.'}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
              {BUSINESS_STATS.map(metric => (
                <StatCard key={metric.id} metric={metric} language={language} />
              ))}
            </div>
            
            {/* Visual geographic areas ribbon */}
            <div className="mt-12 p-5 bg-white/5 rounded-3xl border border-white/10 flex flex-wrap gap-4 items-center justify-center text-xs">
              <span className="font-bold text-teal-200 uppercase tracking-wider">{isHi ? 'संचालित देश:' : 'Official Territories:'}</span>
              {['भारत (India)', 'संयुक्त अरब अमीरात (UAE)', 'सिंगापुर (Singapore)', 'सऊदी अरब (Saudi Arabia)'].map(area => (
                <div key={area} className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-lg border border-white/10">
                  <span className="text-center">🌐</span>
                  <span>{area}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* MISSION & VISION */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-stretch">
            
            {/* MISSION */}
            <div className="p-8 bg-linear-to-br from-teal-50 to-emerald-50 rounded-3xl border border-teal-100 flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 bg-teal-800 text-white rounded-2xl flex items-center justify-center shadow-md">
                  <DynamicIcon name="TrendingUp" size={20} className="text-emerald-300" />
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-teal-950 font-display mt-6">
                  {isHi ? 'हमारा मिशन (Our Mission)' : 'Our Boundless Mission'}
                </h3>
                <blockquote className="text-base sm:text-lg text-teal-900 leading-relaxed font-semibold italic mt-4 border-l-4 border-teal-700 pl-4">
                  "{isHi
                    ? 'ग्राहकों को उच्च गुणवत्ता वाली घरेलू सेवाएँ उपलब्ध कराना तथा सेवा पेशेवरों के लिए बेहतर आय और रोजगार के अवसर प्रदान करना।'
                    : 'To deliver exceptional home services to clients while granting unparalleled earnings and respectful job opportunities to skilled taskers.'}"
                </blockquote>
              </div>
              <p className="text-xs text-teal-700/80 mt-6 leading-relaxed">
                {isHi
                  ? 'हम मानते हैं कि समाज का सशक्तिकरण कौशल के समुचित आदर और डिजिटल तकनीक के एकीकरण से ही संभव है।'
                  : 'We actively structure tools that secure financial emancipation for service professionals directly in the rural and urban belts.'}
              </p>
            </div>

            {/* VISION */}
            <div className="p-8 bg-linear-to-br from-amber-50 to-orange-50 rounded-3xl border border-amber-100 flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 bg-amber-700 text-white rounded-2xl flex items-center justify-center shadow-md">
                  <DynamicIcon name="ShieldCheck" size={20} className="text-amber-300" />
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-amber-950 font-display mt-6">
                  {isHi ? 'हमारा विज़न (Our Vision)' : 'Our Grand Vision'}
                </h3>
                <blockquote className="text-base sm:text-lg text-amber-900 leading-relaxed font-semibold italic mt-4 border-l-4 border-amber-700/80 pl-4">
                  "{isHi
                    ? 'तकनीक के माध्यम से दुनिया का सबसे भरोसेमंद होम सर्विस प्लेटफ़ॉर्म बनना।'
                    : 'To engineer the world\'s most dependable, safe, and transparent home-care platform powered by modern technology.'}"
                </blockquote>
              </div>
              <p className="text-xs text-amber-700/80 mt-6 leading-relaxed">
                {isHi
                  ? 'वैश्विक स्तर पर गुणवत्ता के नए मानकों को स्थापित करते हुए २१वीं सदी के डिजिटल समाज का निर्माण।'
                  : 'Pioneering global standards in logistics and tech to secure a trusted in-home utility network.'}
              </p>
            </div>

          </div>
        </section>

        {/* CHARACTERISTICS SECTION (कंपनी की विशेषताएँ) */}
        <section id="features" className="bg-gray-50 border-y border-gray-100/75 py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <span className="text-xs font-black text-teal-800 uppercase tracking-widest bg-teal-50 px-3 py-1.5 rounded-full inline-block">
                🛡️ {isHi ? 'हमारी अद्वितीय विशेषताएँ' : 'Standard and Characteristics'}
              </span>
              <h2 className="text-3xl font-black text-gray-900 font-display mt-4">
                {isHi ? 'क्या चीज़ हमें सबसे अलग बनाती है?' : 'Engineered For In-Home Trust'}
              </h2>
              <p className="text-sm text-gray-500 mt-3 leading-relaxed">
                {isHi
                  ? 'हम केवल सेवा प्रदान नहीं करते, बल्कि प्रत्येक विज़िट पर सुरक्षा, सम्मान और उत्कृष्ट गुणवत्ता सुनिश्चित करते हैं।'
                  : 'A rigorous system crafted with safety gates, clear policies, and verified expert training protocols.'}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {CHARACTERISTICS.map(item => (
                <div key={item.id} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xs flex gap-4 hover:shadow-lg transition-shadow">
                  <div className="w-12 h-12 shrink-0 bg-teal-50 text-teal-800 rounded-2xl flex items-center justify-center">
                    <DynamicIcon name={item.iconName} size={22} />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-base font-display">
                      {isHi ? item.titleHi : item.titleEn}
                    </h3>
                    <p className="text-xs text-gray-500 leading-relaxed mt-2">
                      {isHi ? item.descHi : item.descEn}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* COMPANY FOUNDERS SECTION */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-black text-emerald-800 uppercase tracking-widest bg-emerald-50 px-3 py-1.5 rounded-full inline-block">
              👥 {isHi ? 'कंपनी के संस्थापक' : 'Meet Our Leadership'}
            </span>
            <h2 className="text-3xl font-black text-gray-900 mt-4 font-display">
              {isHi ? 'प्रेरक नेतृत्व और उद्यमी विचार' : 'The Visionaries Behind Rural Company'}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {isHi
                ? 'अमित कुमार चौधरी और मधुसूदन यादव के नेतृत्व में एक सशक्त भारत की नींव।'
                : 'Pioneering inclusive service standards and empowering local specialists.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {FOUNDERS.map((founder, idx) => (
              <div
                key={idx}
                className="bg-white border border-gray-100 rounded-3xl p-6 md:p-8 flex flex-col items-center text-center hover:shadow-xl transition-shadow"
              >
                {/* Visual Avatar Badge */}
                <div className="w-20 h-20 bg-linear-to-br from-teal-700 to-emerald-800 text-white rounded-full flex items-center justify-center text-3xl font-bold shadow-xl border-4 border-emerald-50 mb-6">
                  {founder.name[0]}
                </div>

                <h3 className="text-xl font-black text-gray-950 font-display">
                  {founder.name}
                </h3>
                
                <p className="text-xs font-bold text-emerald-800 uppercase tracking-widest bg-emerald-50 px-3 py-1 rounded-full mt-2">
                  {isHi ? founder.roleHi : founder.roleEn}
                </p>

                <p className="text-xs text-gray-500 leading-relaxed mt-5 italic">
                  "{isHi ? founder.bioHi : founder.bioEn}"
                </p>
                
                {/* Social Placeholder or Verification Mark */}
                <div className="flex gap-4 mt-6 items-center text-xs text-gray-400">
                  <span className="flex items-center gap-1">
                    🟢 {isHi ? 'सत्यापित डिजिटल प्रमुख' : 'Verified Entrepreneur Profile'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* SYSTEM CORES/ABOUT US (हमारी कहानी - About Us Text) */}
        <section id="about" className="bg-gradient-to-br from-teal-900 to-emerald-950 text-white py-20 bg-dot-pattern">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center md:text-left">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              
              <div className="lg:col-span-4 text-center lg:text-left">
                <span className="text-xs font-black text-emerald-300 uppercase tracking-widest bg-white/10 px-3 py-1.5 rounded-full inline-block">
                  📖 {isHi ? 'कंपनी की कहानी' : 'A Story of Renaming'}
                </span>
                <h2 className="text-3xl sm:text-4xl font-extrabold font-display leading-tight text-white mt-4">
                  {isHi ? 'Local Service से Rural Company तक' : 'The Brand Transformation Path'}
                </h2>
                <div className="w-20 h-1 bg-emerald-400 my-6 mx-auto lg:mx-0 rounded-full" />
                <p className="text-sm text-teal-200/80 leading-relaxed font-normal">
                  {isHi
                    ? 'कंपनी की स्थापना वर्ष २०२५ में हुई थी और इसका मुख्यालय Khalilabad (संत कबीर नगर, यू.पी.) में स्थित है।'
                    : 'Founded in 2025 at Khalilabad, the company quickly transitioned into a major technological force.'}
                </p>
              </div>

              <div className="lg:col-span-8 bg-white/5 border border-white/10 p-6 sm:p-8 rounded-3xl">
                <h4 className="text-xs text-emerald-300 font-extrabold uppercase tracking-widest mb-4">
                  {isHi ? 'वेबसाइट के लिए छोटा About Us' : 'Officially Published SEO Business Summary'}
                </h4>
                
                <p className="text-base sm:text-lg text-white leading-relaxed font-medium">
                  {isHi
                    ? 'Rural Company भारत की प्रमुख होम सर्विसेज़ कंपनी है जो ग्राहकों को प्रशिक्षित एवं सत्यापित सेवा विशेषज्ञों से जोड़ती है। 2026 में स्थापित यह कंपनी ब्यूटी, क्लीनिंग, रिपेयर, प्लंबिंग, इलेक्ट्रिकल और अन्य घरेलू सेवाएँ प्रदान करती है। लाखों ग्राहक और हजारों सेवा पेशेवर Rural Company के साथ जुड़े हुए हैं, जिससे यह भारत के सबसे बड़े होम सर्विस प्लेटफ़ॉर्म में से एक बन गई है।'
                    : 'Rural Company is India\'s premier home services tech-giant linking households to certified professionals. Officially launching scale peaks in 2026, we specialize in high-concept home repairs, salon visits, plumbing, deep cleaning, and appliance servicing. Empowering thousands of micro-entrepreneurs globally, we secure a safe home experience.'}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8 pt-6 border-t border-white/10 text-xs text-teal-200/90 text-left">
                  <div>
                    <strong>{isHi ? 'संस्थापक मंडल:' : 'Founders Structure:'}</strong>
                    <p className="mt-1 font-semibold text-white">Amit Kumar Chaudhary & Madhusudan Yadav</p>
                  </div>
                  <div>
                    <strong>{isHi ? 'मुख्यालय / संपर्क:' : 'Corporate Head Office:'}</strong>
                    <p className="mt-1 font-semibold text-white">Khalilabad, Sant Kabir Nagar, Uttar Pradesh, India</p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* CUSTOMER RATING & REVIEW SYSTEM widget */}
        <section id="reviews" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <ReviewSection language={language} services={SERVICES_LIST} />
        </section>

      </main>

      {/* FOOTER */}
      <footer className="bg-gray-900 text-gray-400 py-12 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 text-white">
                <div className="w-8 h-8 bg-teal-800 text-white rounded-lg flex items-center justify-center font-bold">
                  <DynamicIcon name="Home" size={16} className="text-emerald-300" />
                </div>
                <span className="text-lg font-bold font-display tracking-tight text-white">
                  Rural Company
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-4 leading-relaxed max-w-sm">
                {isHi
                  ? 'हमारा उद्देश्य घरेलू सेवाओं को अधिक भरोसेमंद, पारदर्शी और तकनीक-संचालित बनाकर ग्रामीण एवं शहरी पेशेवरों के लिए उत्कृष्ट अवसर उत्पन्न करना है।'
                  : 'Dignifying labor and engineering a direct marketplace link between verified local taskers and safety-centric households.'}
              </p>
            </div>

            <div>
              <h4 className="text-xs font-black text-gray-200 uppercase tracking-widest mb-4">
                {isHi ? 'खोजें' : 'Navigate'}
              </h4>
              <ul className="space-y-2 text-xs">
                <li><button onClick={() => scrollTo('hero')} className="hover:text-white transition-colors">{isHi ? 'शीर्ष पर जाएँ' : 'Back to Top'}</button></li>
                <li><button onClick={() => scrollTo('services')} className="hover:text-white transition-colors">{isHi ? 'होम सर्विसेज़' : 'Explore Services'}</button></li>
                <li><button onClick={() => scrollTo('stats')} className="hover:text-white transition-colors">{isHi ? 'वार्षिक वित्तीय आँकड़े' : 'Consolidated Stats'}</button></li>
                <li><button onClick={() => scrollTo('about')} className="hover:text-white transition-colors">{isHi ? 'हमारे बारे में' : 'About Story'}</button></li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-black text-gray-200 uppercase tracking-widest mb-4">
                {isHi ? 'कॉर्पोरेट संपर्क' : 'Corporate Contact'}
              </h4>
              <p className="text-xs leading-relaxed text-gray-500">
                <strong>{isHi ? 'मुख्यालय:' : 'HQ:'}</strong> Khalilabad, Sant Kabir Nagar, Uttar Pradesh, India - 272175 <br />
                <strong>Email:</strong> ceamitskn@gmail.com <br />
                <strong>{isHi ? 'कार्य समय:' : 'Support Hours:'}</strong> 09:00 AM - 09:00 PM
              </p>
            </div>

          </div>

          <div className="border-t border-gray-800 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
            <p>
              &copy; 2026 Rural Company. {isHi ? 'सर्वाधिकार सुरक्षित।' : 'All Rights Reserved.'}
            </p>
            <div className="flex gap-4 text-[11px]">
              <span className="text-emerald-500 font-semibold">{isHi ? '● प्रशिक्षित और सुरक्षित' : '● Trained & Secured'}</span>
              <span>{isHi ? 'गोपनीयता नीति' : 'Privacy Guidelines'}</span>
              <span>{isHi ? 'नियम और शर्तें' : 'Terms & Conditions'}</span>
            </div>
          </div>
        </div>
      </footer>

      {/* RENDER AUTHENTICATION PORTAL OVERLAY */}
      <AnimatePresence>
        {showAuthPortal && (
          <AuthPortal
            language={language}
            onClose={() => setShowAuthPortal(false)}
            onSuccess={handleLoginSuccess}
            initialMode={authPortalMode}
          />
        )}
      </AnimatePresence>

      {/* RENDER ACTIVE BOOKING DETAIL MODAL */}
      <AnimatePresence>
        {selectedService && (
          <BookingModal
            service={selectedService}
            language={language}
            onClose={() => setSelectedService(null)}
            onSuccess={handleBookingSuccess}
            currentUser={currentUser}
          />
        )}
      </AnimatePresence>

    </div>
  );
}
