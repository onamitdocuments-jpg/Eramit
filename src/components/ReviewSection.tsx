/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { UserReview, Language, ServiceItem } from '../types';
import { BASE_REVIEWS } from '../data/servicesData';
import { DynamicIcon } from './Icons';

interface ReviewSectionProps {
  language: Language;
  services: ServiceItem[];
}

export default function ReviewSection({ language, services }: ReviewSectionProps) {
  const isHi = language === 'hi';
  const [reviews, setReviews] = useState<UserReview[]>(BASE_REVIEWS);
  const [selectedServiceId, setSelectedServiceId] = useState<string>('all');
  
  // New review form states
  const [showForm, setShowForm] = useState<boolean>(false);
  const [newRating, setNewRating] = useState<number>(5);
  const [newName, setNewName] = useState<string>('');
  const [newLocation, setNewLocation] = useState<string>('');
  const [newComment, setNewComment] = useState<string>('');
  const [newService, setNewService] = useState<string>(services[0]?.id || 'ac-repair');

  const filteredReviews = selectedServiceId === 'all'
    ? reviews
    : reviews.filter(r => r.serviceId === selectedServiceId);

  const calculateAverageRating = () => {
    if (reviews.length === 0) return 0;
    const total = reviews.reduce((sum, r) => sum + r.rating, 0);
    return (total / reviews.length).toFixed(1);
  };

  const handleCreateReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newComment.trim() || !newLocation.trim()) return;

    const newReview: UserReview = {
      id: 'rev-' + (reviews.length + 1),
      userNameHi: newName,
      userNameEn: newName,
      rating: newRating,
      commentHi: newComment,
      commentEn: newComment,
      serviceId: newService,
      date: new Date().toISOString().split('T')[0],
      locationHi: newLocation,
      locationEn: newLocation
    };

    setReviews([newReview, ...reviews]);
    
    // Reset state
    setNewName('');
    setNewComment('');
    setNewLocation('');
    setShowForm(false);
  };

  const getServiceName = (id: string) => {
    const s = services.find(item => item.id === id);
    if (!s) return '';
    return isHi ? s.nameHi : s.nameEn;
  };

  return (
    <div className="bg-white rounded-3xl p-6 md:p-8 border border-gray-100 shadow-xs">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-gray-100 pb-6 mb-8">
        <div>
          <span className="text-xs font-black text-emerald-800 uppercase tracking-widest bg-emerald-50 px-3 py-1.5 rounded-full inline-block">
            {isHi ? 'ग्राहक समीक्षा और रेटिंग' : 'Real Client Reviews'}
          </span>
          <h3 className="text-2xl md:text-3xl font-black text-gray-900 mt-2 font-display">
            {isHi ? 'हमारे काम की गुणवत्ता आपके शब्दों में' : 'Service Verification & Happiness Index'}
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            {isHi 
              ? '६८ लाख+ ग्राहकों और ४७,८८८+ पेशेवरों के बीच भरोसे की सच्ची दीवार।'
              : 'The foundation of trust built connecting 6.8 million customers to certified professionals.'}
          </p>
        </div>

        <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-2xl border border-gray-100 self-start md:self-auto">
          <div className="text-center">
            <span className="text-3xl font-black text-teal-800 font-display">
              {calculateAverageRating()}
            </span>
            <div className="flex text-amber-400 justify-center mt-1">
              {[1, 2, 3, 4, 5].map(star => (
                <DynamicIcon key={star} name="Star" size={14} className="fill-amber-400 text-amber-400" />
              ))}
            </div>
          </div>
          <div className="border-l border-gray-200 pl-4">
            <p className="text-xl font-bold text-gray-950 font-display">
              {reviews.length}
            </p>
            <p className="text-xs text-gray-400 uppercase font-semibold">
              {isHi ? 'कुल समीक्षाएं' : 'Verified Reviews'}
            </p>
          </div>
        </div>
      </div>

      {/* Filter and Write Action bars */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-8">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedServiceId('all')}
            className={`px-4 py-2 rounded-2xl text-xs font-semibold cursor-pointer transition-all ${
              selectedServiceId === 'all'
                ? 'bg-teal-800 text-white shadow-xs'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {isHi ? 'सभी सेवाएँ' : 'All Services'}
          </button>
          
          {services.map(s => (
            <button
              key={s.id}
              onClick={() => setSelectedServiceId(s.id)}
              className={`px-4 py-2 rounded-2xl text-xs font-semibold cursor-pointer transition-all ${
                selectedServiceId === s.id
                  ? 'bg-teal-800 text-white shadow-xs'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {isHi ? s.nameHi : s.nameEn}
            </button>
          ))}
        </div>

        <button
          onClick={() => setShowForm(!showForm)}
          className="px-5 py-2.5 bg-emerald-50 text-emerald-800 font-bold text-xs rounded-xl hover:bg-emerald-100 transition-colors cursor-pointer flex items-center gap-2"
        >
          <DynamicIcon name="Plus" size={14} />
          <span>{isHi ? 'अपनी रेटिंग लिखें' : 'Write a Review'}</span>
        </button>
      </div>

      {/* Review creation form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden mb-8"
          >
            <form onSubmit={handleCreateReview} className="bg-gray-50/50 p-5 rounded-3xl border border-gray-250 flex flex-col gap-4">
              <h4 className="font-bold text-gray-900 text-sm">
                {isHi ? 'आपकी निष्पक्ष समीक्षा हमारा मार्गदर्शन करेगी' : 'Your honest feedback is highly appreciated'}
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">
                    {isHi ? 'आपका शुभ नाम' : 'Your Name'}
                  </label>
                  <input
                    type="text"
                    required
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder={isHi ? 'जैसे: महेश कुमार' : 'e.g. Liam Smith'}
                    className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-xs focus:outline-hidden focus:border-teal-700 font-medium"
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">
                    {isHi ? 'स्थान (शहर/मोहल्ला)' : 'Location (City/Area)'}
                  </label>
                  <input
                    type="text"
                    required
                    value={newLocation}
                    onChange={(e) => setNewLocation(e.target.value)}
                    placeholder={isHi ? 'जैसे: खलीलाबाद' : 'e.g. Khalilabad'}
                    className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-xs focus:outline-hidden focus:border-teal-700 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">
                    {isHi ? 'उपयोग की गई सेवा' : 'Service Utilized'}
                  </label>
                  <select
                    value={newService}
                    onChange={(e) => setNewService(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-xs focus:outline-hidden focus:border-teal-700 font-medium"
                  >
                    {services.map(s => (
                      <option key={s.id} value={s.id}>
                        {isHi ? s.nameHi : s.nameEn}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <span className="block text-xs font-semibold text-gray-500 mb-1">
                  {isHi ? 'रेटिंग (तारे चुनें)' : 'Rating Service Stars'}
                </span>
                <div className="flex gap-2.5">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setNewRating(star)}
                      className="text-amber-400 hover:scale-110 transition-transform"
                    >
                      <DynamicIcon
                        name="Star"
                        size={24}
                        className={star <= newRating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">
                  {isHi ? 'आपका वास्तविक अनुभव' : 'Your Experience Review Comments'}
                </label>
                <textarea
                  required
                  rows={2}
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder={isHi ? 'सेवा की गुणवत्ता और मूल्य निर्धारण के प्रति अपना अनुभव साझा करें...' : 'Write your comment about price transparency, professionalism, etc.'}
                  className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-xs focus:outline-hidden focus:border-teal-700 font-medium resize-none"
                />
              </div>

              <div className="flex gap-3 justify-end items-center border-t border-gray-150 pt-4">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 text-xs font-bold text-gray-500 hover:text-gray-700 transition-colors"
                >
                  {isHi ? 'रद्द करें' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal-800 hover:bg-teal-900 text-white font-bold text-xs rounded-xl transition-all"
                >
                  {isHi ? 'समीक्षा सबमिट करें' : 'Publish Review'}
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Review Lists Layout Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <AnimatePresence mode="popLayout animate">
          {filteredReviews.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="col-span-full py-12 text-center text-gray-400 text-sm"
            >
              {isHi ? 'इस सेवा विशेष के लिए अभी कोई समीक्षा उपलब्ध नहीं है।' : 'No verified reviews for this service yet.'}
            </motion.div>
          ) : (
            filteredReviews.map(r => (
              <motion.div
                key={r.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className="p-5 rounded-2xl bg-gray-50/50 border border-gray-100 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3 text-xs">
                    <div className="flex gap-1 text-amber-400">
                      {Array.from({ length: r.rating }).map((_, i) => (
                        <DynamicIcon key={i} name="Star" size={12} className="fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <span className="text-gray-400 font-mono text-[10px]">
                      {r.date}
                    </span>
                  </div>

                  <p className="text-sm font-semibold text-gray-900 mb-1">
                    {getServiceName(r.serviceId)}
                  </p>
                  
                  <blockquote className="text-xs text-gray-600 leading-relaxed font-normal italic">
                    "{isHi ? r.commentHi : r.commentEn}"
                  </blockquote>
                </div>

                <div className="flex items-center justify-between mt-4 border-t border-gray-100/60 pt-3">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-teal-100 text-teal-800 font-bold text-[10px] flex items-center justify-center">
                      {(isHi ? r.userNameHi : r.userNameEn)[0]}
                    </div>
                    <span className="text-xs font-bold text-gray-900">
                      {isHi ? r.userNameHi : r.userNameEn}
                    </span>
                  </div>
                  
                  <span className="text-[10px] text-gray-400 font-medium flex items-center gap-1">
                    <DynamicIcon name="MapPin" size={10} className="text-emerald-700" />
                    {isHi ? r.locationHi : r.locationEn}
                  </span>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
