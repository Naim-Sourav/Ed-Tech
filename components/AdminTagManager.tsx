import React, { useState, useEffect } from 'react';
import { db } from '../services/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { fetchAdminTagsAPI } from '../services/api';
import { useToast } from './Toast';
import { Loader2, Plus, X, Bookmark, Tags } from 'lucide-react';

export default function AdminTagManager() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [availableTags, setAvailableTags] = useState<string[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());
    
    const [groups, setGroups] = useState({
        medical: [] as string[],
        varsityKa: [] as string[],
        engineering: [] as string[]
    });

    const { showToast } = useToast();

    useEffect(() => {
        const fetchData = async () => {
            try {
                // 1. Fetch existing settings from Firestore
                const settingsRef = doc(db, 'admin_settings', 'admission_tags');
                const settingsSnap = await getDoc(settingsRef);
                
                if (settingsSnap.exists()) {
                    const data = settingsSnap.data();
                    setGroups({
                        medical: data.medical || [],
                        varsityKa: data.varsityKa || [],
                        engineering: data.engineering || []
                    });
                }

                // 2. Scan DB for unique tags
                const tagsData = await fetchAdminTagsAPI();
                const uniqueRefs = new Set<string>();
                
                const processTag = (t: string) => {
                    if (!t) return;
                    const parts = t.split(/[,/]/); // Split by comma or slash
                    parts.forEach(p => {
                        let baseTag = p.replace(/[0-9-—০-৯]/g, '').replace(/Unit/gi, '').replace('ইউনিট', '').trim();
                        // Remove all unwanted quotes
                        baseTag = baseTag.replace(/['"]/g, '').trim();

                        if (!baseTag || baseTag.length <= 1) return;
                        
                        // Filters for "Academic" and "Main Book" etc.
                        const lowerTag = baseTag.toLowerCase();
                        
                        // Board short codes
                        const boardCodes = ['db', 'cb', 'rb', 'jb', 'sb', 'bb', 'dinb', 'mb', 'ctgb', 'bmet'];
                        if (boardCodes.includes(lowerTag.trim())) {
                            return;
                        }

                        if (
                            lowerTag.includes('board') || 
                            lowerTag.includes('বোর্ড') || 
                            lowerTag.includes('school') ||
                            lowerTag.includes('স্কুল') ||
                            lowerTag.includes('মাদরাসা') ||
                            lowerTag.includes('মাদ্রাসা') ||
                            lowerTag.includes('college') ||
                            lowerTag.includes('কলেজ') ||
                            lowerTag.includes('একাডেমিক') ||
                            lowerTag.includes('academic') ||
                            lowerTag.includes('main book') ||
                            lowerTag.includes('মেইন বুক') ||
                            lowerTag.includes('darikoma') ||
                            lowerTag.includes('দাঁড়িকমা') ||
                            lowerTag.includes('paper') ||
                            lowerTag.includes('পত্র') ||
                            lowerTag.includes('অধ্যায়') ||
                            lowerTag.includes('chapter') ||
                            lowerTag.includes('বিষয়') ||
                            lowerTag.includes('subject') ||
                            lowerTag.includes('hasan') ||
                            lowerTag.includes('হাসান') ||
                            lowerTag.includes('azmal') ||
                            lowerTag.includes('আজমল') ||
                            lowerTag.includes('kabir') ||
                            lowerTag.includes('কবির') ||
                            lowerTag.includes('hazari') ||
                            lowerTag.includes('হাজারী') ||
                            lowerTag.includes('nag') ||
                            lowerTag.includes('নাগ') ||
                            lowerTag.includes('guha') ||
                            lowerTag.includes('গুহ') ||
                            lowerTag.includes('topon') ||
                            lowerTag.includes('তপন') ||
                            lowerTag.includes('gias') ||
                            lowerTag.includes('গিয়াস') ||
                            lowerTag.includes('writer') ||
                            lowerTag.includes('author') ||
                            lowerTag.includes('al mubin') ||
                            lowerTag.includes('mubin')
                        ) {
                            return; // Skip academic / non-admission tags
                        }

                        uniqueRefs.add(baseTag);
                    });
                };

                (tagsData.refs || []).forEach(processTag);
                (tagsData.targets || []).forEach(processTag);
                (tagsData.tags || []).forEach(processTag);

                setAvailableTags(Array.from(uniqueRefs).sort());
            } catch (error) {
                console.error("Failed to load tags data", error);
                showToast("Failed to load tags", "error");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleSave = async () => {
        setSaving(true);
        try {
            await setDoc(doc(db, 'admin_settings', 'admission_tags'), {
                medical: groups.medical,
                varsityKa: groups.varsityKa,
                engineering: groups.engineering,
                updatedAt: new Date()
            }, { merge: true });
            
            showToast("Tag settings saved successfully", "success");
        } catch (error) {
            console.error("Failed to save settings", error);
            showToast("Failed to save settings", "error");
        } finally {
            setSaving(false);
        }
    };

    const addTagsToGroup = (tagsToAdd: string[], groupKey: keyof typeof groups) => {
        setGroups(prev => {
            const newGroup = [...prev[groupKey]];
            let changed = false;
            tagsToAdd.forEach(tag => {
                if (!newGroup.includes(tag)) {
                    newGroup.push(tag);
                    changed = true;
                }
            });
            if (!changed) return prev;
            return {
                ...prev,
                [groupKey]: newGroup
            };
        });
        setSelectedTags(new Set()); // clear selection after adding
    };

    const toggleSelectTag = (tag: string) => {
        const newSet = new Set(selectedTags);
        if (newSet.has(tag)) newSet.delete(tag);
        else newSet.add(tag);
        setSelectedTags(newSet);
    };

    const removeTagFromGroup = (tag: string, groupKey: keyof typeof groups) => {
        setGroups(prev => ({
            ...prev,
            [groupKey]: prev[groupKey].filter(t => t !== tag)
        }));
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64 bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800">
                <Loader2 className="animate-spin text-primary" size={32} />
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-sm p-6 md:p-10 animate-in fade-in">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <Tags size={24} className="text-primary" />
                        Admission Tag Mapping
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">Categorize university tags into Medical, Varsity Ka, and Engineering sections.</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="px-6 py-2 bg-primary hover:bg-orange-600 text-white font-bold rounded-xl shadow-lg shadow-orange-500/20 transition-all flex items-center gap-2"
                >
                    {saving ? <Loader2 size={16} className="animate-spin" /> : <Bookmark size={16} />}
                    Save Config
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Available Tags Column */}
                <div className="lg:col-span-1 bg-gray-50 dark:bg-zinc-800/50 p-4 rounded-2xl border border-gray-100 dark:border-zinc-800 flex flex-col h-full max-h-[700px]">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2 text-sm uppercase tracking-wider">
                            Tags ({availableTags.filter(t => t.toLowerCase().includes(searchQuery.toLowerCase())).length})
                        </h3>
                        {selectedTags.size > 0 && (
                            <span className="text-xs font-bold text-primary bg-orange-100 dark:bg-orange-900/30 px-2 py-0.5 rounded-full">
                                {selectedTags.size} selected
                            </span>
                        )}
                    </div>

                    <div className="mb-4">
                        <input
                            type="text"
                            placeholder="Search tags..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-xl text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all dark:text-white"
                        />
                    </div>

                    {/* Batch Actions */}
                    {selectedTags.size > 0 && (
                        <div className="flex gap-2 mb-3">
                            <button onClick={() => addTagsToGroup(Array.from(selectedTags), 'medical')} className="flex-1 bg-blue-100 text-blue-700 hover:bg-blue-200 py-1.5 rounded-lg text-xs font-bold transition-colors">Add to M</button>
                            <button onClick={() => addTagsToGroup(Array.from(selectedTags), 'varsityKa')} className="flex-1 bg-purple-100 text-purple-700 hover:bg-purple-200 py-1.5 rounded-lg text-xs font-bold transition-colors">Add to V</button>
                            <button onClick={() => addTagsToGroup(Array.from(selectedTags), 'engineering')} className="flex-1 bg-red-100 text-red-700 hover:bg-red-200 py-1.5 rounded-lg text-xs font-bold transition-colors">Add to E</button>
                        </div>
                    )}

                    <div className="flex flex-col gap-2 overflow-y-auto pr-2 flex-1">
                        {availableTags
                            .filter(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
                            .map(tag => (
                            <label key={tag} className={`flex items-center gap-2 px-3 py-2 rounded-xl border cursor-pointer transition-colors ${selectedTags.has(tag) ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-500/50' : 'bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-700 hover:border-gray-300 dark:hover:border-zinc-600'}`}>
                                <input 
                                    type="checkbox" 
                                    checked={selectedTags.has(tag)}
                                    onChange={() => toggleSelectTag(tag)}
                                    className="rounded border-gray-300 text-primary focus:ring-primary h-4 w-4"
                                />
                                <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 truncate flex-1 leading-tight">
                                    {tag}
                                </span>
                            </label>
                        ))}
                        {availableTags.filter(t => t.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 && (
                            <p className="text-xs text-center text-gray-400 py-4">No tags found.</p>
                        )}
                    </div>
                </div>

                {/* Categories */}
                <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Medical */}
                    <div className="bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 p-4 rounded-2xl flex flex-col h-full max-h-[600px]">
                        <h3 className="font-black text-blue-600 dark:text-blue-400 mb-4 border-b border-blue-100 dark:border-blue-900/50 pb-3">Medical (মেডিকেল)</h3>
                        <div className="flex-1 overflow-y-auto flex flex-col gap-2">
                            {groups.medical.map(t => (
                                <div key={t} className="bg-white dark:bg-zinc-900 px-3 py-2 rounded-xl text-sm font-semibold flex justify-between items-center shadow-sm border border-blue-100 dark:border-blue-900/50 text-gray-700 dark:text-gray-300">
                                    {t}
                                    <button onClick={() => removeTagFromGroup(t, 'medical')} className="text-gray-400 hover:text-red-500 transition-colors p-1"><X size={14}/></button>
                                </div>
                            ))}
                            {groups.medical.length === 0 && <p className="text-xs text-gray-400 text-center mt-4">No tags mapped.</p>}
                        </div>
                    </div>
                    
                    {/* Varsity Ka */}
                    <div className="bg-purple-50/50 dark:bg-purple-900/10 border border-purple-100 dark:border-purple-900/30 p-4 rounded-2xl flex flex-col h-full max-h-[600px]">
                        <h3 className="font-black text-purple-600 dark:text-purple-400 mb-4 border-b border-purple-100 dark:border-purple-900/50 pb-3">Varsity Ka (ভার্সিটি ক)</h3>
                        <div className="flex-1 overflow-y-auto flex flex-col gap-2">
                            {groups.varsityKa.map(t => (
                                <div key={t} className="bg-white dark:bg-zinc-900 px-3 py-2 rounded-xl text-sm font-semibold flex justify-between items-center shadow-sm border border-purple-100 dark:border-purple-900/50 text-gray-700 dark:text-gray-300">
                                    {t}
                                    <button onClick={() => removeTagFromGroup(t, 'varsityKa')} className="text-gray-400 hover:text-red-500 transition-colors p-1"><X size={14}/></button>
                                </div>
                            ))}
                            {groups.varsityKa.length === 0 && <p className="text-xs text-gray-400 text-center mt-4">No tags mapped.</p>}
                        </div>
                    </div>
                    
                    {/* Engineering */}
                    <div className="bg-red-50/50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 p-4 rounded-2xl flex flex-col h-full max-h-[600px]">
                        <h3 className="font-black text-red-600 dark:text-red-400 mb-4 border-b border-red-100 dark:border-red-900/50 pb-3">Engineering (ইঞ্জিনিয়ারিং)</h3>
                        <div className="flex-1 overflow-y-auto flex flex-col gap-2">
                            {groups.engineering.map(t => (
                                <div key={t} className="bg-white dark:bg-zinc-900 px-3 py-2 rounded-xl text-sm font-semibold flex justify-between items-center shadow-sm border border-red-100 dark:border-red-900/50 text-gray-700 dark:text-gray-300">
                                    {t}
                                    <button onClick={() => removeTagFromGroup(t, 'engineering')} className="text-gray-400 hover:text-red-500 transition-colors p-1"><X size={14}/></button>
                                </div>
                            ))}
                            {groups.engineering.length === 0 && <p className="text-xs text-gray-400 text-center mt-4">No tags mapped.</p>}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
