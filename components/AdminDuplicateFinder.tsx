import React, { useState, useEffect } from 'react';
import { Trash2, GitMerge, Check, AlertCircle, Loader2, FileText, Search, Zap, CheckCircle2 } from 'lucide-react';
import { useToast } from './Toast';
import { deleteQuestionFromBankAPI, fetchQuestionsFromBankAPI, updateQuestionInBankAPI, autoScanDuplicatesAPI, autoMergeDuplicatesAPI } from '../services/api';
import { normalizeForComparison, areQuestionsSimilar } from '../utils/normalization';

interface Props {
    qSubject: string;
    qChapter: string;
    qTopic: string;
    qExamRef: string;
    qSearch: string;
}

export default function AdminDuplicateFinder({ qSubject, qChapter, qTopic, qExamRef, qSearch }: Props) {
    const { showToast } = useToast();
    const [duplicates, setDuplicates] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [hasScanned, setHasScanned] = useState(false);
    const [mergingId, setMergingId] = useState<string | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    // Auto Merge States
    const [autoScanData, setAutoScanData] = useState<any>(null);
    const [isAutoScanning, setIsAutoScanning] = useState(false);
    const [isAutoMerging, setIsAutoMerging] = useState(false);
    const [autoMergeSuccess, setAutoMergeSuccess] = useState<any>(null);

    // Custom Confirm Modal State
    const [confirmAction, setConfirmAction] = useState<{isOpen: boolean, title: string, message: string, onConfirm: () => void} | null>(null);

    const [isMergingAll, setIsMergingAll] = useState(false);
    const [mergeProgress, setMergeProgress] = useState<string | null>(null);

    useEffect(() => {
        if (duplicates.length > 0 && window.MathJax) {
            setTimeout(() => {
                window.MathJax.typesetPromise().catch((err: any) => console.error('MathJax error:', err));
            }, 200);
        }
    }, [duplicates]);

    const handleAutoScan = async () => {
        setIsAutoScanning(true);
        setAutoScanData(null);
        setAutoMergeSuccess(null);
        try {
            const res = await autoScanDuplicatesAPI();
            if (res.success) {
                setAutoScanData(res);
            } else {
                showToast("Failed to scan full database", "error");
            }
        } catch (e) {
            showToast("Failed to run automated scan", "error");
        } finally {
            setIsAutoScanning(false);
        }
    };

    const handleAutoMerge = async () => {
        setConfirmAction({
            isOpen: true,
            title: "Bulk Merge Confirmation",
            message: "Are you absolutely sure? This will merge all detected duplicates based on fuzzy matching across the entire database. It may take a minute.",
            onConfirm: async () => {
                setConfirmAction(null);
                setIsAutoMerging(true);
                showToast("Fetching all questions to perform fuzzy merge...", "info");
                try {
                    // Fetch all questions
                    const data = await fetchQuestionsFromBankAPI(1, 50000);
                    const allQuestions = data.questions || [];
                    
                    showToast(`Fetched ${allQuestions.length} questions. Now grouping...`, "info");
                    
                    const groupedList: any[] = [];
                    allQuestions.forEach((q: any) => {
                        if (!q.subject || !q.chapter) return;
                        const normQ = normalizeForComparison(q.question || '');
                        const normOpts = (q.options || []).map((o: string) => normalizeForComparison(o || '')).sort().join('_|OP|_');
                        
                        let foundGroup = false;
                        for (const group of groupedList) {
                            if (areQuestionsSimilar(normQ, normOpts, group.qNorm, group.optsNorm)) {
                                group.questions.push(q);
                                foundGroup = true;
                                break;
                            }
                        }
                        
                        if (!foundGroup) {
                            groupedList.push({
                                qNorm: normQ,
                                optsNorm: normOpts,
                                questions: [q]
                            });
                        }
                    });

                    const dups = groupedList.filter(group => group.questions.length > 1);
                    
                    let mergedCount = 0;
                    let deletedCount = 0;
                    
                    showToast(`Found ${dups.length} groups to merge. Merging sequentially to avoid DB timeout...`, "info");
                    
                    for (const group of dups) {
                        const qs = group.questions;
                        let primaryQ = qs.find((q: any) => q.explanation || q.explanationImage) || qs[0];
                        const secondaryQs = qs.filter((q: any) => q._id !== primaryQ._id);
                        
                        // Combine tags and refs
                        const newTags = [...new Set(qs.flatMap((q:any) => q.tags || []))];
                        const newExamRefs = [...new Set(qs.flatMap((q:any) => {
                            if (!q.examRef) return [];
                            return q.examRef.split(',').map((s: string) => s.trim());
                        }))];
                        
                        const updatedPrimary = { ...primaryQ, tags: newTags, examRef: newExamRefs.join(', ') };
                        await updateQuestionInBankAPI(primaryQ._id, updatedPrimary);
                        mergedCount++;
                        
                        for (const s of secondaryQs) {
                            await deleteQuestionFromBankAPI(s._id);
                            deletedCount++;
                        }
                    }

                    setAutoMergeSuccess({ totalMerged: mergedCount, totalDeleted: deletedCount });
                    setAutoScanData(null);
                    setDuplicates([]);
                    setHasScanned(false);
                    showToast(`Bulk merge completed successfully! Merged ${mergedCount} groups, removed ${deletedCount} redundant questions.`, "success");
                } catch (e) {
                    console.error("Merge error:", e);
                    showToast("Failed to merge duplicates automatically", "error");
                } finally {
                    setIsAutoMerging(false);
                }
            }
        });
    };

    const scanDuplicates = async () => {
        setLoading(true);
        setHasScanned(false);
        try {
            // Fetch a large number of questions based on current filters
            const data = await fetchQuestionsFromBankAPI(1, 5000, qSubject, qChapter, qTopic, qExamRef, qSearch);
            const questions = data.questions || [];

            const groupedList: any[] = [];
            
            questions.forEach((q: any) => {
                const normQ = normalizeForComparison(q.question || '');
                const normOpts = (q.options || []).map((o: string) => normalizeForComparison(o || '')).sort().join('_|OP|_');
                
                let foundGroup = false;
                for (const group of groupedList) {
                    if (areQuestionsSimilar(normQ, normOpts, group.qNorm, group.optsNorm)) {
                        group.questions.push(q);
                        foundGroup = true;
                        break;
                    }
                }
                
                if (!foundGroup) {
                    groupedList.push({
                        qNorm: normQ,
                        optsNorm: normOpts,
                        questions: [q]
                    });
                }
            });

            const dups = groupedList
                .filter(group => group.questions.length > 1)
                .map(group => ({
                    _id: group.questions[0].question, // Just use first question as title
                    count: group.questions.length,
                    questions: group.questions
                }))
                .sort((a, b) => b.count - a.count);

            setDuplicates(dups);
            setHasScanned(true);
        } catch (e) {
            showToast("Failed to scan duplicates", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleMerge = async (group: any, primaryId: string) => {
        setConfirmAction({
            isOpen: true,
            title: "Confirm Manual Merge",
            message: "Are you sure you want to merge these target questions? The selected one will be kept, and others will be deleted. Tags, Exam Refs, and Explanation (if missing) will be combined locally then saved.",
            onConfirm: async () => {
                setConfirmAction(null);
                const secondaryIds = group.questions.filter((q: any) => q._id !== primaryId).map((q: any) => q._id);
                const secondaryQs = group.questions.filter((q: any) => q._id !== primaryId);
                const primaryQ = group.questions.find((q: any) => q._id === primaryId);

                if (secondaryIds.length === 0 || !primaryQ) return;

                setMergingId(group._id);
                try {
                    const allTags = new Set(primaryQ.tags || []);
                    const allExamRefs = primaryQ.examRef ? primaryQ.examRef.split(',').map((s:string) => s.trim()) : [];
                    
                    let updatedExp = primaryQ.explanation;
                    let updatedExpImg = primaryQ.explanationImage;

                    for (const q of secondaryQs) {
                        if (q.tags) q.tags.forEach((t:string) => allTags.add(t));
                        if (q.examRef) {
                            const refs = q.examRef.split(',').map((s:string) => s.trim());
                            refs.forEach((r:string) => {
                                if (r && !allExamRefs.includes(r)) allExamRefs.push(r);
                            });
                        }
                    }

                    if (!updatedExp && !updatedExpImg) {
                        const secondaryWithExp = secondaryQs.find((q:any) => q.explanation || q.explanationImage);
                        if (secondaryWithExp) {
                            updatedExp = secondaryWithExp.explanation;
                            updatedExpImg = secondaryWithExp.explanationImage;
                        }
                    }

                    // Update primary
                    const updatePayload = {
                        ...primaryQ,
                        tags: Array.from(allTags),
                        examRef: allExamRefs.join(', '),
                        explanation: updatedExp,
                        explanationImage: updatedExpImg
                    };
                    
                    delete updatePayload._id;
                    delete updatePayload.id;

                    await updateQuestionInBankAPI(primaryId, updatePayload);
                    
                    // Delete secondaries
                    for (const sId of secondaryIds) {
                        await deleteQuestionFromBankAPI(sId);
                    }

                    showToast("Questions merged successfully", "success");
                    setDuplicates(prev => prev.filter(d => d._id !== group._id));
                } catch (e) {
                    showToast("Merge failed", "error");
                } finally {
                    setMergingId(null);
                }
            }
        });
    };

    const handleDelete = async (questionId: string, groupId: string) => {
        setConfirmAction({
            isOpen: true,
            title: "Confirm Deletion",
            message: "Are you sure you want to delete this question?",
            onConfirm: async () => {
                setConfirmAction(null);
                setDeletingId(questionId);
                try {
                    await deleteQuestionFromBankAPI(questionId);
                    showToast("Question deleted", "success");
                    
                    setDuplicates(prev => prev.map(group => {
                        if (group._id === groupId) {
                            const newQuestions = group.questions.filter((q: any) => q._id !== questionId);
                            return { ...group, questions: newQuestions, count: newQuestions.length };
                        }
                        return group;
                    }).filter(group => group.count > 1));
                    
                } catch (e) {
                    showToast("Failed to delete", "error");
                } finally {
                    setDeletingId(null);
                }
            }
        });
    };

    const handleMergeAllListed = async () => {
        setConfirmAction({
            isOpen: true,
            title: "Confirm Block Merging",
            message: `Are you sure you want to merge all currently listed ${duplicates.length} duplicate groups? Each group's primary question (with explanations, if available) will be kept and updated, and other copies will be deleted. Tags and exam references will be combined.`,
            onConfirm: async () => {
                setConfirmAction(null);
                setIsMergingAll(true);
                let mergedCount = 0;
                let deletedCount = 0;

                try {
                    for (let i = 0; i < duplicates.length; i++) {
                        const group = duplicates[i];
                        if (!group || !group.questions || group.questions.length < 2) continue;

                        setMergeProgress(`Merging group ${i + 1} of ${duplicates.length}...`);
                        const qs = group.questions;
                        
                        // Select primary question (prefer one with explanation, or just the first)
                        let primaryQ = qs.find((q: any) => q.explanation || q.explanationImage);
                        if (!primaryQ) primaryQ = qs[0];

                        const secondaryQs = qs.filter((q: any) => q._id !== primaryQ._id);
                        const secondaryIds = secondaryQs.map((q: any) => q._id);

                        if (secondaryIds.length === 0 || !primaryQ) continue;

                        const allTags = new Set(primaryQ.tags || []);
                        const allExamRefs = primaryQ.examRef ? primaryQ.examRef.split(',').map((s: string) => s.trim()) : [];
                        
                        let updatedExp = primaryQ.explanation;
                        let updatedExpImg = primaryQ.explanationImage;

                        for (const q of secondaryQs) {
                            if (q.tags) q.tags.forEach((t: string) => allTags.add(t));
                            if (q.examRef) {
                                const refs = q.examRef.split(',').map((s: string) => s.trim());
                                refs.forEach((r: string) => {
                                    if (r && !allExamRefs.includes(r)) allExamRefs.push(r);
                                });
                            }
                        }

                        if (!updatedExp && !updatedExpImg) {
                            const secondaryWithExp = secondaryQs.find((q: any) => q.explanation || q.explanationImage);
                            if (secondaryWithExp) {
                                updatedExp = secondaryWithExp.explanation;
                                updatedExpImg = secondaryWithExp.explanationImage;
                            }
                        }

                        // Update primary
                        const updatePayload = {
                            ...primaryQ,
                            tags: Array.from(allTags),
                            examRef: allExamRefs.join(', '),
                            explanation: updatedExp,
                            explanationImage: updatedExpImg
                        };
                        
                        delete updatePayload._id;
                        delete updatePayload.id;

                        await updateQuestionInBankAPI(primaryQ._id, updatePayload);
                        mergedCount++;

                        // Delete secondaries
                        for (const sId of secondaryIds) {
                            await deleteQuestionFromBankAPI(sId);
                            deletedCount++;
                        }
                    }

                    showToast(`Successfully merged ${mergedCount} groups! Removed ${deletedCount} redundant copies.`, "success");
                    setDuplicates([]);
                } catch (e) {
                    console.error(e);
                    showToast("Failed to complete bulk merging.", "error");
                } finally {
                    setIsMergingAll(false);
                    setMergeProgress(null);
                }
            }
        });
    };

    const renderAutoMergeSection = () => {
        return (
            <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-2xl p-6 mb-8">
                <div className="flex flex-col md:flex-row items-center gap-6">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                            <Zap className="text-indigo-600 dark:text-indigo-400" size={24} fill="currentColor" />
                            <h2 className="text-xl font-bold text-indigo-900 dark:text-indigo-300">Automated One-Click Merge</h2>
                        </div>
                        <p className="text-indigo-700 dark:text-indigo-400 text-sm">
                            Scan the <strong>entire database</strong> for exact duplicates (matching subject, chapter, question, and options). This will automatically retain explanations, combine exam references & tags, and set the most common correct answer.
                        </p>
                    </div>
                    
                    <div className="shrink-0 flex items-center gap-4">
                        <button 
                            onClick={handleAutoScan}
                            disabled={isAutoScanning || isAutoMerging}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-6 rounded-xl transition flex items-center justify-center gap-2 shadow-sm min-w-[140px]"
                        >
                            {isAutoScanning ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
                            {isAutoScanning ? "Scanning..." : "Check Database"}
                        </button>
                    </div>
                </div>

                {autoScanData && (
                    <div className="mt-6 p-4 bg-white dark:bg-black/40 rounded-xl border border-indigo-100 dark:border-indigo-800/50 animate-in fade-in slide-in-from-top-2 flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="bg-indigo-100 dark:bg-indigo-900/40 p-3 rounded-full text-indigo-700 dark:text-indigo-300">
                                <Search size={20} />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Total Checked: <strong>{autoScanData.totalQuestions}</strong> questions</p>
                                <p className="text-gray-900 dark:text-white font-bold">
                                    Found <span className="text-red-500">{autoScanData.duplicateGroupsCount}</span> duplicate groups. <br/>
                                    Merging will remove <span className="text-red-500">{autoScanData.totalDuplicatesToMerge}</span> redundant copies.
                                </p>
                            </div>
                        </div>
                        
                        {autoScanData.totalDuplicatesToMerge > 0 ? (
                            <button 
                                type="button"
                                onClick={(e) => { e.preventDefault(); handleAutoMerge(); }}
                                disabled={isAutoMerging}
                                className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded-lg transition flex items-center gap-2 shadow-sm whitespace-nowrap"
                            >
                                {isAutoMerging ? <Loader2 size={18} className="animate-spin" /> : <GitMerge size={18} />}
                                {isAutoMerging ? "Merging..." : "Confirm & Merge All"}
                            </button>
                        ) : (
                            <span className="text-green-600 font-bold bg-green-50 dark:bg-green-900/20 px-4 py-2 rounded-lg flex items-center gap-2">
                                <CheckCircle2 size={18}/> Database is clean!
                            </span>
                        )}
                    </div>
                )}
                
                {autoMergeSuccess && (
                     <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl flex items-center gap-3">
                         <CheckCircle2 className="text-green-600 shrink-0" size={24} />
                         <div>
                             <h4 className="font-bold text-green-800 dark:text-green-400">Successfully Merged!</h4>
                             <p className="text-green-700 dark:text-green-500 text-sm">
                                Merged {autoMergeSuccess.totalMerged} groups and removed {autoMergeSuccess.totalDeleted} duplicates.
                             </p>
                         </div>
                     </div>
                )}
            </div>
        );
    };

    if (isMergingAll) {
        return (
            <div className="w-full">
                {renderAutoMergeSection()}
                <div className="flex flex-col items-center justify-center p-12 space-y-4 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl shadow-sm text-center">
                    <Loader2 className="animate-spin text-red-600" size={40} />
                    <p className="text-red-600 font-bold text-lg">{mergeProgress}</p>
                    <p className="text-gray-500 text-sm">
                        Merging is being performed sequentially in your browser to avoid database & Render server timeouts. Please keep this tab open.
                    </p>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="w-full">
                {renderAutoMergeSection()}
                <div className="flex flex-col items-center justify-center p-12 space-y-4">
                    <Loader2 className="animate-spin text-primary" size={32} />
                    <p className="text-gray-500 font-medium">Scanning current filter set for duplicates...</p>
                </div>
            </div>
        );
    }

    if (!hasScanned) {
        return (
            <div className="w-full">
                {renderAutoMergeSection()}
                <div className="flex flex-col items-center justify-center p-12 bg-gray-50 dark:bg-zinc-800/50 rounded-2xl border border-gray-200 dark:border-zinc-700">
                   <AlertCircle size={32} className="text-gray-400 mb-4" />
                   <p className="text-gray-500 font-medium mb-4 text-center">
                       You can also manually review duplicates for the currently loaded Manager filters below.
                   </p>
                   <button onClick={scanDuplicates} className="px-6 py-2 bg-gray-200 dark:bg-zinc-700 text-gray-800 dark:text-white font-bold rounded-xl hover:bg-gray-300 dark:hover:bg-zinc-600 flex items-center gap-2 transition focus:ring-2 ring-primary">
                       <Search size={18} />
                       Manual Review Scan
                   </button>
                </div>
            </div>
        );
    }

    if (duplicates.length === 0) {
        return (
            <div className="w-full">
                {renderAutoMergeSection()}
                <div className="bg-green-50 dark:bg-green-900/20 p-8 rounded-2xl border border-green-200 dark:border-green-800 text-center animate-in fade-in">
                    <div className="w-16 h-16 bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Check size={32} className="text-green-500" />
                    </div>
                    <h3 className="text-xl font-bold text-green-700 dark:text-green-400 mb-2">No Duplicates Found!</h3>
                    <p className="text-green-600 dark:text-green-500 mb-4">The current filtered question set has no text duplicates.</p>
                    <button onClick={scanDuplicates} className="px-6 py-2 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition shadow-sm">
                        Scan Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in slide-in-from-bottom-4">
            {renderAutoMergeSection()}
            
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-xl border border-yellow-200 dark:border-yellow-800 gap-4">
                <div className="flex items-start gap-3">
                    <AlertCircle className="text-yellow-600 shrink-0 mt-0.5" size={20} />
                    <div>
                        <h3 className="font-bold text-yellow-800 dark:text-yellow-500">Found {duplicates.length} Duplicate Groups</h3>
                        <p className="text-sm text-yellow-700 dark:text-yellow-600 mt-1">Review and merge or delete duplicate entries. Merging will keep the primary question and append all tags and exam references from the duplicates to it. Also keeps the explanation if available.</p>
                    </div>
                </div>
                <div className="flex flex-wrap items-center gap-2 w-full md:w-auto self-stretch md:self-auto justify-end">
                    <button 
                        type="button"
                        onClick={handleMergeAllListed}
                        disabled={isMergingAll || mergingId !== null || deletingId !== null} 
                        className="flex-1 md:flex-none whitespace-nowrap px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-bold rounded-lg transition shadow-sm flex items-center justify-center gap-2"
                    >
                        <GitMerge size={16} />
                        Merge All Listed ({duplicates.length})
                    </button>
                    <button 
                        type="button"
                        onClick={scanDuplicates} 
                        disabled={isMergingAll}
                        className="flex-1 md:flex-none whitespace-nowrap px-4 py-2.5 bg-gray-200 dark:bg-zinc-800 text-gray-800 dark:text-white text-sm font-bold rounded-lg hover:bg-gray-300 dark:hover:bg-zinc-700 transition"
                    >
                        Rescan
                    </button>
                </div>
            </div>

            <div className="space-y-6">
                {duplicates.map((group, idx) => (
                    <div key={idx} className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
                        <div className="bg-gray-50 dark:bg-zinc-800/50 p-4 border-b border-gray-100 dark:border-zinc-800">
                            <div className="flex gap-2 items-start">
                                <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-1 rounded-md shrink-0">
                                    {group.count} copies
                                </span>
                                <h4 className="font-tiro font-bold text-gray-900 dark:text-white leading-relaxed">
                                    {group._id}
                                </h4>
                            </div>
                        </div>
                        
                        <div className="p-4 space-y-4">
                            {group.questions.map((q: any) => (
                                <div key={q._id} className="p-4 rounded-xl border border-gray-100 dark:border-zinc-800 bg-gray-50/50 dark:bg-black/20 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between group-hover:border-primary transition-colors">
                                    <div className="flex-1 space-y-2">
                                        <div className="flex flex-wrap gap-2 text-xs">
                                            <span className="text-gray-500 font-medium">Subject:</span> <span className="font-bold text-gray-800 dark:text-gray-200">{q.subject}</span>
                                            <span className="text-gray-300">|</span>
                                            <span className="text-gray-500 font-medium">Chapter:</span> <span className="font-bold text-gray-800 dark:text-gray-200">{q.chapter}</span>
                                        </div>
                                        
                                        <div className="text-sm font-tiro text-gray-700 dark:text-gray-300 font-medium whitespace-pre-wrap">
                                            {q.question}
                                            {q.questionImage && (
                                                <div className="mt-2">
                                                    <img src={q.questionImage} alt="question" className="max-h-32 object-contain rounded-md" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="text-sm font-tiro text-gray-600 dark:text-gray-400 flex gap-2 flex-col">
                                            <span className="font-medium text-gray-500">Options:</span> 
                                            <div className="flex flex-wrap gap-2">
                                                {q.options?.map((opt: string, i: number) => (
                                                    <div key={i} className="bg-white dark:bg-black/40 px-2 py-1 rounded border border-gray-200 dark:border-zinc-700 flex items-center gap-2">
                                                        <span>{opt}</span>
                                                        {q.optionsImages && q.optionsImages[i] && (
                                                            <img src={q.optionsImages[i]} alt={`Option`} className="max-h-12 object-contain rounded" />
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap gap-2 items-center mt-2">
                                            {q.examRef && (
                                                <span className="text-[10px] font-bold bg-blue-50 text-blue-600 border border-blue-100 dark:bg-blue-900/20 dark:border-blue-800/30 px-2 py-1 rounded-md">
                                                    {q.examRef}
                                                </span>
                                            )}
                                            {q.tags?.map((t: string, i: number) => (
                                                <span key={i} className="text-[10px] bg-gray-100 text-gray-600 dark:bg-zinc-800 dark:text-gray-400 px-2 py-1 rounded-md border border-gray-200 dark:border-zinc-700">
                                                    #{t}
                                                </span>
                                            ))}
                                            {(q.explanation || q.explanationImage) && (
                                                <span className="text-[10px] bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400 px-2 py-1 rounded-md border border-green-200 dark:border-green-800 flex items-center gap-1">
                                                    <FileText size={10} /> Has Explanation
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center gap-2 w-full md:w-auto">
                                        <button 
                                            type="button"
                                            onClick={(e) => { e.preventDefault(); handleMerge(group, q._id); }}
                                            disabled={mergingId === group._id || deletingId === q._id}
                                            className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-3 py-2 bg-green-50 text-green-700 hover:bg-green-100 dark:bg-green-900/20 dark:text-green-400 dark:hover:bg-green-900/40 rounded-lg text-xs font-bold transition"
                                        >
                                            {mergingId === group._id ? <Loader2 size={14} className="animate-spin" /> : <GitMerge size={14} />}
                                            Keep & Merge
                                        </button>
                                        <button 
                                            type="button"
                                            onClick={(e) => { e.preventDefault(); handleDelete(q._id, group._id); }}
                                            disabled={mergingId === group._id || deletingId === q._id}
                                            className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"
                                        >
                                            {deletingId === q._id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
            
            {/* Custom Confirm Modal */}
            {confirmAction && confirmAction.isOpen && (
                <div className="fixed inset-0 bg-black/60 z-[9999] flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl max-w-sm w-full p-6 shadow-2xl animate-in fade-in zoom-in-95">
                        <div className="flex items-center gap-3 mb-4 text-red-600 dark:text-red-400">
                            <AlertCircle size={28} />
                            <h3 className="text-xl font-bold">{confirmAction.title}</h3>
                        </div>
                        <p className="text-gray-600 dark:text-gray-400 mb-8 font-medium">{confirmAction.message}</p>
                        <div className="flex flex-col sm:flex-row justify-end gap-3">
                            <button 
                                type="button"
                                onClick={(e) => { e.preventDefault(); setConfirmAction(null); }} 
                                className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:text-gray-200 rounded-xl font-bold transition"
                            >
                                Cancel
                            </button>
                            <button 
                                type="button"
                                onClick={(e) => { e.preventDefault(); confirmAction.onConfirm(); }} 
                                className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold shadow-md shadow-red-600/20 transition flex-1"
                            >
                                Confirm Action
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
