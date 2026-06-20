import React, { useState, useEffect } from 'react';
import { fetchAdmissionTagsAPI, mapTagsToCategoryAPI } from '../services/api';
import { Layers, Search, Save, CheckCircle2, RotateCw } from 'lucide-react';
import { useToast } from './Toast';

const MAIN_CATEGORIES = [
    { id: 'medical', name: 'মেডিকেল ও ডেন্টাল (Medical & Dental)' },
    { id: 'varsity', name: 'বিশ্ববিদ্যালয় (Varsity)' },
    { id: 'engineering', name: 'ইঞ্জিনিয়ারিং (Engineering)' },
    { id: 'krishi', name: 'কৃষি গুচ্ছ (Krishi)' },
    { id: 'others', name: 'অন্যান্য (Others)' }
];

const AdminAdmissionTagMapper: React.FC = () => {
    const [tags, setTags] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());
    const [selectedCategory, setSelectedCategory] = useState<string>('');
    const { showToast } = useToast();

    // Fetch tags on mount
    const fetchTags = async () => {
        setLoading(true);
        try {
            const data = await fetchAdmissionTagsAPI();
            if (data && data.tags) {
                setTags(data.tags);
            }
        } catch (e) {
            showToast('ট্যাগ লোড করতে সমস্যা হয়েছে', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTags();
    }, []);

    const filteredTags = tags.filter(t => t.toLowerCase().includes(searchTerm.toLowerCase()));

    const toggleTagSelection = (tag: string) => {
        const newSet = new Set(selectedTags);
        if (newSet.has(tag)) {
            newSet.delete(tag);
        } else {
            newSet.add(tag);
        }
        setSelectedTags(newSet);
    };

    const handleSelectAll = () => {
        if (selectedTags.size === filteredTags.length) {
            setSelectedTags(new Set());
        } else {
            setSelectedTags(new Set(filteredTags));
        }
    };

    const handleAssignTags = async () => {
        if (!selectedCategory) {
            showToast('দয়া করে একটি ক্যাটাগরি নির্বাচন করুন', 'warning');
            return;
        }
        if (selectedTags.size === 0) {
            showToast('দয়া করে অন্তত একটি ট্যাগ নির্বাচন করুন', 'warning');
            return;
        }

        setLoading(true);
        try {
            const res = await mapTagsToCategoryAPI(selectedCategory, Array.from(selectedTags));
            if (res.success) {
                showToast(`সফলভাবে ${res.modifiedCount} টি প্রশ্ন আপডেট করা হয়েছে`, 'success');
                setSelectedTags(new Set());
                fetchTags(); // Fetch again to refresh the list and remove mapped tags
            }
        } catch (e) {
            showToast('আপডেট করতে সমস্যা হয়েছে', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white dark:bg-zinc-950 rounded-2xl border border-gray-200 dark:border-zinc-800 p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <div>
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <Layers className="text-primary" />
                        অ্যাডমিশন ক্যাটাগরি ম্যাপিং
                    </h2>
                    <p className="text-sm text-gray-500 font-tiro mt-1">
                        এডমিশন প্রশ্নগুলো সুশৃঙ্খলভাবে ক্যাটাগরি অনুযায়ী সাজাতে ট্যাগ ম্যাপ করুন। 
                    </p>
                </div>
                <button
                    onClick={fetchTags}
                    disabled={loading}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 rounded-lg flex items-center gap-2 text-sm transition font-medium"
                >
                    <RotateCw size={16} className={loading ? 'animate-spin' : ''} />
                    রিফ্রেশ
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left side: Category & Actions */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-slate-50 dark:bg-zinc-900/50 p-4 rounded-xl border border-slate-200 dark:border-zinc-800">
                        <label className="block text-sm font-bold text-slate-700 dark:text-zinc-300 mb-3">
                            ক্যাটাগরি নির্বাচন করুন
                        </label>
                        <div className="flex flex-col gap-2">
                            {MAIN_CATEGORIES.map(cat => (
                                <button
                                    key={cat.id}
                                    onClick={() => setSelectedCategory(cat.id)}
                                    className={`p-3 text-left rounded-lg text-sm transition-all border ${
                                        selectedCategory === cat.id
                                            ? 'bg-primary/10 border-primary text-primary font-bold'
                                            : 'bg-white dark:bg-zinc-950 border-gray-200 dark:border-zinc-800 hover:border-gray-300'
                                    }`}
                                >
                                    {cat.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-900/30">
                        <h4 className="font-bold text-blue-800 dark:text-blue-300 flex items-center gap-2 mb-2 text-sm">
                            <CheckCircle2 size={16} />
                            সামারি (Summary)
                        </h4>
                        <ul className="text-sm text-blue-700 dark:text-blue-400 space-y-1 font-tiro">
                            <li>মোট ট্যাগ পাওয়া গেছে: <strong>{tags.length}</strong></li>
                            <li>বর্তমানে নির্বাচিত: <strong>{selectedTags.size}</strong></li>
                        </ul>
                        
                        <button
                            onClick={handleAssignTags}
                            disabled={loading || selectedTags.size === 0 || !selectedCategory}
                            className="mt-4 w-full bg-primary hover:bg-primary/90 text-white font-bold py-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition"
                        >
                            <Save size={18} />
                            ট্যাগগুলো সেভ করুন
                        </button>
                    </div>
                </div>

                {/* Right side: Tags Selection */}
                <div className="lg:col-span-2">
                    <div className="bg-slate-50 dark:bg-zinc-900/50 p-4 rounded-xl border border-slate-200 dark:border-zinc-800 h-[600px] flex flex-col">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    type="text"
                                    placeholder="ট্যাগ বা প্রতিষ্ঠানের নাম খুঁজুন..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition text-sm"
                                />
                            </div>
                            <button
                                onClick={handleSelectAll}
                                className="px-4 py-2.5 bg-white dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-900 rounded-lg text-sm font-medium transition whitespace-nowrap"
                            >
                                {selectedTags.size === filteredTags.length && filteredTags.length > 0 ? 'Deselect All' : 'Select All'}
                            </button>
                        </div>

                        {loading && tags.length === 0 ? (
                            <div className="flex-1 flex justify-center items-center">
                                <RotateCw className="animate-spin text-gray-400" size={24} />
                            </div>
                        ) : filteredTags.length === 0 ? (
                            <div className="flex-1 flex justify-center items-center text-gray-400 text-sm">
                                কোনো ট্যাগ পাওয়া যায়নি
                            </div>
                        ) : (
                            <div className="flex-1 overflow-y-auto overflow-x-hidden pr-2 custom-scrollbar">
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                    {filteredTags.map(tag => {
                                        const isSelected = selectedTags.has(tag);
                                        return (
                                            <button
                                                key={tag}
                                                onClick={() => toggleTagSelection(tag)}
                                                className={`p-2.5 rounded-lg border text-left text-sm transition-all duration-200 ${
                                                    isSelected
                                                        ? 'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/20 dark:border-blue-800/50 dark:text-blue-300 font-bold'
                                                        : 'bg-white border-gray-200 hover:border-blue-300 hover:bg-gray-50 dark:bg-zinc-950 dark:border-zinc-800 dark:hover:border-zinc-700'
                                                }`}
                                            >
                                                <div className="flex items-center gap-2">
                                                    <div className={`w-4 h-4 shrink-0 rounded flex items-center justify-center border ${
                                                        isSelected 
                                                        ? 'bg-blue-600 border-blue-600 text-white' 
                                                        : 'border-gray-300 dark:border-zinc-700'
                                                    }`}>
                                                        {isSelected && <CheckCircle2 size={12} strokeWidth={3} />}
                                                    </div>
                                                    <span className="truncate">{tag}</span>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminAdmissionTagMapper;
