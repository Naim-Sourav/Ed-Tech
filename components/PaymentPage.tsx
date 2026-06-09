
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ShieldCheck, ArrowLeft, Copy, CheckCircle, CreditCard, Smartphone, AlertCircle, Loader2, Lock, FileText, Check, Tag, X } from 'lucide-react';
import { useAdmin } from '../contexts/AdminContext';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from './Toast';

type PaymentMethod = 'BKASH' | 'NAGAD';

const PaymentPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { submitPaymentRequest } = useAdmin();
  const { currentUser } = useAuth();
  const { showToast } = useToast();

  // Item data passed from previous screen
  const { item, type } = location.state || {};

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('BKASH');
  const [senderNumber, setSenderNumber] = useState('');
  const [trxId, setTrxId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [copied, setCopied] = useState(false);

  // Coupon State
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [couponError, setCouponError] = useState('');

  // Redirect if no item data found (e.g. direct link access)
  useEffect(() => {
    if (!item) {
        showToast("কোনো কোর্স সিলেক্ট করা হয়নি", "warning");
        navigate('/courses');
    }
  }, [item, navigate, showToast]);

  if (!item) return null;

  const MERCHANT_NUMBER = "01622190454";
  const finalAmount = Math.max(0, item.price - discount);
  const isFree = finalAmount === 0;

  const handleCopyNumber = () => {
    navigator.clipboard.writeText(MERCHANT_NUMBER);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    showToast("নাম্বার কপি হয়েছে", "info");
  };

  const handleApplyCoupon = () => {
      setCouponError('');
      if (!couponCode.trim()) return;

      if (couponCode.toUpperCase() === 'PORARTABLEGST') {
          const discountAmount = Math.round(item.price * 0.20); // 20% Discount
          setDiscount(discountAmount);
          setAppliedCoupon('PORARTABLEGST');
          showToast("২০% ডিসকাউন্ট অ্যাপ্লাই করা হয়েছে!", "success");
      } else {
          setCouponError('দুঃখিত, কুপন কোডটি সঠিক নয়।');
          setDiscount(0);
          setAppliedCoupon(null);
      }
  };

  const handleRemoveCoupon = () => {
      setCouponCode('');
      setDiscount(0);
      setAppliedCoupon(null);
      setCouponError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    if (!isFree) {
        if (!trxId || !senderNumber) return;

        if (trxId.length < 6) {
            showToast("সঠিক TrxID প্রদান করুন", "warning");
            return;
        }

        if (senderNumber.length < 11) {
            showToast("সঠিক মোবাইল নাম্বার দিন", "warning");
            return;
        }
    }

    setIsSubmitting(true);
    
    try {
      await submitPaymentRequest({
        userId: currentUser.uid,
        userName: currentUser.displayName || 'Unknown',
        userEmail: currentUser.email || '',
        courseId: item.id,
        courseTitle: item.title,
        amount: finalAmount, // Sending the discounted amount
        trxId: isFree ? 'FREE_ENROLL' : trxId,
        senderNumber: isFree ? 'FREE' : senderNumber
      });
      setIsSuccess(true);
      // Removed window.scrollTo because container scrolls now, handled by layout
    } catch (error: any) {
      console.error("Submission failed:", error);
      showToast(error.message || "পেমেন্ট সাবমিট করতে সমস্যা হয়েছে।", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Success View ---
  if (isSuccess) {
      return (
          <div className="h-full overflow-y-auto bg-gray-50 dark:bg-black flex items-center justify-center p-4">
              <div className="bg-white dark:bg-zinc-900 rounded-3xl p-8 max-w-md w-full text-center shadow-xl border border-gray-100 dark:border-zinc-800 animate-in zoom-in duration-300 my-auto">
                  <div className="w-24 h-24 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                      <CheckCircle size={48} className="text-green-600 dark:text-green-400" strokeWidth={3} />
                  </div>
                  <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-2">{isFree ? 'এনরোলমেন্ট সফল!' : 'পেমেন্ট রিকোয়েস্ট সফল!'}</h2>
                  <p className="text-gray-500 dark:text-gray-400 text-sm mb-8 leading-relaxed">
                      {isFree 
                        ? 'আপনার ফ্রি এনরোলমেন্ট সম্পন্ন হয়েছে। ড্যাশবোর্ড থেকে কোর্সটি এক্সেস করতে পারবেন।'
                        : 'আপনার পেমেন্ট তথ্য আমাদের কাছে জমা হয়েছে। অ্যাডমিন ভেরিফিকেশনের পর (সর্বোচ্চ ২৪ ঘণ্টা) আপনার কোর্সে এক্সেস চালু হয়ে যাবে।'}
                  </p>
                  <div className="space-y-3">
                      <button onClick={() => navigate('/dashboard')} className="w-full py-3.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold rounded-xl shadow-lg transition-transform active:scale-95">
                          ড্যাশবোর্ডে ফিরে যান
                      </button>
                      <button onClick={() => navigate('/courses')} className="w-full py-3.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-white font-bold rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                          অন্যান্য কোর্স দেখুন
                      </button>
                  </div>
              </div>
          </div>
      )
  }

  return (
    <div className="h-full overflow-y-auto bg-gray-50 dark:bg-black transition-colors pb-20">
      
      {/* Navbar Simple */}
      <div className="bg-white dark:bg-zinc-900 border-b border-gray-200 dark:border-zinc-800 px-4 py-4 sticky top-0 z-30 shadow-sm">
          <div className="max-w-5xl mx-auto flex items-center gap-4">
              <button 
                  onClick={() => {
                      if (window.history.length > 1) {
                          navigate(-1);
                      } else {
                          navigate('/dashboard', { replace: true });
                      }
                  }} 
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
              >
                  <ArrowLeft size={24} className="text-gray-600 dark:text-gray-300"/>
              </button>
              <h1 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <ShieldCheck size={20} className="text-green-600"/> {isFree ? 'ফ্রি এনরোলমেন্ট' : 'সিকিউর চেকআউট'}
              </h1>
          </div>
      </div>

      <div className="max-w-5xl mx-auto p-4 md:p-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
              
              {/* Left Column: Order Summary */}
              <div className="lg:col-span-1 order-2 lg:order-1">
                  <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 border border-gray-200 dark:border-zinc-800 shadow-sm sticky top-24">
                      <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">অর্ডার সামারি</h3>
                      
                      <div className="flex gap-4 mb-6">
                          <div className="w-16 h-16 bg-orange-50 dark:bg-orange-900/20 rounded-xl flex items-center justify-center text-orange-600 dark:text-orange-400">
                              <FileText size={24}/>
                          </div>
                          <div className="flex-1">
                              <h4 className="font-bold text-gray-900 dark:text-white line-clamp-2">{item.title}</h4>
                              <span className="inline-block mt-1 px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-[12px] font-bold rounded">
                                  {type === 'PACK' ? 'Exam Pack' : 'Course'}
                              </span>
                          </div>
                      </div>

                      {/* Coupon Code Section - Hide if already free */}
                      {!isFree && (
                      <div className="mb-6">
                          <label className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-2 block">কুপন কোড (যদি থাকে)</label>
                          {!appliedCoupon ? (
                              <div className="flex gap-2">
                                  <input 
                                      type="text" 
                                      value={couponCode}
                                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                                      placeholder="COUPON CODE"
                                      className="flex-1 px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:border-primary dark:text-white uppercase"
                                  />
                                  <button 
                                      onClick={handleApplyCoupon}
                                      disabled={!couponCode}
                                      className="px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-xs font-bold rounded-lg disabled:opacity-50 hover:bg-black transition-colors"
                                  >
                                      Apply
                                  </button>
                              </div>
                          ) : (
                              <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                                  <div className="flex items-center gap-2 text-green-700 dark:text-green-400 text-sm font-bold">
                                      <Tag size={14}/> {appliedCoupon}
                                  </div>
                                  <button onClick={handleRemoveCoupon} className="text-gray-400 hover:text-red-500"><X size={16}/></button>
                              </div>
                          )}
                          {couponError && <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1"><AlertCircle size={12}/> {couponError}</p>}
                      </div>
                      )}

                      <div className="border-t border-gray-100 dark:border-zinc-800 pt-4 space-y-2">
                          <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400">
                              <span>কোর্স ফি</span>
                              <span>{item.price === 0 ? 'FREE' : `৳${item.price}`}</span>
                          </div>
                          {discount > 0 && (
                              <div className="flex justify-between text-sm font-bold text-green-600 dark:text-green-400">
                                  <span>কুপন ছাড় (২০%)</span>
                                  <span>-৳{discount}</span>
                              </div>
                          )}
                          <div className="flex justify-between items-center pt-2 mt-2 border-t border-gray-100 dark:border-zinc-800">
                              <span className="font-bold text-gray-800 dark:text-white">মোট প্রদেয়</span>
                              <span className="text-xl font-black text-primary dark:text-orange-400">
                                  {finalAmount === 0 ? 'FREE' : `৳${finalAmount}`}
                              </span>
                          </div>
                      </div>

                      <div className="mt-6 flex items-center justify-center gap-2 text-[12px] text-gray-400 bg-gray-50 dark:bg-gray-700/50 p-2 rounded-lg">
                          <Lock size={12}/> পেমেন্ট তথ্য ১০০% নিরাপদ ও এনক্রিপ্টেড
                      </div>
                  </div>
              </div>

              {/* Right Column: Payment Process */}
              <div className="lg:col-span-2 order-1 lg:order-2 space-y-6">
                  
                  {/* Step 1 & 2: Show only if not free */}
                  {!isFree && (
                  <>
                  {/* Step 1: Method Selection */}
                  <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 border border-gray-200 dark:border-zinc-800 shadow-sm">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 flex items-center justify-center text-xs">১</span>
                          পেমেন্ট মেথড নির্বাচন করুন
                      </h3>
                      <div className="grid grid-cols-2 gap-4 max-w-md mx-auto md:mx-0">
                          <button 
                              onClick={() => setPaymentMethod('BKASH')}
                              className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${paymentMethod === 'BKASH' ? 'border-[#e2136e] bg-[#e2136e]/5 shadow-sm' : 'border-gray-100 dark:border-zinc-800 hover:border-gray-300'}`}
                          >
                              <img src="https://freelogopng.com/images/all_img/1656227518bkash-logo-png.png" alt="bKash" className="h-10 object-contain"/>
                              <span className={`text-xs font-bold ${paymentMethod === 'BKASH' ? 'text-[#e2136e]' : 'text-gray-500'}`}>bKash</span>
                          </button>
                          <button 
                              onClick={() => setPaymentMethod('NAGAD')}
                              className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${paymentMethod === 'NAGAD' ? 'border-[#ec1c24] bg-[#ec1c24]/5 shadow-sm' : 'border-gray-100 dark:border-zinc-800 hover:border-gray-300'}`}
                          >
                              <img src="https://freelogopng.com/images/all_img/1679248787nagad-logo.png" alt="Nagad" className="h-10 object-contain"/>
                              <span className={`text-xs font-bold ${paymentMethod === 'NAGAD' ? 'text-[#ec1c24]' : 'text-gray-500'}`}>Nagad</span>
                          </button>
                      </div>
                  </div>

                  {/* Step 2: Payment Instructions */}
                  <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 border border-gray-200 dark:border-zinc-800 shadow-sm relative overflow-hidden">
                      <div className={`absolute top-0 left-0 w-1 h-full ${paymentMethod === 'BKASH' ? 'bg-[#e2136e]' : 'bg-[#ec1c24]'}`}></div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 flex items-center justify-center text-xs">২</span>
                          টাকা পাঠানোর নিয়ম
                      </h3>
                      
                      <div className="space-y-4">
                          <div className="flex items-center justify-between bg-gray-50 dark:bg-black p-4 rounded-xl border border-gray-200 dark:border-zinc-800">
                              <div>
                                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">মার্চেন্ট নাম্বার ({paymentMethod})</p>
                                  <p className="text-xl font-mono font-bold text-gray-800 dark:text-white tracking-wider">{MERCHANT_NUMBER}</p>
                              </div>
                              <button onClick={handleCopyNumber} className={`p-2.5 rounded-lg transition-colors ${copied ? 'bg-green-100 text-green-600' : 'bg-white dark:bg-zinc-900 text-gray-500 hover:text-primary shadow-sm border border-gray-200 dark:border-zinc-800'}`}>
                                  {copied ? <Check size={20}/> : <Copy size={20}/>}
                              </button>
                          </div>

                          <div className="text-sm text-gray-600 dark:text-gray-300 space-y-2 pl-2">
                              <p>১. আপনার {paymentMethod} অ্যাপে যান।</p>
                              <p>২. <span className="font-bold bg-gray-100 dark:bg-gray-700 px-1 rounded">Send Money</span> অপশনটি সিলেক্ট করুন।</p>
                              <p>৩. প্রাপক নাম্বারে উপরের নাম্বারটি দিন।</p>
                              <p>৪. টাকার পরিমাণ <span className="font-bold text-gray-900 dark:text-white">৳{finalAmount}</span> লিখুন।</p>
                              <p>৫. পেমেন্ট সম্পন্ন হলে ট্রানজেকশন আইডি (TrxID) টি কপি করুন।</p>
                          </div>
                      </div>
                  </div>
                  </>
                  )}

                  {/* Step 3: Verification Form / Confirmation */}
                  <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 border border-gray-200 dark:border-zinc-800 shadow-sm">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 flex items-center justify-center text-xs">{isFree ? '১' : '৩'}</span>
                          {isFree ? 'কনফার্মেশন' : 'তথ্য দিন'}
                      </h3>

                      <form onSubmit={handleSubmit} className="space-y-4">
                          {!isFree && (
                          <>
                          <div>
                              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-2">যে নাম্বার থেকে টাকা পাঠিয়েছেন</label>
                              <div className="relative">
                                  <Smartphone size={18} className="absolute left-3 top-3.5 text-gray-400"/>
                                  <input 
                                      required
                                      type="tel" 
                                      placeholder="01XXXXXXXXX"
                                      value={senderNumber}
                                      onChange={(e) => setSenderNumber(e.target.value)}
                                      className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-black border border-gray-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary dark:text-white font-medium"
                                  />
                              </div>
                          </div>
                          <div>
                              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-2">ট্রানজেকশন আইডি (TrxID)</label>
                              <div className="relative">
                                  <CreditCard size={18} className="absolute left-3 top-3.5 text-gray-400"/>
                                  <input 
                                      required
                                      type="text" 
                                      placeholder="Example: 9H7XXXXX"
                                      value={trxId}
                                      onChange={(e) => setTrxId(e.target.value.toUpperCase())}
                                      className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-black border border-gray-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary dark:text-white font-mono uppercase"
                                  />
                              </div>
                          </div>
                          </>
                          )}

                          <div className="pt-4">
                              <button 
                                  type="submit" 
                                  disabled={isSubmitting}
                                  className={`w-full py-4 rounded-xl font-bold text-white text-lg shadow-xl transition-all active:scale-95 flex items-center justify-center gap-2 ${isFree ? 'bg-green-600 hover:bg-green-700' : (paymentMethod === 'BKASH' ? 'bg-[#e2136e] hover:bg-[#c1105e] shadow-[#e2136e]/30' : 'bg-[#ec1c24] hover:bg-[#c4161d] shadow-[#ec1c24]/30')}`}
                              >
                                  {isSubmitting ? <Loader2 className="animate-spin" /> : (isFree ? 'ফ্রি এনরোল করুন' : 'পেমেন্ট যাচাই করুন')}
                              </button>
                              {!isFree && (
                                <p className="text-center text-xs text-gray-400 mt-3">
                                    ভুল তথ্য দিলে ভেরিফিকেশনে বিলম্ব হতে পারে।
                                </p>
                              )}
                          </div>
                      </form>
                  </div>

              </div>
          </div>
      </div>
    </div>
  );
};

export default PaymentPage;
