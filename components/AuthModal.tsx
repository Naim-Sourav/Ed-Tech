
import React, { useState, useEffect } from 'react';
import { logger } from '../utils/logger';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth } from '../services/firebase';
import { useAuth } from '../contexts/AuthContext';
import { syncUserToMongoDB } from '../services/api';
import { X, Mail, Lock, User, Loader2, LogIn, Smartphone } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { loginWithGoogle } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Close on Escape for keyboard users (must stay above the early return)
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const validatePhone = (number: string) => {
    return /^01[3-9]\d{8}$/.test(number);
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    try {
        await loginWithGoogle();
        onClose();
    } catch (err: any) {
        logger.error("Login Error:", err);
        let msg = "Google Login Failed.";
        if (err.code === 'auth/popup-closed-by-user') {
            msg = "লগইন উইন্ডোটি বন্ধ করা হয়েছে।";
        } else if (err.code === 'auth/popup-blocked') {
            msg = "পপ-আপ ব্লক করা হয়েছে। ব্রাউজার সেটিং চেক করুন।";
        } else if (err.code === 'auth/unauthorized-domain') {
            msg = "এই ডোমেইনটি অথোরাইজড নয়।";
        }
        setError(msg);
    } finally {
        setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!isLogin && !validatePhone(phoneNumber)) {
        setError("সঠিক মোবাইল নাম্বার দিন");
        setLoading(false);
        return;
    }

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, {
          displayName: name
        });
        await syncUserToMongoDB({
            ...userCredential.user,
            displayName: name
        }, { phoneNumber });
      }
      onClose();
    } catch (err: any) {
      logger.error(err);
      if (err.code === 'auth/invalid-credential') {
        setError('ইমেইল বা পাসওয়ার্ড ভুল হয়েছে।');
      } else if (err.code === 'auth/email-already-in-use') {
        setError('এই ইমেইল দিয়ে ইতিমধ্যে একাউন্ট খোলা আছে।');
      } else if (err.code === 'auth/weak-password') {
        setError('পাসওয়ার্ড অত্যন্ত দুর্বল।');
      } else {
        setError('লগইন ব্যর্থ হয়েছে।');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div role="dialog" aria-modal="true" aria-label={isLogin ? 'লগইন' : 'একাউন্ট তৈরি করুন'} className="bg-white dark:bg-zinc-900 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 border border-gray-200 dark:border-zinc-800">
        <div className="p-6 pb-0 flex justify-between items-start">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
            {isLogin ? "স্বাগতম!" : "একাউন্ট তৈরি করুন"}
          </h2>
          <button
            onClick={onClose}
            aria-label="বন্ধ করুন"
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
          >
            <X size={24} className="text-gray-500" />
          </button>
        </div>

        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm rounded-lg border border-red-100 dark:border-red-800">
              {error}
            </div>
          )}

          <button
             onClick={handleGoogleLogin}
             disabled={loading}
             className="w-full bg-white dark:bg-zinc-900 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-white font-bold py-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all flex items-center justify-center gap-2 mb-4 text-sm"
           >
             <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.84z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
             </svg>
             {"Google দিয়ে চালিয়ে যান"}
           </button>

           <div className="relative mb-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200 dark:border-zinc-800"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-2 bg-white dark:bg-zinc-900 text-gray-500">{"অথবা"}</span>
              </div>
           </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            {!isLogin && (
              <>
                <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">{"আপনার নাম"}</label>
                    <div className="relative">
                    <User size={16} className="absolute left-3 top-3 text-gray-400" />
                    <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary dark:text-white text-sm"
                        placeholder={"আপনার নাম"}
                    />
                    </div>
                </div>
                <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">{"মোবাইল নাম্বার"}</label>
                    <div className="relative">
                    <Smartphone size={16} className="absolute left-3 top-3 text-gray-400" />
                    <input
                        type="tel"
                        required
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary dark:text-white text-sm"
                        placeholder="01XXXXXXXXX"
                    />
                    </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">{"ইমেইল এড্রেস"}</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary dark:text-white text-sm"
                  placeholder="name@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">{"পাসওয়ার্ড"}</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary dark:text-white text-sm"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-purple-700 text-white font-bold py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 mt-2 text-sm"
            >
              {loading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <>
                  {isLogin ? <LogIn size={18} /> : <User size={18} />}
                  {isLogin ? "লগইন করুন" : "রেজিস্ট্রেশন করুন"}
                </>
              )}
            </button>
          </form>

          <div className="mt-4 text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {isLogin ? "একাউন্ট নেই?" : "ইতিমধ্যে একাউন্ট আছে?"}
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="ml-2 font-bold text-primary hover:underline"
              >
                {isLogin ? "রেজিস্ট্রেশন করুন" : "লগইন করুন"}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
