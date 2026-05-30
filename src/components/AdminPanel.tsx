import React, { useState } from 'react';
import { 
  Plus, Edit2, Trash2, Shield, Hammer, Users, 
  Calendar, IndianRupee, Save, X, Search, CheckCircle2, UserCheck
} from 'lucide-react';
import { ServiceItem, Booking, User } from '../types';

interface AdminPanelProps {
  currentUser: User;
  services: ServiceItem[];
  setServices: React.Dispatch<React.SetStateAction<ServiceItem[]>>;
  bookings: Booking[];
  setBookings: React.Dispatch<React.SetStateAction<Booking[]>>;
  isHi: boolean;
  onLogout: () => void;
}

export default function AdminPanel({
  currentUser,
  services,
  setServices,
  bookings,
  setBookings,
  isHi,
  onLogout
}: AdminPanelProps) {
  // Tabs: 'services' | 'bookings' | 'users'
  const [activeTab, setActiveTab] = useState<'services' | 'bookings' | 'users'>('services');
  const [searchQuery, setSearchQuery] = useState('');

  // Local storage lists
  const getStoredUsers = (): User[] => {
    try {
      const u = localStorage.getItem('RC_USERS');
      return u ? JSON.parse(u) : [];
    } catch {
      return [];
    }
  };

  const saveStoredUsers = (users: User[]) => {
    localStorage.setItem('RC_USERS', JSON.stringify(users));
  };

  const [allUsers, setAllUsers] = useState<User[]>(getStoredUsers());

  // Editing state for Service
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  // Form states for adding/editing service
  const [formId, setFormId] = useState('');
  const [formNameEn, setFormNameEn] = useState('');
  const [formNameHi, setFormNameHi] = useState('');
  const [formDescEn, setFormDescEn] = useState('');
  const [formDescHi, setFormDescHi] = useState('');
  const [formCategoryEn, setFormCategoryEn] = useState('Home Repairs');
  const [formCategoryHi, setFormCategoryHi] = useState('घरेलू मरम्मत');
  const [formBasePrice, setFormBasePrice] = useState(250);
  const [formIconName, setFormIconName] = useState('Sparkles');

  // Trigger editing values
  const startEditService = (service: ServiceItem) => {
    setEditingServiceId(service.id);
    setFormId(service.id);
    setFormNameEn(service.nameEn);
    setFormNameHi(service.nameHi || '');
    setFormDescEn(service.descriptionEn);
    setFormDescHi(service.descriptionHi || '');
    setFormCategoryEn(service.categoryEn);
    setFormCategoryHi(service.categoryHi || '');
    setFormBasePrice(service.basePrice);
    setFormIconName(service.iconName);
    setShowAddForm(true);
  };

  const closeForm = () => {
    setShowAddForm(false);
    setEditingServiceId(null);
    setFormId('');
    setFormNameEn('');
    setFormNameHi('');
    setFormDescEn('');
    setFormDescHi('');
    setFormBasePrice(250);
    setFormIconName('Sparkles');
  };

  // Add or Save Service
  const handleSaveService = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formId.trim() || !formNameEn.trim() || !formDescEn.trim()) {
      alert(isHi ? 'कृपया सभी मुख्य फ़ील्ड भरें।' : 'Please fill out all required fields.');
      return;
    }

    const item: ServiceItem = {
      id: formId.trim().toLowerCase().replace(/\s+/g, '-'),
      nameEn: formNameEn,
      nameHi: formNameHi || formNameEn,
      descriptionEn: formDescEn,
      descriptionHi: formDescHi || formDescEn,
      categoryEn: formCategoryEn,
      categoryHi: formCategoryHi || formCategoryEn,
      basePrice: Number(formBasePrice),
      iconName: formIconName
    };

    let updatedServices: ServiceItem[];
    if (editingServiceId) {
      // Modify existing
      updatedServices = services.map(s => s.id === editingServiceId ? item : s);
    } else {
      // Add new
      if (services.some(s => s.id === item.id)) {
        alert(isHi ? 'यह सर्विस ID पहले से मौजूद है।' : 'A service with this ID already exists.');
        return;
      }
      updatedServices = [...services, item];
    }

    setServices(updatedServices);
    localStorage.setItem('RC_SERVICES', JSON.stringify(updatedServices));
    closeForm();
  };

  // Delete Service
  const handleDeleteService = (id: string) => {
    if (confirm(isHi ? 'क्या आप सचमुच इस सेवा को डिलीट करना चाहते हैं?' : 'Are you sure you want to delete this service?')) {
      const updated = services.filter(s => s.id !== id);
      setServices(updated);
      localStorage.setItem('RC_SERVICES', JSON.stringify(updated));
    }
  };

  // Change user role
  const handleRoleChange = (email: string, newRole: 'customer' | 'provider' | 'admin') => {
    const updated = allUsers.map(u => {
      if (u.email === email) {
        return { ...u, role: newRole };
      }
      return u;
    });
    setAllUsers(updated);
    saveStoredUsers(updated);
  };

  // Delete User Account
  const handleDeleteUser = (email: string) => {
    if (email === currentUser.email) {
      alert(isHi ? 'आप स्वयं का चालू अकाउंट डिलीट नहीं कर सकते!' : 'You cannot delete your active admin session!');
      return;
    }
    if (confirm(isHi ? 'क्या आप इस यूजर अकाउंट को स्थायी रूप से हटाना चाहते हैं?' : 'Are you sure you want to permanently remove this user?')) {
      const updated = allUsers.filter(u => u.email !== email);
      setAllUsers(updated);
      saveStoredUsers(updated);
    }
  };

  // Timeline list of all statuses
  const ALL_STATUSES = [
    { value: 'BOOKING_CONFIRMED', labelHi: '✓ बुकिंग की पुष्टि हुई', labelEn: '✓ Booking Confirmed' },
    { value: 'PARTNER_ASSIGNED', labelHi: '✓ सेवा साथी असाइन हुआ', labelEn: '✓ Partner Assigned' },
    { value: 'PARTNER_TRAVELING', labelHi: '✓ साथी आ रहा है', labelEn: '✓ Partner Traveling' },
    { value: 'PARTNER_REACHED', labelHi: '✓ साथी स्थान पर पहुंच गया', labelEn: '✓ Partner Reached Location' },
    { value: 'SERVICE_STARTED', labelHi: '✓ सेवा शुरू हुई', labelEn: '✓ Service Started' },
    { value: 'SERVICE_IN_PROGRESS', labelHi: '✓ कार्य प्रगति पर है', labelEn: '✓ Service In Progress' },
    { value: 'SERVICE_COMPLETED', labelHi: '✓ सेवा सफलतापूर्वक पूरी हुई', labelEn: '✓ Service Completed' },
    { value: 'CANCELLED', labelHi: '❌ रद्द कर दिया गया', labelEn: '❌ Cancelled' }
  ];

  // Update Booking Status directly by Admin
  const handleUpdateBookingStatus = (bookingId: string, newStatus: any) => {
    const updated = bookings.map(b => {
      if (b.id === bookingId) {
        const history = [...(b.statusHistory || [])];
        const exists = history.some(h => h.status === newStatus);

        if (!exists) {
          history.push({
            status: newStatus,
            timestamp: new Date().toISOString()
          });
        }

        return {
          ...b,
          status: newStatus,
          statusHistory: history
        };
      }
      return b;
    });

    setBookings(updated);
    localStorage.setItem('RC_BOOKINGS', JSON.stringify(updated));
  };

  // Assign provider to booking
  const handleAssignProvider = (bookingId: string, providerEmail: string) => {
    const provider = allUsers.find(u => u.email === providerEmail);
    const updated = bookings.map(b => {
      if (b.id === bookingId) {
        // Let's auto advance status to PARTNER_ASSIGNED if it is currently CONFIRMED
        const newStatus = b.status === 'CONFIRMED' ? 'PARTNER_ASSIGNED' : b.status;
        const history = [...(b.statusHistory || [])];
        if (b.status === 'CONFIRMED' && !history.some(h => h.status === 'PARTNER_ASSIGNED')) {
          history.push({
            status: 'PARTNER_ASSIGNED',
            timestamp: new Date().toISOString()
          });
        }
        return {
          ...b,
          partnerName: provider ? provider.fullName : 'Seeking Provider...',
          partnerPhone: provider ? provider.mobile : '',
          partnerRating: provider ? 4.9 : 5.0,
          status: newStatus as any,
          statusHistory: history
        };
      }
      return b;
    });
    setBookings(updated);
    localStorage.setItem('RC_BOOKINGS', JSON.stringify(updated));
  };

  // Filter lists
  const filteredServices = services.filter(s => 
    s.nameEn.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (s.nameHi && s.nameHi.includes(searchQuery)) ||
    s.categoryEn.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredBookings = bookings.filter(b => 
    b.serviceId.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.customerPhone.includes(searchQuery) ||
    (b.id && b.id.includes(searchQuery))
  );

  const filteredUsers = allUsers.filter(u => 
    u.fullName.toLowerCase().includes(searchQuery.toLowerCase()) || 
    u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.mobile.includes(searchQuery)
  );

  const providersList = allUsers.filter(u => u.role === 'provider');

  return (
    <div className="bg-gray-50 min-h-screen py-6 px-4 md:px-8 max-w-7xl mx-auto text-gray-800">
      
      {/* Admin header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 pb-5 mb-6">
        <div>
          <div className="flex items-center gap-2 text-teal-850">
            <Shield size={20} className="text-teal-700" />
            <span className="text-xs font-black uppercase tracking-widest text-teal-800 bg-teal-50 px-2.5 py-1 rounded-md">
              {isHi ? 'एडमिनिस्ट्रेटर डैशबोर्ड' : 'Administrator Control Panel'}
            </span>
          </div>
          <h2 className="text-xl md:text-2xl font-black text-gray-900 tracking-tight mt-1">
            {isHi ? `नमस्ते, ${currentUser.fullName}` : `Welcome, Admin ${currentUser.fullName}`}
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            {isHi 
              ? 'यहाँ से आप सेवाएं जोड़ सकते हैं, बुकिंग्स पर नज़र रख सकते हैं और यूजर रोल्स बदल सकते हैं।' 
              : 'Direct control over active services catalog, live booking states, and registered users profiles.'}
          </p>
        </div>

        <button
          onClick={onLogout}
          className="px-4 py-2 border border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800 text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer self-start md:self-center"
        >
          {isHi ? 'लॉगआउट करें' : 'Logout Console'}
        </button>
      </div>

      {/* Segmented control tabs */}
      <div className="grid grid-cols-3 gap-2 p-1.5 bg-gray-200/60 rounded-2xl mb-6 max-w-lg">
        <button
          onClick={() => { setActiveTab('services'); setSearchQuery(''); }}
          className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-extrabold cursor-pointer transition-all ${
            activeTab === 'services'
              ? 'bg-teal-850 text-white shadow-xs'
              : 'text-gray-600 hover:bg-gray-150'
          }`}
        >
          <Hammer size={14} />
          <span>{isHi ? 'सेवा सूची' : 'Manage Services'}</span>
        </button>
        <button
          onClick={() => { setActiveTab('bookings'); setSearchQuery(''); }}
          className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-extrabold cursor-pointer transition-all ${
            activeTab === 'bookings'
              ? 'bg-teal-850 text-white shadow-xs'
              : 'text-gray-600 hover:bg-gray-150'
          }`}
        >
          <Calendar size={14} />
          <span>{isHi ? 'बुकिंग्स बोर्ड' : 'Bookings Board'}</span>
        </button>
        <button
          onClick={() => { setActiveTab('users'); setSearchQuery(''); }}
          className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-extrabold cursor-pointer transition-all ${
            activeTab === 'users'
              ? 'bg-teal-850 text-white shadow-xs'
              : 'text-gray-600 hover:bg-gray-150'
          }`}
        >
          <Users size={14} />
          <span>{isHi ? 'यूजर डायरेक्टरी' : 'User Profiles'}</span>
        </button>
      </div>

      {/* Live search box */}
      <div className="relative mb-6">
        <span className="absolute left-4 top-3 text-gray-400">
          <Search size={16} />
        </span>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={
            activeTab === 'services' 
              ? (isHi ? 'सेवा का नाम या श्रेणी खोजें...' : 'Search services list or category...')
              : activeTab === 'bookings'
              ? (isHi ? 'यूजर ईमेल या सेवा द्वारा बुकिंग खोजें...' : 'Search bookings by client email, ID...')
              : (isHi ? 'नाम, ईमेल या फोन नंबर खोजें...' : 'Search profiles by name, email, phone...')
          }
          className="w-full bg-white border border-gray-200 rounded-2xl pl-11 pr-4 py-2.5 text-xs font-medium focus:outline-hidden focus:border-teal-700 focus:ring-1 focus:ring-teal-700/50 shadow-xs"
        />
      </div>

      {/* ──────────────────────────────────────────────────────── */}
      {/* 1. SERVICES TAB */}
      {/* ──────────────────────────────────────────────────────── */}
      {activeTab === 'services' && (
        <div className="space-y-6">
          
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black text-gray-450 uppercase tracking-wider">
              {isHi ? 'उपलब्ध सेवाओं की सूची' : 'Service Inventory'} ({filteredServices.length})
            </h3>
            {!showAddForm && (
              <button
                onClick={() => { closeForm(); setShowAddForm(true); }}
                className="flex items-center gap-1 bg-teal-850 hover:bg-teal-900 text-white px-3 py-1.5 rounded-xl text-xs font-black cursor-pointer shadow-xs transition-all"
              >
                <Plus size={14} />
                <span>{isHi ? 'नई सेवा जोड़ें' : 'Create New Service'}</span>
              </button>
            )}
          </div>

          {/* ADD / EDIT FORM OVERLAY-PANEL */}
          {showAddForm && (
            <form onSubmit={handleSaveService} className="bg-white border border-teal-100 rounded-3xl p-6 shadow-md shadow-teal-900/5 space-y-4 animate-fade-in">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <h4 className="text-xs font-black text-teal-850 uppercase tracking-widest flex items-center gap-1">
                  <span>🛠️</span>
                  <span>{editingServiceId ? (isHi ? 'सेवा विवरण संपादित करें' : 'Edit Service Details') : (isHi ? 'नया सेवा विवरण दर्ज करें' : 'Create New Service Profile')}</span>
                </h4>
                <button
                  type="button"
                  onClick={closeForm}
                  className="p-1 text-gray-400 hover:text-gray-700"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                {/* Unique ID */}
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                    {isHi ? 'अद्वितीय सेवा ID (अनिवार्य)' : 'Unique ID key (Required)'}
                  </label>
                  <input
                    type="text"
                    required
                    disabled={!!editingServiceId}
                    placeholder="e.g. kitchen-cleaning"
                    value={formId}
                    onChange={(e) => setFormId(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold focus:border-teal-700 disabled:opacity-50"
                  />
                </div>

                {/* Base price */}
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                    {isHi ? 'आधार शुल्क (रु.)' : 'Base Pricing (₹)'}
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={formBasePrice}
                    onChange={(e) => setFormBasePrice(Number(e.target.value))}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold focus:border-teal-700"
                  />
                </div>

                {/* Icon name */}
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                    {isHi ? 'आइकॉन का नाम (जैसे: Sparkles, Wind, Droplets)' : 'Icon name (e.g., Sparkles, Wind, Droplets)'}
                  </label>
                  <select
                    value={formIconName}
                    onChange={(e) => setFormIconName(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold focus:border-teal-700"
                  >
                    <option value="Sparkles">Sparkles ✨</option>
                    <option value="Wind">Wind 🌬️</option>
                    <option value="Droplets">Droplets 💧</option>
                    <option value="Zap">Zap ⚡</option>
                    <option value="Plus">Plus ➕</option>
                    <option value="Hammer">Hammer 🛠️</option>
                    <option value="Bookmark">Bookmark 🔖</option>
                  </select>
                </div>

                {/* Category EN */}
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                    {isHi ? 'श्रेणी (इंग्लिश)' : 'Category English'}
                  </label>
                  <select
                    value={formCategoryEn}
                    onChange={(e) => {
                      setFormCategoryEn(e.target.value);
                      if (e.target.value === 'Personal Services') setFormCategoryHi('व्यक्तिगत सेवाएँ');
                      else if (e.target.value === 'Appliance Repair') setFormCategoryHi('उपकरण रिपेयर');
                      else if (e.target.value === 'Home Repairs') setFormCategoryHi('घरेलू मरम्मत');
                      else setFormCategoryHi('अन्य सेवाएँ');
                    }}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold focus:border-teal-700"
                  >
                    <option value="Personal Services">Personal Services</option>
                    <option value="Appliance Repair">Appliance Repair</option>
                    <option value="Home Repairs">Home Repairs</option>
                    <option value="Others">Others</option>
                  </select>
                </div>

                {/* Category HI */}
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                    {isHi ? 'श्रेणी (हिंदी)' : 'Category Hindi'}
                  </label>
                  <input
                    type="text"
                    required
                    value={formCategoryHi}
                    onChange={(e) => setFormCategoryHi(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold focus:border-teal-700"
                  />
                </div>

              </div>

              {/* Names row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                    {isHi ? 'सेवा का नाम (इंग्लिश में)' : 'Service Name (English)'}
                  </label>
                  <input
                    type="text"
                    required
                    value={formNameEn}
                    onChange={(e) => setFormNameEn(e.target.value)}
                    placeholder="e.g. Sofa Cleaning Deep Clean"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold focus:border-teal-700"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                    {isHi ? 'सेवा का नाम (हिंदी में)' : 'Service Name (Hindi)'}
                  </label>
                  <input
                    type="text"
                    value={formNameHi}
                    onChange={(e) => setFormNameHi(e.target.value)}
                    placeholder="जैसे: सोफा डीप क्लीनिंग सर्विस"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold focus:border-teal-700"
                  />
                </div>
              </div>

              {/* Descriptions row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                    {isHi ? 'विवरण (इंग्लिश)' : 'Description (English)'}
                  </label>
                  <textarea
                    rows={2}
                    required
                    value={formDescEn}
                    onChange={(e) => setFormDescEn(e.target.value)}
                    placeholder="Enter short helpful notes about inclusions..."
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold focus:border-teal-700"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                    {isHi ? 'विवरण (हिंदी)' : 'Description (Hindi)'}
                  </label>
                  <textarea
                    rows={2}
                    value={formDescHi}
                    onChange={(e) => setFormDescHi(e.target.value)}
                    placeholder="विस्तृत विवरण और सेवा में क्या शामिल है..."
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold focus:border-teal-700"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeForm}
                  className="px-4 py-2 border border-gray-200 hover:bg-gray-100 rounded-xl text-xs font-bold cursor-pointer"
                >
                  {isHi ? 'रद्द करें' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 bg-teal-850 hover:bg-teal-900 text-white px-5 py-2 rounded-xl text-xs font-black cursor-pointer shadow-xs"
                >
                  <Save size={14} />
                  <span>{isHi ? 'सुरक्षित करें' : 'Save Changes'}</span>
                </button>
              </div>
            </form>
          )}

          {/* Services list board */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredServices.map(service => (
              <div 
                key={service.id} 
                className="bg-white border border-gray-200 rounded-2xl p-4 flex flex-col justify-between hover:shadow-md transition-shadow relative"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-black tracking-widest text-teal-800 bg-teal-50 px-2 py-0.5 rounded-md uppercase">
                      {isHi ? service.categoryHi : service.categoryEn}
                    </span>
                    <span className="text-xs font-bold text-gray-400">ID: {service.id}</span>
                  </div>

                  <h4 className="text-sm font-black text-gray-900">
                    {isHi ? service.nameHi : service.nameEn}
                  </h4>
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                    {isHi ? service.descriptionHi : service.descriptionEn}
                  </p>
                </div>

                <div className="border-t border-gray-100 pt-3 mt-4 flex items-center justify-between">
                  <div className="flex items-center text-teal-850 font-black text-sm">
                    <IndianRupee size={12} />
                    <span>{service.basePrice}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => startEditService(service)}
                      className="p-1.5 text-gray-400 hover:text-teal-800 hover:bg-teal-50 rounded-lg cursor-pointer"
                      title={isHi ? 'संपादित करें' : 'Edit item'}
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={() => handleDeleteService(service.id)}
                      className="p-1.5 text-gray-400 hover:text-red-700 hover:bg-red-50 rounded-lg cursor-pointer"
                      title={isHi ? 'डिलीट करें' : 'Delete item'}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredServices.length === 0 && (
            <div className="text-center py-12 bg-white border border-dashed border-gray-200 rounded-3xl">
              <p className="text-xs font-medium text-gray-500">
                {isHi ? 'कोई सेवा नहीं मिली। नया सेवा जोड़ने के लिए ऊपर बटन दबाएं।' : 'No services found. Click "Create New Service" above to add.'}
              </p>
            </div>
          )}

        </div>
      )}

      {/* ──────────────────────────────────────────────────────── */}
      {/* 2. BOOKINGS TAB */}
      {/* ──────────────────────────────────────────────────────── */}
      {activeTab === 'bookings' && (
        <div className="space-y-6">
          <h3 className="text-sm font-black text-gray-450 uppercase tracking-wider">
            {isHi ? 'ग्राहकों की बुकिंग्स नियंत्रण बोर्ड' : 'Customer Bookings Control Board'} ({filteredBookings.length})
          </h3>

          <div className="space-y-4">
            {filteredBookings.map(b => {
              const pairedService = services.find(s => s.id === b.serviceId);
              return (
                <div 
                  key={b.id} 
                  className="bg-white border border-gray-200 rounded-3xl p-5 hover:shadow-xs transition-shadow space-y-4"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-gray-100 pb-3">
                    <div>
                      <div className="text-xs font-black text-gray-900 flex items-center gap-2">
                        <span>🏷️ #{b.id?.toUpperCase().substring(0, 8)}</span>
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                          b.status === 'COMPLETED' 
                            ? 'bg-emerald-50 text-emerald-800' 
                            : b.status === 'CANCELLED' 
                            ? 'bg-red-100 text-red-800' 
                            : 'bg-amber-50 text-amber-900 border border-amber-200'
                        }`}>
                          {b.status}
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-500 mt-1">
                        {isHi ? 'दिनांक:' : 'Booking Date:'} <strong className="text-gray-700">{b.slotDate}</strong> | 
                        {isHi ? ' समय:' : ' Slot:'} <strong className="text-gray-700">{b.slotTime}</strong>
                      </p>
                    </div>

                    <div className="text-teal-850 font-black text-sm flex items-center">
                      <IndianRupee size={12} />
                      <span>{b.price}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Customer overview */}
                    <div className="space-y-1">
                      <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                        {isHi ? 'ग्राहक' : 'Customer Profile'}
                      </h4>
                      <p className="text-xs font-black text-gray-800">{b.customerName}</p>
                      <p className="text-[11px] text-gray-500">📞 {b.customerPhone}</p>
                      <p className="text-[11px] text-gray-500 italic mt-1 bg-gray-50 p-2 rounded-xl border border-gray-150/70 inline-block">
                        📍 {b.customerAddress}
                      </p>
                    </div>

                    {/* Service overview */}
                    <div className="space-y-1">
                      <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                        {isHi ? 'सेवा विवरण' : 'Service Requested'}
                      </h4>
                      <p className="text-xs font-black text-gray-800">
                        {isHi ? pairedService?.nameHi : pairedService?.nameEn}
                      </p>
                      <p className="text-[10px] text-gray-400">ID: {b.serviceId}</p>
                    </div>

                    {/* Assigned Service partner */}
                    <div className="space-y-2 bg-neutral-50/70 p-3 rounded-2xl border border-neutral-100">
                      <h4 className="text-[10px] font-black text-neutral-400 uppercase tracking-wider flex items-center gap-1">
                        <UserCheck size={10} className="text-teal-800" />
                        <span>{isHi ? 'असाइंड सेवा पार्टनर' : 'Assigned Provider'}</span>
                      </h4>

                      {b.partnerPhone ? (
                        <div className="text-xs">
                          <p className="font-black text-gray-800">{b.partnerName}</p>
                          <p className="text-[11px] text-gray-500">📞 {b.partnerPhone}</p>
                        </div>
                      ) : (
                        <p className="text-[11px] text-red-600 font-bold">
                          ⚠️ {isHi ? 'कोई सेवा पार्टनर असाइन नहीं है।' : 'No provider partner assigned yet.'}
                        </p>
                      )}

                      {/* Manual Assignment Option */}
                      <div className="mt-2 text-xs">
                        <label className="block text-[9px] font-bold text-neutral-500 mb-1">
                          {isHi ? 'पार्टनर लिस्ट से असाइन करें:' : 'Choose live partner:'}
                        </label>
                        <select
                          onChange={(e) => handleAssignProvider(b.id || '', e.target.value)}
                          defaultValue={providersList.find(pr => pr.fullName === b.partnerName || pr.mobile === b.partnerPhone)?.email || ''}
                          className="w-full bg-white border border-gray-200 rounded-lg px-2 py-1 text-[11px] font-semibold text-gray-800"
                        >
                          <option value="">-- {isHi ? 'पार्टनर चुनें' : 'Choose partner'} --</option>
                          {providersList.map(pr => (
                            <option key={pr.email} value={pr.email}>
                              🛠️ {pr.fullName} ({pr.mobile})
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Force status updater panel */}
                  <div className="bg-gray-50 p-3 rounded-2xl border border-gray-200 flex flex-wrap items-center gap-2">
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                      {isHi ? 'स्टेटस यहाँ से अपडेट करें (Force Status):' : 'Update Step-by-Step State:'}
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {ALL_STATUSES.map(st => (
                        <button
                          key={st.value}
                          type="button"
                          onClick={() => handleUpdateBookingStatus(b.id || '', st.value)}
                          className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-colors cursor-pointer border ${
                            b.status === st.value
                              ? 'bg-teal-850 text-white border-teal-850 shadow-xs'
                              : 'bg-white text-gray-600 hover:bg-neutral-100 border-gray-200'
                          }`}
                        >
                          {isHi ? st.labelHi : st.labelEn}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}

            {filteredBookings.length === 0 && (
              <div className="text-center py-16 bg-white border border-dashed border-gray-200 rounded-3xl">
                <p className="text-xs font-semibold text-gray-500">
                  {isHi ? 'डेटाबेस में कोई बुकिंग नहीं मिली।' : 'No customer bookings currently registered.'}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────── */}
      {/* 3. USERS TAB */}
      {/* ──────────────────────────────────────────────────────── */}
      {activeTab === 'users' && (
        <div className="space-y-6">
          <h3 className="text-sm font-black text-gray-450 uppercase tracking-wider">
            {isHi ? 'रजिस्टर्ड यूजर अकाउंट सूची' : 'Registered Users Account Profiles'} ({filteredUsers.length})
          </h3>

          <div className="bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-150 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    <th className="py-3.5 px-4">{isHi ? 'उपयोगकर्ता का विवरण' : 'User Detail'}</th>
                    <th className="py-3.5 px-4">{isHi ? 'मोबाइल संख्या' : 'Mobile'}</th>
                    <th className="py-3.5 px-4">{isHi ? 'पंजीकृत तिथि' : 'Registered At'}</th>
                    <th className="py-3.5 px-4">{isHi ? 'रोल (Role) अधिकार' : 'Platform Role'}</th>
                    <th className="py-3.5 px-4 text-center">{isHi ? 'कार्य' : 'Actions'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-xs text-gray-700">
                  {filteredUsers.map(user => (
                    <tr key={user.email} className="hover:bg-neutral-50/50 transition-colors">
                      
                      {/* Name / Email */}
                      <td className="py-4 px-4">
                        <div className="font-bold text-gray-900">{user.fullName}</div>
                        <div className="text-[11px] text-gray-500">{user.email}</div>
                      </td>

                      {/* Mobile */}
                      <td className="py-4 px-4 font-mono font-bold text-gray-650">
                        {user.mobile}
                      </td>

                      {/* Registered Date */}
                      <td className="py-4 px-4 text-[11px] text-gray-500">
                        {user.registeredAt ? new Date(user.registeredAt).toLocaleDateString() : 'Original Seeding'}
                      </td>

                      {/* Role selection dropdown */}
                      <td className="py-4 px-4">
                        <select
                          value={user.role || 'customer'}
                          disabled={user.email === currentUser.email}
                          onChange={(e) => handleRoleChange(user.email, e.target.value as any)}
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-black border transition-colors ${
                            user.role === 'admin'
                              ? 'bg-purple-100 text-purple-800 border-purple-200'
                              : user.role === 'provider'
                              ? 'bg-blue-100 text-blue-800 border-blue-200'
                              : 'bg-teal-50 text-teal-800 border-teal-200'
                          }`}
                        >
                          <option value="customer">👤 {isHi ? 'ग्राहक (Customer)' : 'Customer'}</option>
                          <option value="provider">🛠️ {isHi ? 'पार्टनर (Provider)' : 'Provider'}</option>
                          <option value="admin">👑 {isHi ? 'एडमिन (Admin)' : 'Admin'}</option>
                        </select>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4 text-center">
                        <button
                          onClick={() => handleDeleteUser(user.email)}
                          disabled={user.email === currentUser.email}
                          className="p-1 px-2.5 text-xs text-red-600 hover:bg-red-50 rounded-lg font-bold disabled:opacity-30 cursor-pointer"
                        >
                          {isHi ? 'हटाएँ' : 'Remove'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredUsers.length === 0 && (
              <div className="text-center py-12 text-gray-400 font-medium text-xs">
                {isHi ? 'कोई मेल खाता यूजर खाता नहीं मिल सका।' : 'No users match your criteria.'}
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
