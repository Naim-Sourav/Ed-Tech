
import React, { useState } from 'react';
import { logger } from '../utils/logger';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  ChevronLeft, 
  Bell, 
  Send, 
  Facebook, 
  ExternalLink, 
  Sparkles, 
  Clock, 
  AlertCircle,
  CheckCircle2,
  TrendingUp,
  Users,
  Trophy,
  Share2,
  Zap,
  X
} from 'lucide-react';
import { AnimatePresence } from 'motion/react';
import { useToast } from './Toast';
import { useAuth } from '../contexts/AuthContext';
import { subscribeToPushNotifications, checkSubscription } from '../services/notificationService';

const GSTResultPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { showToast } = useToast();
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [showTelegramModal, setShowTelegramModal] = useState(false);

  // Check subscription status on mount
  React.useEffect(() => {
    const check = async () => {
      const status = await checkSubscription();
      setIsSubscribed(status);
    };
    check();

    window.addEventListener('focus', check);
    return () => window.removeEventListener('focus', check);
  }, []);

  // Breaking News Items
  const breakingNews = [
    "গুচ্ছ ক ইউনিটের ভর্তি পরীক্ষার ফলাফল আজ প্রকাশিত হতে পারে।",
    "এ বছর ক ইউনিটে কাট মার্ক গত বছরের তুলনায় কিছুটা কমতে পারে বলে ধারণা করা হচ্ছে।",
    "ফলাফল প্রকাশের সাথে সাথেই আমাদের টেলিগ্রাম চ্যানেলে সরাসরি লিঙ্ক দেওয়া হবে।",
    "গুচ্ছভুক্ত ২৪টি বিশ্ববিদ্যালয়ের আসন বিন্যাস ও ভর্তি প্রক্রিয়া নিয়ে বিস্তারিত আপডেট আসছে।",
    "ফলাফল দেখার জন্য আপনার রোল ও রেজিস্ট্রেশন নম্বর প্রস্তুত রাখুন।"
  ];

  const handleSubscribe = async () => {
    if (!currentUser) {
      showToast("নোটিফিকেশন চালু করতে আগে লগইন করুন", "info");
      return;
    }

    setIsSubscribing(true);
    const result = await subscribeToPushNotifications(currentUser);
    
    if (result && 'token' in result) {
      setIsSubscribed(true);
      setShowTelegramModal(true);
      showToast("আপনাকে ধন্যবাদ! ফলাফল প্রকাশ হওয়া মাত্রই আমরা আপনাকে জানিয়ে দেব।", "success");
      if (navigator.vibrate) navigator.vibrate(10);
    } else if (result && 'error' in result) {
      showToast(result.error, "error");
    }
    setIsSubscribing(false);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'GST A Unit Result Updates',
        text: 'গুচ্ছ ক ইউনিটের রেজাল্ট আপডেট সবার আগে পেতে এই পেজটি ভিজিট করুন!',
        url: window.location.href,
      }).catch(logger.error);
    } else {
      navigator.clipboard.writeText(window.location.href);
      showToast("লিঙ্ক কপি করা হয়েছে", "success");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors pb-20 overflow-x-hidden">
      
      {/* 1. Breaking News Ticker */}
      <div className="bg-primary py-2.5 relative z-50 shadow-lg">
        <div className="flex whitespace-nowrap animate-marquee">
          {[...breakingNews, ...breakingNews].map((news, i) => (
            <div key={i} className="flex items-center gap-3 px-8">
              <span className="w-2 h-2 bg-white rounded-full animate-pulse shrink-0" />
              <span className="text-white text-xs md:text-sm font-black tracking-tight font-tiro">
                {news}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Hero Section */}
      <div className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-black pt-12 pb-32 px-4 overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_50%_50%,#f97316_0%,transparent_50%)]"></div>
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.2, 0.1]
          }}
          transition={{ duration: 10, repeat: Infinity }}
          className="absolute -top-24 -left-24 w-96 h-96 bg-primary/20 rounded-full blur-[100px]"
        />
        <motion.div 
          animate={{ 
            scale: [1, 1.3, 1],
            opacity: [0.1, 0.3, 0.1]
          }}
          transition={{ duration: 15, repeat: Infinity, delay: 2 }}
          className="absolute -bottom-24 -right-24 w-96 h-96 bg-orange-600/20 rounded-full blur-[100px]"
        />

        <div className="max-w-4xl mx-auto relative z-10">
          <button 
            onClick={() => navigate(-1)}
            className="mb-8 flex items-center gap-2 text-white/60 hover:text-white font-bold transition-all group"
          >
            <div className="p-2 rounded-xl bg-white/5 group-hover:bg-white/10 transition-colors">
              <ChevronLeft size={20} />
            </div>
            ফিরে যান
          </button>

          <div className="flex flex-col items-center text-center space-y-6">
            <h1 className="text-4xl md:text-7xl font-black text-white leading-[1.1] tracking-tight font-tiro">
              গুচ্ছ ক ইউনিট <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-orange-400">ফলাফল ২০২৫-২৬</span>
            </h1>

            <p className="text-gray-400 font-medium max-w-2xl text-sm md:text-lg leading-relaxed font-tiro">
              গুচ্ছ ক ইউনিটের রেজাল্ট আজ প্রকাশিত হতে পারে। ফলাফল প্রকাশের সাথে সাথেই আমরা আপনাকে নোটিফিকেশনের মাধ্যমে জানিয়ে দেব। বারবার ওয়েবসাইট চেক করার ঝামেলা থেকে মুক্তি পেতে আমাদের সাথেই থাকুন।
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
              {!isSubscribed && (
                <button 
                  onClick={handleSubscribe}
                  disabled={isSubscribing}
                  className={`px-8 py-4 rounded-2xl font-black flex items-center gap-3 transition-all active:scale-95 shadow-2xl bg-primary text-white shadow-primary/30 hover:scale-105 disabled:opacity-50 disabled:scale-100`}
                >
                  {isSubscribing ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Bell size={20} className="animate-bounce" />
                  )}
                  {isSubscribing ? 'প্রসেসিং হচ্ছে...' : 'রেজাল্ট এলার্ট চালু করুন'}
                </button>
              )}
              
              {isSubscribed && (
                <div className="px-8 py-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-2xl font-black flex items-center gap-3">
                  <CheckCircle2 size={20} />
                  রেজাল্ট এলার্ট চালু আছে
                </div>
              )}

              <button 
                onClick={handleShare}
                className="px-8 py-4 bg-white/5 hover:bg-white/10 backdrop-blur-md text-white rounded-2xl font-black transition-all active:scale-95 border border-white/10 flex items-center gap-3"
              >
                <Share2 size={20} /> বন্ধুদের সাথে শেয়ার করুন
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Status & Social Section */}
      <div className="max-w-4xl mx-auto px-4 -mt-16 relative z-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Status Card */}
          <div className="md:col-span-2 bg-white dark:bg-gray-800 rounded-[2.5rem] shadow-2xl border border-gray-100 dark:border-white/5 p-8 flex flex-col md:flex-row items-center gap-8">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center text-primary">
                <Clock size={40} className="animate-pulse" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-emerald-500 rounded-full border-4 border-white dark:border-gray-800 flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full animate-ping" />
              </div>
            </div>
            <div className="text-center md:text-left space-y-2">
              <h3 className="text-2xl font-black text-gray-900 dark:text-white font-tiro">রেজাল্ট স্ট্যাটাস: <span className="text-primary">অপেক্ষমান</span></h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm font-medium font-tiro leading-relaxed">
                গুচ্ছ কর্তৃপক্ষ আজ ফলাফল প্রকাশের চূড়ান্ত প্রস্তুতি নিচ্ছে। রেজাল্ট সার্ভারে আপলোড হওয়া মাত্রই এখানে চেক করার লিঙ্ক দেওয়া হবে।
              </p>
              <div className="flex items-center justify-center md:justify-start gap-2 text-emerald-500 text-xs font-black uppercase tracking-wider pt-2">
                <Zap size={14} fill="currentColor" /> Live Monitoring Active
              </div>
            </div>
          </div>

          {/* Telegram Card */}
          <a 
            href="https://t.me/porikkhangon" 
            target="_blank" 
            rel="noopener noreferrer"
            className="bg-gradient-to-br from-[#0088cc] to-[#00a2ed] rounded-[2.5rem] p-8 text-white shadow-xl shadow-blue-500/20 flex flex-col items-center justify-center text-center space-y-4 group hover:scale-[1.02] transition-all"
          >
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center group-hover:rotate-12 transition-transform">
              <Send size={32} fill="white" />
            </div>
            <div>
              <h4 className="text-xl font-black">Telegram Channel</h4>
              <p className="text-white/80 text-xs font-bold mt-1">সবার আগে রেজাল্ট লিঙ্ক পেতে জয়েন করুন</p>
            </div>
            <div className="px-6 py-2 bg-white text-[#0088cc] rounded-full text-xs font-black flex items-center gap-2">
              JOIN NOW <ExternalLink size={12} />
            </div>
          </a>
        </div>
      </div>

      {/* Telegram Suggestion Modal */}
      <AnimatePresence>
        {showTelegramModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowTelegramModal(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-md bg-white dark:bg-gray-800 rounded-[2.5rem] p-8 shadow-2xl overflow-hidden"
            >
              <button 
                onClick={() => setShowTelegramModal(false)}
                className="absolute top-6 right-6 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors"
              >
                <X size={24} />
              </button>

              <div className="flex flex-col items-center text-center space-y-6">
                <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-500 rounded-3xl flex items-center justify-center shadow-inner">
                  <CheckCircle2 size={40} />
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-2xl font-black text-gray-900 dark:text-white font-tiro">সাবস্ক্রাইব সফল হয়েছে!</h3>
                  <p className="text-gray-500 dark:text-gray-400 text-sm font-bold font-tiro leading-relaxed">
                    রেজাল্ট প্রকাশের সময় অতিরিক্ত ট্রাফিকের কারণে ব্রাউজার নোটিফিকেশন পৌঁছাতে কিছুটা দেরি হতে পারে। তাই দ্রুততম আপডেট ও নোটিফিকেশন পেতে আমাদের টেলিগ্রাম চ্যানেলে যুক্ত থাকার পরামর্শ দিচ্ছি।
                  </p>
                </div>

                <button 
                  onClick={() => setShowTelegramModal(false)}
                  className="w-full py-4 bg-primary text-white rounded-2xl font-black shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
                >
                  ঠিক আছে
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 4. Stats & Info */}
      <div className="max-w-4xl mx-auto px-4 mt-12 space-y-12">
        
        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'মোট পরীক্ষার্থী', value: '১,৬৬,১৬২ জন', icon: Users, color: 'text-blue-500 bg-blue-50' },
            { label: 'মোট আসন', value: '৮৫০০টি', icon: Trophy, color: 'text-orange-700 dark:text-orange-400 bg-orange-50' },
            { label: 'আসন প্রতি লড়ছে', value: '২০জন', icon: TrendingUp, color: 'text-emerald-500 bg-emerald-50' },
            { label: 'বিশ্ববিদ্যালয় সংখ্যা', value: '২০টি', icon: Zap, color: 'text-purple-500 bg-purple-50' },
          ].map((stat, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-white/5 text-center space-y-2 shadow-sm">
              <div className={`w-10 h-10 ${stat.color} dark:bg-opacity-10 rounded-xl flex items-center justify-center mx-auto mb-2`}>
                <stat.icon size={20} />
              </div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{stat.label}</p>
              <p className="text-xl font-black text-gray-900 dark:text-white font-tiro">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Info Section */}
        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <h2 className="text-3xl font-black text-gray-900 dark:text-white font-tiro flex items-center gap-3">
              <AlertCircle className="text-primary" /> গুরুত্বপূর্ণ তথ্য
            </h2>
            <div className="space-y-4">
              {[
                "ফলাফল দেখার জন্য আপনার Applicant Id ও পাসওয়ার্ড প্রয়োজন হবে।",
                "অফিসিয়াল ওয়েবসাইট (gstadmission.ac.bd) থেকে রেজাল্ট দেখা যাবে।",
                "সার্ভার জ্যাম থাকলে আমাদের টেলিগ্রাম চ্যানেলের অল্টারনেটিভ লিঙ্ক ব্যবহার করুন।",
                "রেজাল্ট পরবর্তী ভর্তি প্রক্রিয়া ও চয়েস লিস্ট নিয়ে আমাদের বিশেষ গাইডলাইন আসবে।"
              ].map((text, i) => (
                <div key={i} className="flex gap-4 p-4 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm">
                  <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-black shrink-0">{i+1}</div>
                  <p className="text-sm font-bold text-gray-600 dark:text-gray-300 font-tiro leading-relaxed">{text}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <h2 className="text-3xl font-black text-gray-900 dark:text-white font-tiro flex items-center gap-3">
              <Facebook className="text-blue-600" /> আমাদের সাথে যুক্ত হোন
            </h2>
            <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] p-8 border border-gray-100 dark:border-white/5 shadow-sm space-y-6">
              <p className="text-gray-500 dark:text-gray-400 text-sm font-medium font-tiro leading-relaxed">
                ভর্তি পরীক্ষার সব আপডেট, সাজেশন এবং গাইডলাইন সবার আগে পেতে আমাদের ফেসবুক পেজ ও গ্রুপে যুক্ত থাকুন। এই কমিউনিটি আপনাকে সঠিক সিদ্ধান্ত নিতে সাহায্য করবে।
              </p>
              <div className="space-y-3">
                <a 
                  href="https://fb.com/porikkhangon" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-full py-4 bg-[#1877F2] text-white rounded-2xl font-black flex items-center justify-center gap-3 shadow-lg shadow-blue-500/20 active:scale-95 transition-all"
                >
                  <Facebook size={20} fill="white" /> Facebook Page
                </a>
                <a 
                  href="https://facebook.com/groups/your_group" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-full py-4 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-2xl font-black flex items-center justify-center gap-3 active:scale-95 transition-all"
                >
                  <Users size={20} /> Facebook Group
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 5. GST Question Section (Moved Lower) */}
      <div className="max-w-4xl mx-auto px-4 mt-12">
        <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] p-8 md:p-12 border border-gray-100 dark:border-white/5 shadow-xl flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-4 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-orange-100 dark:bg-orange-900/30 text-primary text-[10px] font-black uppercase tracking-widest rounded-full">
              <Zap size={14} fill="currentColor" /> Question Bank
            </div>
            <h2 className="text-3xl font-black text-gray-900 dark:text-white font-tiro">GST ক ইউনিট প্রশ্ন ২০২৫-২৬</h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm font-medium font-tiro leading-relaxed max-w-md">
              ভর্তি পরীক্ষার প্রশ্ন ও সমাধান এখনই দেখে নিন। আপনার উত্তরগুলো মিলিয়ে নিন এবং সম্ভাব্য স্কোর যাচাই করুন।
            </p>
          </div>
          <button 
            onClick={() => navigate('/gst-a-unit-2025')}
            className="w-full md:w-auto px-10 py-5 bg-gray-900 dark:bg-white dark:text-gray-900 text-white rounded-2xl font-black flex items-center justify-center gap-3 shadow-2xl hover:scale-105 active:scale-95 transition-all"
          >
            প্রশ্ন ও সমাধান দেখুন <ExternalLink size={20} />
          </button>
        </div>
      </div>

      {/* 5. Footer Message */}
      <div className="max-w-4xl mx-auto px-4 mt-20 text-center">
        <div className="p-12 bg-primary/5 rounded-[3rem] border border-primary/10 space-y-4">
          <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mx-auto">
            <Sparkles size={32} />
          </div>
          <h2 className="text-2xl font-black text-gray-900 dark:text-white font-tiro">শুভকামনা রইলো!</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm font-medium font-tiro max-w-md mx-auto">
            আমরা জানি আপনি অনেক পরিশ্রম করেছেন। আপনার কাঙ্ক্ষিত ফলাফল অর্জিত হোক—এই দোয়াই করি। রেজাল্ট পরবর্তী সব সাপোর্টে আমরা আপনার পাশেই আছি।
          </p>
        </div>
      </div>

      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 30s linear infinite;
        }
        .animate-spin-slow {
          animation: spin 6s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default GSTResultPage;
