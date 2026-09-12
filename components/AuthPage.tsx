
import React, { useState } from 'react';
import { logger } from '../utils/logger';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth } from '../services/firebase';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { syncUserToMongoDB } from '../services/api';
import { Mail, Lock, User, Loader2, ArrowRight, Smartphone } from 'lucide-react';

interface AuthPageProps {
  onBack: () => void;
}

const AuthPage: React.FC<AuthPageProps> = ({ onBack }) => {
  const { loginWithGoogle } = useAuth();
  const { t } = useLanguage();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Check for URL params to pre-fill data (e.g. from Public Exam)
  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const pEmail = params.get('email');
    const pName = params.get('name');
    
    if (pEmail || pName) {
        setIsLogin(false); // Switch to register mode
        if (pEmail) setEmail(pEmail);
        if (pName) setName(pName);
    }
  }, []);

  const validatePhone = (number: string) => {
    return /^01[3-9]\d{8}$/.test(number);
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    try {
        await loginWithGoogle();
        // Successful login will trigger onAuthStateChanged in AuthContext
    } catch (err: any) {
        logger.error("Login Error:", err);
        let msg = "Google Login Failed.";
        if (err.code === 'auth/popup-closed-by-user') {
            msg = "লগইন উইন্ডোটি বন্ধ করা হয়েছে। দয়া করে আবার চেষ্টা করুন।";
        } else if (err.code === 'auth/popup-blocked') {
            msg = "পপ-আপ ব্লক করা হয়েছে। ব্রাউজার সেটিং চেক করুন।";
        } else if (err.code === 'auth/unauthorized-domain') {
            msg = "এই ডোমেইনটি অথোরাইজড নয়। (Developer Note: Add domain to Firebase Console)";
        } else if (err.code === 'auth/network-request-failed') {
            msg = "ইন্টারনেট সংযোগ চেক করুন।";
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
        setError("সঠিক মোবাইল নাম্বার দিন (যেমন: 017...)");
        setLoading(false);
        return;
    }

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        
        // Remove default cartoon avatar. Leave photoURL empty to trigger Initial Avatar UI.
        await updateProfile(userCredential.user, {
          displayName: name,
          photoURL: "" 
        });
        
        await syncUserToMongoDB({
            ...userCredential.user,
            displayName: name,
            photoURL: ""
        }, { phoneNumber });
      }
    } catch (err: any) {
      logger.error(err);
      if (err.code === 'auth/invalid-credential') {
        setError('ইমেইল বা পাসওয়ার্ড ভুল হয়েছে।');
      } else if (err.code === 'auth/email-already-in-use') {
        setError('এই ইমেইল দিয়ে ইতিমধ্যে একাউন্ট খোলা আছে।');
      } else if (err.code === 'auth/weak-password') {
        setError('পাসওয়ার্ড অত্যন্ত দুর্বল (অন্তত ৬ অক্ষর দিন)।');
      } else {
        setError('লগইন ব্যর্থ হয়েছে। আবার চেষ্টা করুন।');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white dark:bg-black transition-colors">
      {/* Left Side - Visual */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary relative items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-primary to-orange-800 opacity-90"></div>
        
        <div className="relative z-10 p-12 text-white max-w-lg">
          <div className="flex items-center gap-3 mb-8">
            <div className="h-16 w-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center shadow-xl border-2 border-white overflow-hidden p-2">
               <img src="./Pshape.svg" alt="Porikkhangon Logo" className="w-full h-full object-contain [filter:invert(1)_hue-rotate(180deg)]" />
            </div>
            <img src="./letterlogo.svg" alt="Porikkhangon Letter Logo" className="h-10 w-auto object-contain [filter:invert(1)_hue-rotate(180deg)]" />
          </div>
          <h1 className="text-5xl font-bold mb-6">আপনার লার্নিং জার্নি শুরু হোক এখান থেকেই</h1>
          <p className="text-lg text-orange-100 leading-relaxed mb-8">
            AI টিউটর, স্মার্ট কুইজ এবং পার্সোনালাইজড সাপোর্টের মাধ্যমে নিজেকে প্রস্তুত করুন সেরা ফলাফলের জন্য।
          </p>
          <div className="flex gap-4">
             <div className="px-4 py-2 bg-white/10 rounded-lg backdrop-blur-sm border border-white/20">
                <span className="font-bold text-2xl">10k+</span>
                <p className="text-sm text-orange-100">Students</p>
             </div>
             <div className="px-4 py-2 bg-white/10 rounded-lg backdrop-blur-sm border border-white/20">
                <span className="font-bold text-2xl">50k+</span>
                <p className="text-sm text-orange-100">Tests</p>
             </div>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md space-y-6">
           <div className="text-center lg:text-left">
              <button onClick={onBack} className="text-sm text-gray-500 hover:text-primary mb-4 flex items-center justify-center lg:justify-start gap-1">
                 ← {t('auth_back')}
              </button>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                {isLogin ? t('auth_welcome') : t('auth_create_account')}
              </h2>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                {isLogin ? t('auth_login_subtitle') : t('auth_register_subtitle')}
              </p>
           </div>

           {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm rounded-xl border border-red-100 dark:border-red-800 flex items-center gap-2">
              <span className="font-bold">Error:</span> {error}
            </div>
           )}

           <button
             onClick={handleGoogleLogin}
             disabled={loading}
             className="w-full bg-white dark:bg-zinc-900 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-white font-bold py-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all flex items-center justify-center gap-3 relative disabled:opacity-70 disabled:cursor-not-allowed"
           >
             <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.84z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
             </svg>
             {t('auth_google')}
           </button>

           <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200 dark:border-zinc-800"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="px-2 bg-white dark:bg-black text-gray-500">{t('auth_or')}</span>
              </div>
           </div>

           <form onSubmit={handleSubmit} className="space-y-4">
             {!isLogin && (
               <>
                <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">{t('auth_name')}</label>
                    <div className="relative group">
                        <User size={18} className="absolute left-3 top-3.5 text-gray-400 group-focus-within:text-primary transition-colors" />
                        <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent dark:text-white transition-all text-sm"
                        placeholder={t('auth_name')}
                        />
                    </div>
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">{t('auth_phone')}</label>
                    <div className="relative group">
                        <Smartphone size={18} className="absolute left-3 top-3.5 text-gray-400 group-focus-within:text-primary transition-colors" />
                        <input
                        type="tel"
                        required
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent dark:text-white transition-all text-sm"
                        placeholder="01XXXXXXXXX"
                        />
                    </div>
                </div>
               </>
             )}

             <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">{t('auth_email')}</label>
                <div className="relative group">
                  <Mail size={18} className="absolute left-3 top-3.5 text-gray-400 group-focus-within:text-primary transition-colors" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent dark:text-white transition-all text-sm"
                    placeholder="name@example.com"
                  />
                </div>
             </div>

             <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">{t('auth_password')}</label>
                <div className="relative group">
                  <Lock size={18} className="absolute left-3 top-3.5 text-gray-400 group-focus-within:text-primary transition-colors" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent dark:text-white transition-all text-sm"
                    placeholder="••••••••"
                  />
                </div>
             </div>

             <button
               type="submit"
               disabled={loading}
               className="w-full bg-primary hover:bg-orange-700 text-white font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-orange-900/20 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
             >
               {loading ? (
                 <Loader2 size={24} className="animate-spin" />
               ) : (
                 <>
                   {isLogin ? t('auth_login_btn') : t('auth_register_btn')} <ArrowRight size={20} />
                 </>
               )}
             </button>
           </form>

           <div className="text-center">
             <p className="text-sm text-gray-600 dark:text-gray-400">
               {isLogin ? t('auth_no_account') : t('auth_have_account')}
               <button
                 onClick={() => setIsLogin(!isLogin)}
                 className="ml-2 font-bold text-primary hover:underline"
               >
                 {isLogin ? t('auth_register_btn') : t('auth_login_btn')}
               </button>
             </p>
           </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
