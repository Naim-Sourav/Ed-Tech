import React, { useState, useEffect } from 'react';
import { logger } from '../utils/logger';
import { useToast } from './Toast';
import { fetchQuestionsByExamRefAPI, updateQuestionInBankAPI, normalizeText, fetchQuestionBankExamRefsAPI } from '../services/api';
import { QuizQuestion } from '../types';
import { Loader2, Upload, Database, CheckCircle, AlertCircle } from 'lucide-react';

const AdminBulkMapper: React.FC = () => {
    const { showToast } = useToast();
    const [examRef, setExamRef] = useState<string>('');
    const [availableExamRefs, setAvailableExamRefs] = useState<string[]>([]);
    const [jsonInput, setJsonInput] = useState<string>('');
    const [isProcessing, setIsProcessing] = useState<boolean>(false);
    const [isLoadingRefs, setIsLoadingRefs] = useState<boolean>(true);
    const [logs, setLogs] = useState<string[]>([]);

    useEffect(() => {
        loadExamRefs();
    }, []);

    const loadExamRefs = async () => {
        setIsLoadingRefs(true);
        try {
            const data = await fetchQuestionBankExamRefsAPI();
            setAvailableExamRefs(data || []);
        } catch (error: any) {
            logger.error(error);
            showToast("Failed to load available exam refs", "error");
        } finally {
            setIsLoadingRefs(false);
        }
    };

    const appendLog = (msg: string) => {
        setLogs(prev => [...prev, msg]);
    };

    const handleProcess = async () => {
        if (!examRef.trim()) {
            showToast("Please enter an exam reference (examRef).", "error");
            return;
        }

        let parsedMapping: any[] = [];
        try {
            const parsed = JSON.parse(jsonInput);
            if (!Array.isArray(parsed)) {
                throw new Error("JSON must be an array of objects.");
            }
            parsedMapping = parsed;
        } catch (error: any) {
            showToast(`JSON Parse Error: ${error.message}`, "error");
            return;
        }

        setIsProcessing(true);
        setLogs([]);
        appendLog(`Fetching questions for examRef: ${examRef}...`);

        try {
            const questions: QuizQuestion[] = await fetchQuestionsByExamRefAPI(examRef);
            if (!questions || questions.length === 0) {
                appendLog(`No questions found for examRef: ${examRef}`);
                showToast("No questions found.", "error");
                setIsProcessing(false);
                return;
            }

            appendLog(`Found ${questions.length} questions. Starting matching process...`);

            let successCount = 0;
            let skipCount = 0;
            let errorCount = 0;

            for (const q of questions) {
                // Find matching mapping item based on serial or orderIndex
                // Let's check both `serial`, `serialNumber`, `orderIndex`
                const mappingItem = parsedMapping.find((m: any) => 
                    m.serial === q.orderIndex || 
                    m.orderIndex === q.orderIndex || 
                    m.serialNumber === q.orderIndex ||
                    String(m.serial) === String(q.orderIndex)
                );

                if (!mappingItem) {
                    appendLog(`Skipped Q. ID ${q._id} (Order: ${q.orderIndex}) - No matching serial in JSON.`);
                    skipCount++;
                    continue;
                }

                // Prepare update data
                const updateData: any = {};
                if (mappingItem.subject) updateData.subject = normalizeText(mappingItem.subject);
                if (mappingItem.chapter) updateData.chapter = normalizeText(mappingItem.chapter);
                if (mappingItem.topic) updateData.topic = normalizeText(mappingItem.topic);

                if (Object.keys(updateData).length === 0) {
                    appendLog(`Skipped Q. ID ${q._id} (Order: ${q.orderIndex}) - No subject/chapter/topic provided in JSON.`);
                    skipCount++;
                    continue;
                }

                try {
                    // Assuming q._id exists from MongoDB
                    const targetId = q._id || q.id;
                    if (!targetId) {
                        appendLog(`Error Q. ID ${q._id} - Missing document ID.`);
                        errorCount++;
                        continue;
                    }
                    
                    await updateQuestionInBankAPI(targetId, updateData);
                    appendLog(`✔ Updated Q. ID ${targetId} (Order: ${q.orderIndex}) => Sub: ${updateData.subject || '-'}, Chap: ${updateData.chapter || '-'}`);
                    successCount++;
                } catch (err: any) {
                    appendLog(`✖ Failed to update Q. ID ${q._id} (Order: ${q.orderIndex}) - ${err.message}`);
                    errorCount++;
                }
            }

            appendLog(`Process Finished. Success: ${successCount}, Skips: ${skipCount}, Errors: ${errorCount}`);
            showToast(`Mapped ${successCount} questions successfully.`, "success");

        } catch (err: any) {
            appendLog(`Fatal Error: ${err.message}`);
            showToast("Failed to process bulk mapping.", "error");
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-sm overflow-hidden animate-in fade-in">
            <div className="p-4 border-b border-gray-200 dark:border-zinc-800 flex justify-between items-center bg-gray-50 dark:bg-black/50">
                <div className="flex items-center gap-3">
                    <Database className="text-primary hidden sm:block" size={24} />
                    <div>
                        <h2 className="text-lg font-black text-gray-800 dark:text-white leading-tight">Bulk Mapper</h2>
                        <p className="text-xs text-gray-500 font-medium">Assign Subject/Chapter via JSON</p>
                    </div>
                </div>
            </div>

            <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Target Exam (from Question Bank)</label>
                        {isLoadingRefs ? (
                            <div className="flex items-center gap-2 p-3 text-sm text-gray-500 rounded-xl border border-gray-200 dark:border-zinc-800">
                                <Loader2 size={16} className="animate-spin" /> Fetching available exams...
                            </div>
                        ) : availableExamRefs.length > 0 ? (
                            <select
                                value={examRef}
                                onChange={(e) => setExamRef(e.target.value)}
                                className="w-full p-3 rounded-xl border bg-gray-50 dark:bg-black border-gray-200 dark:border-zinc-800 text-sm font-medium outline-none focus:ring-2 focus:ring-primary/20 transition-all dark:text-white"
                            >
                                <option value="">Select an exam...</option>
                                {availableExamRefs.map((ref) => (
                                    <option key={ref} value={ref}>{ref}</option>
                                ))}
                            </select>
                        ) : (
                            <input
                                type="text"
                                value={examRef}
                                onChange={(e) => setExamRef(e.target.value)}
                                placeholder="e.g. DU A Unit 23-24"
                                className="w-full p-3 rounded-xl border bg-gray-50 dark:bg-black border-gray-200 dark:border-zinc-800 text-sm font-medium outline-none focus:ring-2 focus:ring-primary/20 transition-all dark:text-white"
                            />
                        )}
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Mapping JSON Array</label>
                        <p className="text-xs text-gray-500 mb-2">
                            Example: <code>[{`{"serial": 1, "subject": "পদার্থবিজ্ঞান", "chapter": "ভৌত জগৎ ও পরিমাপ"}`}]</code>
                        </p>
                        <textarea
                            value={jsonInput}
                            onChange={(e) => setJsonInput(e.target.value)}
                            placeholder="Paste JSON array here..."
                            rows={12}
                            className="w-full p-3 rounded-xl border bg-gray-50 dark:bg-black border-gray-200 dark:border-zinc-800 text-xs font-mono outline-none focus:ring-2 focus:ring-primary/20 transition-all dark:text-white"
                        />
                    </div>

                    <button
                        onClick={handleProcess}
                        disabled={isProcessing}
                        className="w-full py-3 bg-primary text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-primary/90 disabled:opacity-50"
                    >
                        {isProcessing ? <Loader2 className="animate-spin" size={20} /> : <Upload size={20} />}
                        {isProcessing ? 'Processing Mappings...' : 'Apply Mappings'}
                    </button>
                    
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200 p-4 rounded-xl text-sm border border-yellow-200 dark:border-yellow-800/30 flex gap-3">
                        <AlertCircle className="shrink-0 mt-0.5" size={18} />
                        <div>
                            <strong>Note:</strong> This process makes direct API requests to update each question. It might take a moment if the batch is large. Make sure you don't close the tab during processing.
                        </div>
                    </div>
                </div>

                <div className="bg-gray-900 text-gray-300 p-4 rounded-xl text-xs font-mono h-[550px] overflow-y-auto flex flex-col">
                    <h3 className="text-white font-bold mb-3 uppercase tracking-wider text-[12px] flex items-center gap-2">
                        <CheckCircle size={14} className="text-green-400" /> Execution Logs
                    </h3>
                    {logs.length === 0 ? (
                        <div className="flex-1 flex items-center justify-center text-gray-600 opacity-50">
                            Logs will appear here...
                        </div>
                    ) : (
                        <div className="space-y-1">
                            {logs.map((log, i) => (
                                <div key={i} className="break-words border-b border-gray-800 pb-1">
                                    {log}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminBulkMapper;
