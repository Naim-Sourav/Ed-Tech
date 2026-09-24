import React, { useRef, useState } from 'react';
import { logger } from '../utils/logger';
import { Play, Loader2, Image as ImageIcon, CheckCircle, AlertCircle } from 'lucide-react';
import { fetchQuestionsFromBankAPI, updateQuestionInBankAPI, fetchQuestionsForMigrator } from '../services/api';
import { useToast } from './Toast';

export default function AdminImageMigrator() {
    const [apiKey, setApiKey] = useState('5ca781792ba2e2fbb41bee82f5765e0e');
    const [isMigrating, setIsMigrating] = useState(false);
    const [shouldStop, setShouldStop] = useState(false);
    const [progress, setProgress] = useState({ total: 0, current: 0, updated: 0, failed: 0 });
    const [forceReupload, setForceReupload] = useState(false);
    const [delayMs, setDelayMs] = useState(300); // 300ms default delay between uploads to avoid rate limits
    const [logs, setLogs] = useState<string[]>([]);
    const { showToast } = useToast();
    
    // Use a ref to access the latest stop state inside the async loop
    const shouldStopRef = useRef(false);

    const addLog = (msg: string) => {
        setLogs(prev => [msg, ...prev].slice(0, 100)); // Keep last 100 logs
    };

    const uploadToImgBB = async (imageUrl: string, key: string, force: boolean): Promise<string> => {
        // Skip if base64 or empty
        if (!imageUrl || imageUrl.startsWith('data:')) {
            return imageUrl;
        }
        
        // Skip ImgBB links if not forcing reupload
        if (!force && imageUrl.includes('i.ibb.co')) {
            return imageUrl;
        }

        try {
            const randomName = `${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
            let imageBase64: string | null = null;

            // Fetch the image and convert to base64 to completely wipe metadata and original URL
            const fetchAsBase64 = async (url: string) => {
                const imgRes = await fetch(url);
                if (!imgRes.ok) throw new Error('Not ok');
                const blob = await imgRes.blob();
                const base64Str = await new Promise<string>((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onloadend = () => resolve(reader.result as string);
                    reader.onerror = reject;
                    reader.readAsDataURL(blob);
                });
                return base64Str.split(',')[1];
            };

            try {
                imageBase64 = await fetchAsBase64(imageUrl);
            } catch (e) {
                logger.warn('Direct fetch failed (CORS?), trying proxy...', e);
                try {
                    const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(imageUrl)}`;
                    imageBase64 = await fetchAsBase64(proxyUrl);
                } catch (proxyErr) {
                    logger.warn('Proxy fetch also failed, falling back to URL upload', proxyErr);
                }
            }

            const formData = new FormData();
            formData.append('key', key);
            
            if (imageBase64) {
                formData.append('image', imageBase64);
            } else {
                formData.append('image', imageUrl);
            }
            
            formData.append('name', randomName);

            const response = await fetch('https://api.imgbb.com/1/upload', {
                method: 'POST',
                body: formData
            });

            const data = await response.json();
            if (data.success && data.data && data.data.url) {
                if (delayMs > 0) {
                    await new Promise(resolve => setTimeout(resolve, delayMs));
                }
                
                // ImgBB ignores the filename path segment, so we can rename the URL directly
                // This ensures folder paths or original names are completely wiped out
                const originalUrl = data.data.url;
                const urlParts = originalUrl.split('/');
                const oldFilename = urlParts.pop() || 'image.png';
                const extension = oldFilename.includes('.') ? oldFilename.split('.').pop() : 'png';
                
                const finalName = `${randomName}.${extension}`;
                urlParts.push(finalName);
                const randomizedUrl = urlParts.join('/');
                
                // Log the rename so admin can verify it works
                let shortOriginal = imageUrl.split('/').pop()?.split('?')[0] || 'unknown';
                if (shortOriginal.length > 30) shortOriginal = shortOriginal.substring(0, 30) + '...';
                addLog(`✓ Uploaded: ${shortOriginal} -> ${finalName}`);
                
                return randomizedUrl;
            } else {
                throw new Error(data.error?.message || 'Upload failed');
            }
        } catch (error: any) {
            logger.error('ImgBB upload error:', error);
            throw error;
        }
    };

    const processQuestions = async () => {
        if (!apiKey) {
            showToast('Please enter an ImgBB API key', 'error');
            return;
        }

        setIsMigrating(true);
        setShouldStop(false);
        shouldStopRef.current = false;
        
        addLog('Starting image migration process...');
        setProgress({ total: 0, current: 0, updated: 0, failed: 0 });

        try {
            let page = 1;
            const limit = 10; // Process 10 per page
            let hasMore = true;
            let totalQuestions = 0;
            let currentProcessed = 0;
            let currentUpdated = 0;

            // Fetch first page just to get total count
            const initialFetch = await fetchQuestionsForMigrator(1, 1);
            totalQuestions = initialFetch.total || 0;
            setProgress(p => ({ ...p, total: totalQuestions }));
            addLog(`Found ${totalQuestions} questions to scan limit by ${limit} items/page.`);

            while (hasMore && !shouldStopRef.current) {
                try {
                    const data = await fetchQuestionsForMigrator(page, limit);
                    const questions = data.questions || [];

                    if (questions.length === 0) {
                        hasMore = false;
                        break;
                    }

                    for (const q of questions) {
                        currentProcessed++;
                        setProgress(p => ({ ...p, current: currentProcessed }));

                        let needsUpdate = false;
                        const updatedQ = { ...q };

                        const shouldProcess = (url: string) => url && (!url.includes('i.ibb.co') || forceReupload);

                        // Check and upload questionImage
                        if (shouldProcess(q.questionImage)) {
                            try {
                                updatedQ.questionImage = await uploadToImgBB(q.questionImage, apiKey, forceReupload);
                                needsUpdate = true;
                            } catch (e: any) {
                                addLog(`Failed to upload questionImage for question ${q._id}: ${e.message}`);
                            }
                        }

                        // Check and upload explanationImage
                        if (shouldProcess(q.explanationImage)) {
                            try {
                                updatedQ.explanationImage = await uploadToImgBB(q.explanationImage, apiKey, forceReupload);
                                needsUpdate = true;
                            } catch (e: any) {
                                addLog(`Failed to upload explanationImage for question ${q._id}: ${e.message}`);
                            }
                        }

                        // Check and upload contextImage
                        if (shouldProcess(q.contextImage)) {
                            try {
                                updatedQ.contextImage = await uploadToImgBB(q.contextImage, apiKey, forceReupload);
                                needsUpdate = true;
                            } catch (e: any) {
                                addLog(`Failed to upload contextImage for question ${q._id}: ${e.message}`);
                            }
                        }

                        // Check and upload optionsImages
                        if (q.optionsImages && Array.isArray(q.optionsImages)) {
                            const newOptionsImages = [...q.optionsImages];
                            let optionsUpdated = false;
                            for (let i = 0; i < newOptionsImages.length; i++) {
                                if (shouldProcess(newOptionsImages[i])) {
                                    try {
                                        newOptionsImages[i] = await uploadToImgBB(newOptionsImages[i], apiKey, forceReupload);
                                        optionsUpdated = true;
                                        needsUpdate = true;
                                    } catch (e: any) {
                                        addLog(`Failed to upload optionImage [${i}] for question ${q._id}: ${e.message}`);
                                    }
                                }
                            }
                            if (optionsUpdated) {
                                updatedQ.optionsImages = newOptionsImages;
                            }
                        }

                        // If anything was updated, save it back
                        if (needsUpdate) {
                            try {
                                await updateQuestionInBankAPI(q._id, updatedQ);
                                currentUpdated++;
                                setProgress(p => ({ ...p, updated: currentUpdated }));
                                addLog(`Updated images for question ${q._id}`);
                            } catch (e: any) {
                                setProgress(p => ({ ...p, failed: p.failed + 1 }));
                                addLog(`Failed to save updated question ${q._id}: ${e.message}`);
                            }
                        }
                    }

                    page++;
                } catch (error) {
                    addLog(`Error fetching page ${page}: ${error}`);
                    // We shouldn't stop completely on one bad page, but maybe retry or move on.
                    // For safety, let's break.
                    hasMore = false;
                }
            }

            addLog('Migration process Finished.');
            showToast('Migration process completed', 'success');

        } catch (error) {
            logger.error(error);
            showToast('Migration process encountered a fatal error', 'error');
            addLog('Fatal error during migration');
        } finally {
            setIsMigrating(false);
            setShouldStop(false);
            shouldStopRef.current = false;
        }
    };

    const handleStop = () => {
        setShouldStop(true);
        shouldStopRef.current = true;
        addLog('Stopping process after current batch...');
        showToast('Stopping migration...', 'info');
    };

    return (
        <div className="space-y-6">
            <div className="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-2xl border border-blue-100 dark:border-blue-900/30">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-2">
                    <ImageIcon className="text-blue-500" /> Image Migrator (ImgBB)
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    এই টুলটি ডেটাবেসের সমস্ত প্রশ্ন স্ক্যান করবে এবং অন্য কোনো হোস্টিংয়ে থাকা ছবিগুলো স্বয়ংক্রিয়ভাবে ImgBB তে আপলোড করে লিংক আপডেট করে দিবে।
                </p>

                <div className="flex gap-3 mb-4 flex-col sm:flex-row">
                    <div className="flex-1 space-y-3">
                        <input
                            type="text"
                            value={apiKey}
                            onChange={e => setApiKey(e.target.value)}
                            placeholder="ImgBB API Key"
                            className="w-full px-4 py-2 rounded-xl border bg-white dark:bg-zinc-900 dark:border-zinc-800 text-sm"
                        />
                        <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
                            <input 
                                type="checkbox" 
                                checked={forceReupload} 
                                onChange={e => setForceReupload(e.target.checked)}
                                className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                            />
                            Force re-upload existing ImgBB images (Randomize image names)
                        </label>
                        <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                            <span>Upload Delay:</span>
                            <input 
                                type="number" 
                                min="0" 
                                max="10000"
                                value={delayMs} 
                                onChange={e => setDelayMs(Math.max(0, parseInt(e.target.value) || 0))}
                                className="w-20 px-2 py-1 rounded-lg border bg-white dark:bg-zinc-900 border-gray-300 dark:border-zinc-800 text-xs text-center"
                            />
                            <span>ms (helps prevent hitting API speed limits)</span>
                        </div>
                    </div>
                    <div className="flex gap-2 items-start">
                        <button
                            onClick={processQuestions}
                            disabled={isMigrating || !apiKey}
                            className={`px-6 py-2 rounded-xl font-bold flex items-center gap-2 text-white shadow-lg transition-all 
                            ${isMigrating ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
                        >
                            {isMigrating ? <Loader2 size={18} className="animate-spin" /> : <Play size={18} />}
                            Start Migration
                        </button>
                        {isMigrating && (
                            <button
                                onClick={handleStop}
                                disabled={shouldStop}
                                className={`px-4 py-2 rounded-xl font-bold ${shouldStop ? 'bg-gray-300 text-gray-500' : 'bg-red-100 text-red-600 hover:bg-red-200'}`}
                            >
                                {shouldStop ? 'Stopping...' : 'Stop'}
                            </button>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-4 gap-4 mb-4">
                    <div className="bg-white dark:bg-zinc-900 p-3 rounded-xl border dark:border-zinc-800">
                        <p className="text-xs text-gray-500">Total Scanned</p>
                        <p className="text-lg font-bold">{progress.current} / {progress.total}</p>
                    </div>
                    <div className="bg-white dark:bg-zinc-900 p-3 rounded-xl border dark:border-zinc-800">
                        <p className="text-xs text-green-600">Updated</p>
                        <p className="text-lg font-bold text-green-600">{progress.updated}</p>
                    </div>
                    <div className="bg-white dark:bg-zinc-900 p-3 rounded-xl border dark:border-zinc-800">
                        <p className="text-xs text-red-600">Errors</p>
                        <p className="text-lg font-bold text-red-600">{progress.failed}</p>
                    </div>
                </div>

                <div className="bg-slate-900 rounded-xl p-4 overflow-y-auto h-64 border border-zinc-800 font-mono text-xs">
                    {logs.length === 0 ? (
                        <span className="text-slate-500">Ready to start...</span>
                    ) : (
                        logs.map((log, i) => (
                            <div key={i} className="text-green-400 mb-1 border-b border-white/5 pb-1">
                                {log}
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}

