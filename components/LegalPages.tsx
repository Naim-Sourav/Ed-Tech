import React, { useEffect } from 'react';
import { ArrowLeft, Shield, FileText, RefreshCcw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PageLayout = ({ title, icon: Icon, children, lastUpdated }: { title: string, icon: any, children: React.ReactNode, lastUpdated: string }) => {
    const navigate = useNavigate();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-black text-slate-900 dark:text-gray-100 pb-20">
            {/* Header */}
            <div className="sticky top-0 z-30 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl border-b border-gray-200 dark:border-white/10 px-4 h-16 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    {/* Direct visitors (Google / share links) have no history — send them home. */}
                    <button onClick={() => { if (window.history.length > 1) navigate(-1); else navigate('/'); }} className="p-2 -ml-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 transition-colors" aria-label="পেছনে যান">
                        <ArrowLeft size={20} className="text-gray-700 dark:text-gray-300" />
                    </button>
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Icon size={18} className="text-primary" />
                        </div>
                        <h1 className="text-lg font-bold text-gray-900 dark:text-white font-display">{title}</h1>
                    </div>
                </div>
            </div>

            <div className="max-w-3xl mx-auto px-4 py-8">
                <div className="bg-white dark:bg-zinc-900/50 border border-gray-200 dark:border-white/5 rounded-2xl p-6 md:p-10 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-12 opacity-[0.03] dark:opacity-[0.05] pointer-events-none">
                        <Icon size={120} />
                    </div>
                
                    <p className="text-[14px] md:text-[15px] font-medium text-gray-500 dark:text-gray-400 mb-8 border-b border-gray-100 dark:border-white/5 pb-4">
                        সর্বশেষ আপডেট: {lastUpdated}
                    </p>
                    
                    <div className="space-y-8 text-base md:text-[17px] leading-relaxed font-sans text-gray-700 dark:text-gray-300">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
};

// Reusable parts
const Section = ({ title, children }: { title: string, children: React.ReactNode }) => (
    <section>
        <h3 className="text-[17px] md:text-[19px] font-bold text-gray-900 dark:text-white mb-3">{title}</h3>
        <div className="space-y-4">
            {children}
        </div>
    </section>
);

const BulletList = ({ items }: { items: React.ReactNode[] }) => (
    <ul className="space-y-2 ml-4">
        {items.map((item, idx) => (
            <li key={idx} className="flex gap-2 relative">
                <span className="text-primary/60 mt-1.5 absolute -left-4 text-xs">●</span>
                <span>{item}</span>
            </li>
        ))}
    </ul>
);

export const PrivacyPolicy = () => {
    return (
        <PageLayout title="প্রাইভেসি পলিসি" icon={Shield} lastUpdated="১০ জুন, ২০২৬">
            <Section title="১. ভূমিকা">
                <p>আমাদের প্ল্যাটফর্মে আপনার স্বাগতম। আপনার ব্যক্তিগত তথ্যের গোপনীয়তা রক্ষা করা আমাদের অন্যতম প্রধান দায়িত্ব। এই প্রাইভেসি পলিসিতে ব্যাখ্যা করা হয়েছে আমরা কীভাবে আপনার তথ্য সংগ্রহ, ব্যবহার এবং সুরক্ষিত করি।</p>
            </Section>
            
            <Section title="২. আমরা কী ধরনের তথ্য সংগ্রহ করি">
                <BulletList items={[
                    <><strong className="font-semibold text-gray-900 dark:text-gray-200">ব্যক্তিগত তথ্য:</strong> আপনার নাম, ইমেইল অ্যাড্রেস, ফোন নম্বর।</>,
                    <><strong className="font-semibold text-gray-900 dark:text-gray-200">একাডেমিক তথ্য:</strong> আপনার শিক্ষাপ্রতিষ্ঠান, পরীক্ষার ফলাফল এবং লক্ষ্য।</>,
                    <><strong className="font-semibold text-gray-900 dark:text-gray-200">ব্যবহারকারীর কার্যকলাপ:</strong> অ্যাপে আপনার এক্সাম এবং প্র্যাকটিসের তথ্যাদি।</>
                ]} />
            </Section>

            <Section title="৩. আমরা কীভাবে আপনার তথ্য ব্যবহার করি">
                <p>আমরা আপনার তথ্য ব্যবহার করি:</p>
                <BulletList items={[
                    "আপনার জন্য কাস্টমাইজড প্রশ্ন এবং স্টাডি প্ল্যান তৈরি করতে।",
                    "আপনার এক্সাম পারফরম্যান্স অ্যানালাইসিস এবং রিপোর্ট প্রদান করতে।",
                    "প্ল্যাটফর্মের কারিগরি ত্রুটি সমাধান ও মানোন্নয়ন করতে।"
                ]} />
            </Section>

            <Section title="৪. তথ্য শেয়ারিং">
                <p>আমরা ব্যবহারকারীর কোনো ব্যক্তিগত তথ্য কোনো থার্ড-পার্টির কাছে বিক্রি করি না। শুধুমাত্র আইনি প্রয়োজনে অথবা সেবার মানন্নোয়নের জন্য বিশ্বস্ত থার্ড-পার্টি সার্ভিস প্রোভাইডারের সাথে তথ্য শেয়ার করা হতে পারে।</p>
            </Section>

            <Section title="৫. তথ্য সুরক্ষা">
                <p>আপনার অ্যাকাউন্ট ও তথ্য সুরক্ষিত রাখতে আমরা আধুনিক এনক্রিপশন এবং সিকিউরিটি প্রোটোকল ব্যবহার করি। তবে ইন্টারনেটের মাধ্যমে ডেটা ট্রান্সমিশন শতভাগ নিরাপদ নয়, তাই আমরা সম্পূর্ণ নিশ্চয়তা দিতে পারি না।</p>
            </Section>

            <Section title="৬. পলিসি পরিবর্তন">
                <p>আমরা প্রয়োজনে এই পলিসি পরিবর্তন বা আপডেট করার অধিকার সংরক্ষণ করি। কোনো বড় পরিবর্তন হলে তা অ্যাপ নোটিফিকেশন বা ইমেইলের মাধ্যমে জানানো হবে।</p>
            </Section>
        </PageLayout>
    );
};

export const TermsOfService = () => {
    return (
        <PageLayout title="শর্তাবলী" icon={FileText} lastUpdated="১০ জুন, ২০২৬">
            <Section title="১. সাধারণ শর্তাবলী">
                <p>এই অ্যাপটি ব্যবহার করার মাধ্যমে আপনি আমাদের উল্লেখিত সকল শর্তাবলীর সাথে একমত পোষণ করছেন। আপনি যদি কোনো শর্তের সাথে দ্বিমত পোষণ করেন, তবে অ্যাপটি ব্যবহার থেকে বিরত থাকুন।</p>
            </Section>

            <Section title="২. ব্যবহারকারীর দায়িত্ব">
                <BulletList items={[
                    "অ্যাপে সঠিক ও বর্তমান তথ্য প্রদান করা আপনার দায়িত্ব।",
                    "অ্যাকাউন্টের পাসওয়ার্ড এবং অন্যান্য নিরাপত্তা সংক্রান্ত তথ্যের গোপনীয়তা বজায় রাখতে আপনি বাধ্য।",
                    "অ্যাপের কোনো প্রকার অপব্যবহার, হ্যাকিং, অথবা স্প্যামিং করা সম্পূর্ণ বেআইনি।"
                ]} />
            </Section>

            <Section title="৩. কন্টেন্ট এবং কপিরাইট">
                <p>অ্যাপের সকল প্রশ্ন, উত্তর, ব্যাখ্যা, ডিজাইন, লোগো এবং টেক্সট আমাদের নিজস্ব বা লাইসেন্সকৃত সম্পত্তি। বিনা অনুমতিতে এর কোনো অংশ কপি, বিতরণ, বা বাণিজ্যিক উদ্দেশ্যে ব্যবহার করা আইনত দণ্ডনীয়।</p>
            </Section>

            <Section title="৪. সেবা পরিবর্তন বা বাতিল">
                <p>কর্তৃপক্ষ যেকোনো সময় পূর্ব নোটিশ ছাড়াই বা নোটিশ প্রদান করে কোনো সেবা পরিবর্তন, সাময়িক স্থগিত, বা সম্পূর্ণ বাতিল করার অধিকার সংরক্ষণ করে।</p>
            </Section>

            <Section title="৫. আইনি বাধ্যবাধকতা">
                <p>আমাদের সেবা ব্যবহারের কারণে সৃষ্ট কোনো প্রত্যক্ষ বা পরোক্ষ ক্ষতির জন্য কর্তৃপক্ষ দায়ী থাকবে না। যেকোনো আইনি অভিযোগ বা মতানৈক্য বাংলাদেশের প্রচলিত আইন অনুযায়ী মীমাংসা করা হবে।</p>
            </Section>
        </PageLayout>
    );
};

export const RefundPolicy = () => {
    return (
        <PageLayout title="রিফান্ড পলিসি" icon={RefreshCcw} lastUpdated="১০ জুন, ২০২৬">
            <Section title="১. রিফান্ডের যোগ্যতা">
                <p>আমরা সকল প্রিমিয়াম কোর্স এবং এক্সাম ব্যাচের ক্ষেত্রে নির্দিষ্ট মেয়াদের মধ্যে রিফান্ড পলিসি মেনে চলি। সাধারণত কোর্স ক্রয়ের প্রথম ৩ (তিন) দিনের মধ্যে রিফান্ড আবেদন করা যাবে, যদি আপনি কোর্সের ৫% এর বেশি সম্পূর্ণ না করে থাকেন।</p>
            </Section>

            <Section title="২. যেসব ক্ষেত্রে রিফান্ড প্রযোজ্য নয়">
                <BulletList items={[
                    "কোর্স বা ব্যাচ ক্রয়ের ৩ দিন অতিবাহিত হয়ে গেলে।",
                    "লাইভ ক্লাস, মক টেস্ট, পেপার ফাইনাল ইত্যাদি সিঙ্গেল টাইম সার্ভিসের ক্ষেত্রে।",
                    "অ্যাকাউন্টের অপব্যবহার বা শর্তাবলী ভঙ্গের কারণে অ্যাকাউন্ট সাসপেন্ড হলে।"
                ]} />
            </Section>

            <Section title="৩. রিফান্ড প্রক্রিয়া">
                <p>রিফান্ড পেতে হলে আমাদের সাপোর্ট ইমেইলে অথবা পেইজে সরাসরি যোগাযোগ করতে হবে। রিফান্ড আবেদন গ্রহণ করার পর তা রিভিউ করা হবে এবং যদি শর্ত পূরণ হয়, তবে ৫-৭ কর্মদিবসের মধ্যে একই পেমেন্ট মেথডে (বিকাশ/নগদ/কার্ড) টাকা ফেরত দেয়া হবে।</p>
            </Section>

            <Section title="৪. পরিবর্তন এবং বাতিলকরণ">
                <p>যেকোনো সময় রিফান্ড পলিসিতে পরিবর্তন আনার অধিকার কর্তৃপক্ষ সংরক্ষণ করে। পরিবর্তিত পলিসি এই পেজে আপডেট করা হবে।</p>
            </Section>
        </PageLayout>
    );
};
