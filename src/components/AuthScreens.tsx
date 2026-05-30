/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Language, User } from '../types';
import { DynamicIcon } from './Icons';
import { hashPassword } from '../utils/crypto';

interface AuthScreensProps {
  language: Language;
  onClose: () => void;
  onSuccess: (user: User) => void;
  initialMode?: 'login' | 'signup';
}

export default function AuthPortal({ language, onClose, onSuccess, initialMode = 'login' }: AuthScreensProps) {
  const isHi = language === 'hi';
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot'>(initialMode);
  
  // Login form states
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Signup form states
  const [signUpName, setSignUpName] = useState('');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpMobile, setSignUpMobile] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [signUpConfirmPassword, setSignUpConfirmPassword] = useState('');
  const [showSignUpPassword, setShowSignUpPassword] = useState(false);
  const [signupErrors, setSignupErrors] = useState<Record<string, string>>({});
  const [signupSuccess, setSignupSuccess] = useState(false);

  // Forgot Password states
  const [forgotIdentifier, setForgotIdentifier] = useState('');
  const [forgotError, setForgotError] = useState('');
  const [foundUser, setFoundUser] = useState<User | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [forgotStep, setForgotStep] = useState<1 | 2>(1); // 1: Lookup, 2: Reset
  const [resetSuccess, setResetSuccess] = useState(false);

  // Clear errors when toggling modes
  useEffect(() => {
    setLoginError('');
    setSignupErrors({});
    setForgotError('');
    setFoundUser(null);
    setForgotStep(1);
    setResetSuccess(false);
  }, [mode]);

  // Read registered users from local storage
  const getStoredUsers = (): User[] => {
    try {
      const u = localStorage.getItem('RC_USERS');
      let parsed = u ? JSON.parse(u) : [];
      // Seeding default demo accounts if not already seeded
      const hasAdmin = parsed.some((x: User) => x.email === 'admin@ruralcompany.com');
      if (!hasAdmin) {
        parsed = [
          ...parsed,
          {
            fullName: 'Amit Chaudhary',
            email: 'admin@ruralcompany.com',
            mobile: '9999999999',
            passwordHash: 'e6c21e646b9a8953106bd6944e8c148e67ff8df82efc6ff6230fbb8271a9cd28', // admin123
            registeredAt: new Date().toISOString(),
            role: 'admin'
          },
          {
            fullName: 'Ramesh Kumar',
            email: 'provider@ruralcompany.com',
            mobile: '8888888888',
            passwordHash: 'e6a2bc6df3b36113b28b2ae3ff265eb6348f98fbde8a39151bf9341459a9ece8', // provider123
            registeredAt: new Date().toISOString(),
            role: 'provider'
          },
          {
            fullName: 'Ajeet Yadav',
            email: 'customer@ruralcompany.com',
            mobile: '9876543210',
            passwordHash: '07149cdef70490b6db54070a3c7c4f4007ef118e97f0a9cd7097f4fae7587efc', // customer123
            registeredAt: new Date().toISOString(),
            role: 'customer'
          }
        ];
        localStorage.setItem('RC_USERS', JSON.stringify(parsed));
      }
      return parsed;
    } catch {
      return [];
    }
  };

  // Write registered users to local storage
  const saveStoredUsers = (users: User[]) => {
    try {
      localStorage.setItem('RC_USERS', JSON.stringify(users));
    } catch (e) {
      console.error("Storage error:", e);
    }
  };

  // Quick action to login demo accounts instantly
  const loginGenericRole = (role: 'customer' | 'admin' | 'provider') => {
    const defaultEmail = role === 'admin' ? 'admin@ruralcompany.com' : role === 'provider' ? 'provider@ruralcompany.com' : 'customer@ruralcompany.com';
    const users = getStoredUsers();
    const match = users.find(u => u.email === defaultEmail);
    if (match) {
      onSuccess(match);
    }
  };

  // Perform validation on login
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    const identifier = loginIdentifier.trim();
    const password = loginPassword;

    if (!identifier) {
      setLoginError(isHi ? 'कृपया ईमेल या मोबाइल नंबर दर्ज करें' : 'Please enter Email or Mobile Number');
      return;
    }
    if (!password) {
      setLoginError(isHi ? 'कृपया अपना पासवर्ड दर्ज करें' : 'Please enter your password');
      return;
    }

    const hashedInput = await hashPassword(password);
    const users = getStoredUsers();
    
    // Find matching user by email or mobile
    const matchedUser = users.find(
      u => u.email.toLowerCase() === identifier.toLowerCase() || u.mobile === identifier
    );

    if (!matchedUser) {
      setLoginError(
        isHi 
          ? 'कोई खाता नहीं मिला। क्या आप पहले रजिस्टर करना चाहते हैं?' 
          : 'No account matching this Email/Mobile. Sign Up first?'
      );
      return;
    }

    if (matchedUser.passwordHash !== hashedInput) {
      setLoginError(isHi ? 'गलत पासवर्ड। कृपया पुनः प्रयास करें।' : 'Incorrect password. Please try again.');
      return;
    }

    // Success
    onSuccess(matchedUser);
  };

  // Signup form roles state
  const [signUpRole, setSignUpRole] = useState<'customer' | 'provider' | 'admin'>('customer');

  // Perform validation on signup
  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};

    const name = signUpName.trim();
    const email = signUpEmail.trim();
    const mobile = signUpMobile.trim();
    const password = signUpPassword;
    const confirm = signUpConfirmPassword;

    // Full name check
    if (!name) {
      errors.name = isHi ? 'पूरा नाम दर्ज करना अनिवार्य है' : 'Full Name is required';
    } else if (name.length < 3) {
      errors.name = isHi ? 'नाम कम से कम ३ वर्णों का होना चाहिए' : 'Full Name must be at least 3 characters';
    }

    // Email check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      errors.email = isHi ? 'ईमेल पता दर्ज करना अनिवार्य है' : 'Email Address is required';
    } else if (!emailRegex.test(email)) {
      errors.email = isHi ? 'कृपया एक वैध ईमेल पता दर्ज करें' : 'Please enter a valid email address';
    }

    // Mobile check
    const mobileRegex = /^[0-9]{10}$/;
    if (!mobile) {
      errors.mobile = isHi ? 'मोबाइल नंबर अनिवार्य है' : 'Mobile Number is required';
    } else if (!mobileRegex.test(mobile)) {
      errors.mobile = isHi ? 'कृपया सटीक १०-अंकों का मोबाइल नंबर दर्ज करें' : 'Please enter exactly 10 digits';
    }

    // Password strength check
    if (!password) {
      errors.password = isHi ? 'पासवर्ड दर्ज करना अनिवार्य है' : 'Password is required';
    } else if (password.length < 6) {
      errors.password = isHi ? 'पासवर्ड कम से कम ६ अक्षरों का होना चाहिए' : 'Password must be at least 6 characters';
    }

    // Confirm match
    if (password !== confirm) {
      errors.confirm = isHi ? 'दोनों पासवर्ड आपस में मेल नहीं खाते हैं' : 'Passwords do not match';
    }

    if (Object.keys(errors).length > 0) {
      setSignupErrors(errors);
      return;
    }

    // Check pre-existence
    const users = getStoredUsers();
    const emailExists = users.some(u => u.email.toLowerCase() === email.toLowerCase());
    const mobileExists = users.some(u => u.mobile === mobile);

    if (emailExists) {
      errors.email = isHi ? 'यह ईमेल पता पहले से रजिस्टर्ड है' : 'This Email is already registered';
      setSignupErrors(errors);
      return;
    }
    if (mobileExists) {
      errors.mobile = isHi ? 'यह मोबाइल नंबर पहले से रजिस्टर्ड है' : 'This Mobile is already registered';
      setSignupErrors(errors);
      return;
    }

    // Register user
    const passwordHash = await hashPassword(password);
    const newUser: User = {
      fullName: name,
      email: email,
      mobile: mobile,
      passwordHash: passwordHash,
      registeredAt: new Date().toISOString(),
      role: signUpRole
    };

    saveStoredUsers([...users, newUser]);
    setSignupSuccess(true);
    
    // Auto login after success
    setTimeout(() => {
      onSuccess(newUser);
    }, 1500);
  };

  // Forgot password lookup
  const handleForgotLookup = (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError('');
    const id = forgotIdentifier.trim();

    if (!id) {
      setForgotError(isHi ? 'कृपया ईमेल या मोबाइल नंबर दर्ज करें' : 'Please enter email or mobile');
      return;
    }

    const users = getStoredUsers();
    const match = users.find(
      u => u.email.toLowerCase() === id.toLowerCase() || u.mobile === id
    );

    if (!match) {
      setForgotError(isHi ? 'इस विवरण के साथ कोई पंजीकृत खाता नहीं मिला' : 'No registered account found with these details');
      return;
    }

    setFoundUser(match);
    setForgotStep(2);
  };

  // Forgot password reset confirmation
  const handleForgotReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError('');

    if (newPassword.length < 6) {
      setForgotError(isHi ? 'नया पासवर्ड कम से कम ६ वर्णों का होना चाहिए' : 'New password must be at least 6 characters');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setForgotError(isHi ? 'दोनों पासवर्ड आपस में मेल नहीं खाते हैं' : 'Passwords do not match');
      return;
    }

    if (!foundUser) return;

    const users = getStoredUsers();
    const hashed = await hashPassword(newPassword);

    const updated = users.map(u => {
      if (u.email.toLowerCase() === foundUser.email.toLowerCase()) {
        return { ...u, passwordHash: hashed };
      }
      return u;
    });

    saveStoredUsers(updated);
    setResetSuccess(true);
    
    setTimeout(() => {
      setMode('login');
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md bg-black/65 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative bg-white w-full max-w-md rounded-3xl overflow-hidden shadow-2xl flex flex-col my-8 border border-neutral-100"
      >
        {/* Colorful top bar */}
        <div className="h-2 bg-linear-to-r from-teal-800 via-emerald-600 to-teal-900" />

        {/* Modal Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 bg-neutral-150 hover:bg-neutral-200 p-2 rounded-full transition-colors z-10"
          aria-label="Close"
        >
          <DynamicIcon name="X" size={14} />
        </button>

        <div className="p-8">
          
          {/* Header Branding */}
          <div className="text-center mb-8">
            <div className="w-12 h-12 bg-teal-850 text-white rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-teal-900/10 mb-4 bg-gradient-to-r from-teal-800 to-emerald-800">
              <DynamicIcon name="Home" size={22} className="text-emerald-300" />
            </div>
            <h3 className="text-2xl font-black text-gray-900 font-display">
              Rural Company
            </h3>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">
              {isHi ? 'होम सर्विस सुरक्षा पोर्टल' : 'Home Service Security Portal'}
            </p>
          </div>

          <AnimatePresence mode="wait">
            
            {/* 1. LOGIN MODE */}
            {mode === 'login' && (
              <motion.div
                key="login-view"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
              >
                <h4 className="text-[10px] font-bold text-gray-400 mb-2 uppercase tracking-wider text-center">
                  {isHi ? 'त्वरित परीक्षण लॉगिन (No Typing Required)' : 'Quick Test Accounts (No Typing Required)'}
                </h4>
                <div className="grid grid-cols-3 gap-1.5 mb-4 bg-teal-50/70 p-1.5 rounded-xl border border-teal-100">
                  <button
                    onClick={() => loginGenericRole('customer')}
                    className="py-1 px-1.5 bg-white hover:bg-neutral-50 border border-teal-200/50 text-teal-800 text-[10px] font-black rounded-lg cursor-pointer transition-all active:scale-95 text-center shadow-xs"
                  >
                    👤 {isHi ? 'ग्राहक' : 'Customer'}
                  </button>
                  <button
                    onClick={() => loginGenericRole('provider')}
                    className="py-1 px-1.5 bg-white hover:bg-neutral-50 border border-teal-200/50 text-teal-800 text-[10px] font-black rounded-lg cursor-pointer transition-all active:scale-95 text-center shadow-xs"
                  >
                    🛠️ {isHi ? 'पार्टनर' : 'Partner'}
                  </button>
                  <button
                    onClick={() => loginGenericRole('admin')}
                    className="py-1 px-1.5 bg-white hover:bg-neutral-50 border border-teal-200/50 text-teal-800 text-[10px] font-black rounded-lg cursor-pointer transition-all active:scale-95 text-center shadow-xs"
                  >
                    👑 {isHi ? 'एडमिन' : 'Admin'}
                  </button>
                </div>

                <div className="relative flex py-1 items-center mb-4">
                  <div className="flex-grow border-t border-gray-200/70"></div>
                  <span className="flex-shrink mx-3 text-gray-400 text-[9px] font-bold uppercase tracking-wider">
                    {isHi ? 'या क्रेडेंशियल्स दर्ज करें' : 'Or use standard login'}
                  </span>
                  <div className="flex-grow border-t border-gray-200/70"></div>
                </div>

                <h4 className="text-base font-bold text-gray-900 mb-4 font-display text-center">
                  {isHi ? 'अपने खाते में लॉग इन करें' : 'Log In to your Account'}
                </h4>

                {loginError && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-150 rounded-2xl text-xs text-red-700 flex items-center gap-2 font-medium">
                    <span className="text-sm">⚠️</span>
                    <span>{loginError}</span>
                  </div>
                )}

                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                      {isHi ? 'ईमेल या मोबाइल नंबर' : 'Email or Mobile Number'}
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-3.5 text-gray-400">
                        <DynamicIcon name="User" size={16} />
                      </span>
                      <input
                        type="text"
                        required
                        value={loginIdentifier}
                        onChange={(e) => setLoginIdentifier(e.target.value)}
                        placeholder={isHi ? 'जैसे: rahul@gmail.com या 98452xxxxx' : 'e.g. name@domain.com or 10-digits'}
                        className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 focus:bg-white rounded-2xl text-sm focus:outline-hidden focus:border-teal-700 font-medium transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">
                        {isHi ? 'पासवर्ड' : 'Password'}
                      </label>
                      <button
                        type="button"
                        onClick={() => setMode('forgot')}
                        className="text-xs text-teal-700 hover:text-teal-900 font-bold"
                      >
                        {isHi ? 'पासवर्ड भूल गए?' : 'Forgot Password?'}
                      </button>
                    </div>
                    <div className="relative">
                      <span className="absolute left-4 top-3 ml-0.5 text-gray-400">
                        <DynamicIcon name="Lock" size={14} />
                      </span>
                      <input
                        type={showLoginPassword ? 'text' : 'password'}
                        required
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-11 pr-12 py-3 bg-gray-50 border border-gray-200 focus:bg-white rounded-2xl text-sm focus:outline-hidden focus:border-teal-700 font-medium transition-colors"
                      />
                      <button
                        type="button"
                        onClick={() => setShowLoginPassword(!showLoginPassword)}
                        className="absolute right-4 top-3 text-gray-400 hover:text-gray-600 cursor-pointer"
                      >
                        <DynamicIcon name={showLoginPassword ? 'Eye' : 'EyeOff'} size={14} />
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 bg-gradient-to-r from-teal-800 to-emerald-800 hover:from-teal-900 hover:to-emerald-950 text-white rounded-2xl font-black text-sm shadow-lg shadow-teal-900/10 cursor-pointer hover:scale-[1.01] active:scale-95 transition-all text-center"
                  >
                    {isHi ? 'लॉग इन करें' : 'Log In'}
                  </button>
                </form>

                {/* Direct register suggest */}
                <div className="mt-8 pt-6 border-t border-gray-100 text-center">
                  <p className="text-xs text-gray-500 font-medium">
                    {isHi ? 'नया खाता बनाना चाहते हैं?' : "Don't have an account yet?"}
                  </p>
                  <button
                    onClick={() => setMode('signup')}
                    className="mt-2 text-sm text-teal-800 hover:text-teal-950 font-extrabold cursor-pointer"
                  >
                    {isHi ? 'नया निःशुल्क खाता बनाएँ' : 'Sign Up Free'}
                  </button>
                </div>
              </motion.div>
            )}

            {/* 2. SIGNUP MODE */}
            {mode === 'signup' && (
              <motion.div
                key="signup-view"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
              >
                <h4 className="text-base font-bold text-gray-900 mb-3 font-display text-center">
                  {isHi ? 'नया अकाउंट बनाएं' : 'Create Free Account'}
                </h4>

                {/* Account Type/Role Selector */}
                <div className="mb-4 animate-fade-in">
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1.5 text-center">
                    {isHi ? 'अकाउंट का प्रकार (रोल) चुनें' : 'Choose Account Type (Role)'}
                  </label>
                  <div className="grid grid-cols-3 gap-1 bg-gray-100 p-1 rounded-xl border border-gray-200">
                    <button
                      type="button"
                      onClick={() => setSignUpRole('customer')}
                      className={`py-1 rounded-lg text-[10px] font-black transition-all cursor-pointer ${
                        signUpRole === 'customer'
                          ? 'bg-teal-850 text-white shadow-xs'
                          : 'text-gray-500 hover:text-gray-800'
                      }`}
                    >
                      👤 {isHi ? 'ग्राहक' : 'Customer'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setSignUpRole('provider')}
                      className={`py-1 rounded-lg text-[10px] font-black transition-all cursor-pointer ${
                        signUpRole === 'provider'
                          ? 'bg-teal-850 text-white shadow-xs'
                          : 'text-gray-500 hover:text-gray-800'
                      }`}
                    >
                      🛠️ {isHi ? 'पार्टनर' : 'Partner'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setSignUpRole('admin')}
                      className={`py-1 rounded-lg text-[10px] font-black transition-all cursor-pointer ${
                        signUpRole === 'admin'
                          ? 'bg-teal-850 text-white shadow-xs'
                          : 'text-gray-500 hover:text-gray-800'
                      }`}
                    >
                      👑 {isHi ? 'एडमिन' : 'Admin'}
                    </button>
                  </div>
                </div>

                {signupSuccess && (
                  <div className="mb-4 p-4 bg-emerald-50 border border-emerald-150 rounded-2xl text-center text-xs text-emerald-800 flex flex-col items-center gap-2 font-bold animate-bounce">
                    <span className="text-2xl">🎉</span>
                    <span>{isHi ? 'रजिस्ट्रेशन सफल! लॉग इन किया जा रहा है...' : 'Signed Up Successfully! Autologging in...'}</span>
                  </div>
                )}

                <form onSubmit={handleSignupSubmit} className="space-y-4 max-h-[46vh] overflow-y-auto pr-1">
                  
                  {/* FULL NAME */}
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                      {isHi ? 'आपका पूरा नाम' : 'Your Full Name'}
                    </label>
                    <input
                      type="text"
                      required
                      value={signUpName}
                      onChange={(e) => setSignUpName(e.target.value)}
                      placeholder={isHi ? 'जैसे: अमित कुमार रंजन' : 'e.g. John Doe'}
                      className={`w-full px-4 py-2.5 bg-gray-50 border ${signupErrors.name ? 'border-red-400' : 'border-gray-200'} focus:bg-white rounded-xl text-xs focus:outline-hidden focus:border-teal-700 font-semibold`}
                    />
                    {signupErrors.name && (
                      <p className="text-[10px] text-red-600 mt-1 font-bold">{signupErrors.name}</p>
                    )}
                  </div>

                  {/* EMAIL ADDRESS */}
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                      {isHi ? 'ईमेल पता' : 'Email Address'}
                    </label>
                    <input
                      type="email"
                      required
                      value={signUpEmail}
                      onChange={(e) => setSignUpEmail(e.target.value)}
                      placeholder="name@domain.com"
                      className={`w-full px-4 py-2.5 bg-gray-50 border ${signupErrors.email ? 'border-red-400' : 'border-gray-200'} focus:bg-white rounded-xl text-xs focus:outline-hidden focus:border-teal-700 font-semibold`}
                    />
                    {signupErrors.email && (
                      <p className="text-[10px] text-red-600 mt-1 font-bold">{signupErrors.email}</p>
                    )}
                  </div>

                  {/* MOBILE NUMBER */}
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                      {isHi ? 'मोबाइल नंबर (१० अंक)' : 'Mobile Number (10 digits)'}
                    </label>
                    <input
                      type="tel"
                      required
                      maxLength={10}
                      value={signUpMobile}
                      onChange={(e) => setSignUpMobile(e.target.value.replace(/\D/g, ''))}
                      placeholder="9450xxxxxx"
                      className={`w-full px-4 py-2.5 bg-gray-50 border ${signupErrors.mobile ? 'border-red-400' : 'border-gray-200'} focus:bg-white rounded-xl text-xs focus:outline-hidden focus:border-teal-700 font-semibold`}
                    />
                    {signupErrors.mobile && (
                      <p className="text-[10px] text-red-600 mt-1 font-bold">{signupErrors.mobile}</p>
                    )}
                  </div>

                  {/* PASSWORD */}
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                      {isHi ? 'पासवर्ड (कम से कम ६ अंक)' : 'Password (min 6 chars)'}
                    </label>
                    <div className="relative">
                      <input
                        type={showSignUpPassword ? 'text' : 'password'}
                        required
                        value={signUpPassword}
                        onChange={(e) => setSignUpPassword(e.target.value)}
                        placeholder="••••••••"
                        className={`w-full px-4 py-2.5 bg-gray-50 border ${signupErrors.password ? 'border-red-400' : 'border-gray-200'} focus:bg-white rounded-xl text-xs focus:outline-hidden focus:border-teal-700 font-semibold`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowSignUpPassword(!showSignUpPassword)}
                        className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                      >
                        <DynamicIcon name={showSignUpPassword ? 'Eye' : 'X'} size={14} />
                      </button>
                    </div>
                    {signupErrors.password && (
                      <p className="text-[10px] text-red-600 mt-1 font-bold">{signupErrors.password}</p>
                    )}
                  </div>

                  {/* CONFIRM PASSWORD */}
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                      {isHi ? 'पासवर्ड की पुष्टि करें' : 'Confirm Password'}
                    </label>
                    <input
                      type="password"
                      required
                      value={signUpConfirmPassword}
                      onChange={(e) => setSignUpConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className={`w-full px-4 py-2.5 bg-gray-50 border ${signupErrors.confirm ? 'border-red-400' : 'border-gray-200'} focus:bg-white rounded-xl text-xs focus:outline-hidden focus:border-teal-700 font-semibold`}
                    />
                    {signupErrors.confirm && (
                      <p className="text-[10px] text-red-600 mt-1 font-bold">{signupErrors.confirm}</p>
                    )}
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 bg-gradient-to-r from-teal-800 to-emerald-800 hover:from-teal-900 to-emerald-950 text-white rounded-xl font-black text-xs shadow-lg shadow-teal-900/10 cursor-pointer transition-transform duration-150 hover:scale-[1.01]"
                  >
                    {isHi ? 'निःशुल्क अकाउंट बनाएं' : 'Sign Up Account'}
                  </button>
                </form>

                {/* Back to Login */}
                <div className="mt-6 pt-5 border-t border-gray-100 text-center">
                  <p className="text-xs text-gray-500 font-medium">
                    {isHi ? 'पहले से खाता है?' : 'Already have an account?'}
                  </p>
                  <button
                    onClick={() => setMode('login')}
                    className="mt-2 text-sm text-teal-800 hover:text-teal-950 font-extrabold"
                  >
                    {isHi ? 'यहाँ लॉग इन करें' : 'Log In Here'}
                  </button>
                </div>
              </motion.div>
            )}

            {/* 3. FORGOT PASSWORD MODE */}
            {mode === 'forgot' && (
              <motion.div
                key="forgot-view"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
              >
                <h4 className="text-lg font-bold text-gray-900 mb-6 font-display text-center">
                  {isHi ? 'पासवर्ड पुनर्प्राप्ति (Reset Password)' : 'Recover Your Password'}
                </h4>

                {forgotError && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-150 rounded-2xl text-xs text-red-700 flex items-center gap-2 font-medium">
                    <span>⚠️</span>
                    <span>{forgotError}</span>
                  </div>
                )}

                {resetSuccess && (
                  <div className="mb-4 p-4 bg-emerald-50 border border-emerald-150 rounded-2xl text-center text-xs text-emerald-800 flex flex-col items-center gap-2 font-bold animate-pulse">
                    <span>🗝️</span>
                    <span>{isHi ? 'आपका पासवर्ड सफलतापूर्वक अपडेट हो गया है! निर्देशित किया जा रहा है...' : 'Password updated successfully! Directing back to login...'}</span>
                  </div>
                )}

                {/* Step 1: User verification */}
                {forgotStep === 1 && !resetSuccess && (
                  <form onSubmit={handleForgotLookup} className="space-y-4">
                    <p className="text-xs text-gray-500 leading-relaxed text-center">
                      {isHi 
                        ? 'अपना पंजीकृत ईमेल या १०-अंकों का मोबाइल नंबर दर्ज करें। हम आपके खाते को डेटाबेस में प्रमाणित करेंगे ताकि आप पासवर्ड बदल सकें।' 
                        : 'Enter your registered Email or Mobile number. We will fetch and authenticate your customer profile to facilitate resetting.'}
                    </p>

                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                        {isHi ? 'पंजीकृत ईमेल या मोबाइल नंबर' : 'Registered Email or Mobile'}
                      </label>
                      <input
                        type="text"
                        required
                        value={forgotIdentifier}
                        onChange={(e) => setForgotIdentifier(e.target.value)}
                        placeholder={isHi ? 'ईमेल या १० अंकों का फ़ोन नंबर' : 'e.g. your_email@domain.com'}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:outline-hidden focus:border-teal-700 font-medium"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3 bg-teal-800 hover:bg-teal-900 text-white rounded-2xl font-bold text-xs"
                    >
                      {isHi ? 'खाता प्रमाणित करें' : 'Verify My Account'}
                    </button>
                  </form>
                )}

                {/* Step 2: New password input */}
                {forgotStep === 2 && !resetSuccess && foundUser && (
                  <form onSubmit={handleForgotReset} className="space-y-4">
                    <div className="p-3 bg-emerald-50/50 border border-emerald-100 rounded-2xl text-xs text-teal-850">
                      <p className="font-bold">
                        {isHi ? `नमस्ते ${foundUser.fullName}!` : `Hello, ${foundUser.fullName}!`}
                      </p>
                      <p className="text-gray-500 mt-1">
                        {isHi ? 'प्रमाणीकृत खाता मिल गया। कृपया नया पासवर्ड सेट करें:' : 'Account verified. Establish a new secure password below:'}
                      </p>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                        {isHi ? 'नया पासवर्ड (कम से कम ६ अंक)' : 'New Password (min 6 chars)'}
                      </label>
                      <input
                        type="password"
                        required
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-hidden focus:border-teal-700 font-semibold"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                        {isHi ? 'नए पासवर्ड की पुष्टि करें' : 'Confirm New Password'}
                      </label>
                      <input
                        type="password"
                        required
                        value={confirmNewPassword}
                        onChange={(e) => setConfirmNewPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-hidden focus:border-teal-700 font-semibold"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3.5 bg-gradient-to-r from-teal-800 to-emerald-800 text-white rounded-xl font-bold text-xs"
                    >
                      {isHi ? 'पासवर्ड सहेजें (Save Password)' : 'Update Secured Password'}
                    </button>
                  </form>
                )}

                {/* Link to login */}
                <div className="mt-6 pt-5 border-t border-gray-100 text-center">
                  <button
                    onClick={() => setMode('login')}
                    className="text-xs text-teal-800 hover:text-teal-950 font-extrabold flex items-center gap-1 mx-auto"
                  >
                    <DynamicIcon name="ArrowRight" size={12} className="rotate-180" />
                    <span>{isHi ? 'लॉग इन स्क्रीन पर वापस जाएँ' : 'Back to Login Portal'}</span>
                  </button>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
