import sys

with open('components/ProfilePage.tsx', 'r') as f:
    lines = f.readlines()

new_settings_tab = """        {/* SETTINGS TAB */}
        {activeTab === 'SETTINGS' && (
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6 max-w-2xl mx-auto"
            >
                <div className="relative">
                     <div className="space-y-8">
                         <div className="flex items-center gap-3 border-b border-gray-100 dark:border-zinc-800 pb-6">
                            <div className="p-3 bg-gray-100 dark:bg-zinc-800 rounded-2xl text-gray-500 dark:text-zinc-400">
                                <Settings size={24} />
                            </div>
                            <div>
                                <h2 className="text-xl md:text-2xl font-black text-gray-900 dark:text-white tracking-tight">Settings</h2>
                                <p className="text-xs text-gray-400 dark:text-zinc-500 font-bold uppercase tracking-widest mt-1">App Preferences</p>
                            </div>
                         </div>
                         
                         {/* Settings Options */}
                         <div className="space-y-6">
                             
                             {/* Theme Mode */}
                             {toggleTheme && (
                                 <div className="flex items-center justify-between group">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-gray-50 dark:bg-zinc-800 flex items-center justify-center text-gray-400 dark:text-zinc-500 group-hover:text-primary transition-colors">
                                            {themeMode === 'light' ? <Sun size={20}/> : themeMode === 'dark' ? <Moon size={20}/> : <Laptop size={20}/>}
                                        </div>
                                        <div>
                                            <p className="text-sm md:text-base font-bold text-gray-900 dark:text-white">Appearance</p>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={toggleTheme}
                                        className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-gray-700 dark:text-zinc-300 font-bold text-xs md:text-sm rounded-xl transition-all shadow-sm"
                                    >
                                        {themeMode === 'light' ? 'Light Mode' : themeMode === 'dark' ? 'Dark Mode' : 'System'}
                                    </button>
                                 </div>
                             )}

                             {/* Language Selection */}
                             <div className="flex items-center justify-between group">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-gray-50 dark:bg-zinc-800 flex items-center justify-center text-gray-400 dark:text-zinc-500 group-hover:text-primary transition-colors font-black text-lg">
                                        অ
                                    </div>
                                    <div>
                                        <p className="text-sm md:text-base font-bold text-gray-900 dark:text-white">Language</p>
                                    </div>
                                </div>
                                <div className="flex bg-gray-100 dark:bg-zinc-800 rounded-xl p-1 shadow-inner">
                                    <button 
                                         onClick={() => setLanguage('bn')}
                                        className={`px-4 py-2 text-xs md:text-sm font-bold rounded-lg transition-all ${language === 'bn' ? 'bg-white dark:bg-zinc-600 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:hover:text-zinc-300'}`}
                                    >
                                        বাংলা
                                    </button>
                                    <button 
                                         onClick={() => setLanguage('en')}
                                        className={`px-4 py-2 text-xs md:text-sm font-bold rounded-lg transition-all ${language === 'en' ? 'bg-white dark:bg-zinc-600 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:hover:text-zinc-300'}`}
                                    >
                                        English
                                    </button>
                                </div>
                             </div>

                             {/* Question Card Font Settings */}
                             <div className="pt-6 border-t border-gray-100 dark:border-zinc-800 space-y-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-gray-50 dark:bg-zinc-800 flex items-center justify-center text-gray-400 dark:text-zinc-500 transition-colors">
                                        <Type size={20} />
                                    </div>
                                    <div>
                                        <p className="text-sm md:text-base font-bold text-gray-900 dark:text-white">কোশ্চেন ডিসপ্লে</p>
                                    </div>
                                </div>
                                <div className="space-y-6 px-2 md:px-4 pb-2">
                                    {/* Preview */}
                                    <div className="bg-white dark:bg-zinc-950 p-5 md:p-6 rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-sm relative overflow-hidden pointer-events-none">
                                        <div className="flex justify-between items-start mb-3">
                                            <div className="flex items-start gap-3 w-full">
                                                <span className="font-bold text-gray-400 font-mono text-lg shrink-0 pt-0.5 leading-6 select-none">01.</span>
                                                <div className="flex-1 min-w-0 pt-0.5">
                                                    <h3 className={`font-semibold text-slate-900 dark:text-gray-50 leading-relaxed transition-all duration-300 ease-out ${questionFontSize === 'text-xl' ? 'text-[20px] md:text-[22px]' : questionFontSize === 'text-lg' ? 'text-[18px] md:text-[20px]' : 'text-[17px] md:text-[19px]'} ${questionFont}`}>
                                                        নিচের কোনটি সঠিক?
                                                    </h3>
                                                </div>
                                            </div>
                                            <div className="flex gap-2 shrink-0 ml-2">
                                                <button className="p-1.5 rounded-lg transition-colors text-gray-400">
                                                    <Bookmark size={18} />
                                                </button>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pl-0 md:pl-10 mt-6">
                                            <div className="p-3 md:p-4 rounded-xl border border-gray-200 dark:border-zinc-800 flex items-center gap-3 bg-gray-50 dark:bg-zinc-900/50">
                                                 <div className="w-8 h-8 rounded-full border border-gray-300 dark:border-zinc-600 flex items-center justify-center text-sm font-bold shrink-0 text-gray-500 bg-white dark:bg-zinc-800">ক</div>
                                                 <div className={`flex-1 text-gray-700 dark:text-gray-300 font-medium transition-all duration-300 ease-out ${questionFontSize === 'text-xl' ? 'text-[17px]' : questionFontSize === 'text-lg' ? 'text-[16px]' : 'text-[15px]'} ${questionFont}`}>প্রথম অপশনটি</div>
                                            </div>
                                            <div className="p-3 md:p-4 rounded-xl border border-gray-200 dark:border-zinc-800 flex items-center gap-3 bg-gray-50 dark:bg-zinc-900/50">
                                                 <div className="w-8 h-8 rounded-full border border-gray-300 dark:border-zinc-600 flex items-center justify-center text-sm font-bold shrink-0 text-gray-500 bg-white dark:bg-zinc-800">খ</div>
                                                 <div className={`flex-1 text-gray-700 dark:text-gray-300 font-medium transition-all duration-300 ease-out ${questionFontSize === 'text-xl' ? 'text-[17px]' : questionFontSize === 'text-lg' ? 'text-[16px]' : 'text-[15px]'} ${questionFont}`}>দ্বিতীয় অপশনটি</div>
                                            </div>
                                        </div>
                                    </div>
                                    {/* Font Style Selector */}
                                    <div className="space-y-3 pt-2">
                                        <p className="text-xs font-bold text-gray-500 dark:text-zinc-400 uppercase">Font Style</p>
                                        <div className="flex gap-3">
                                            {(['font-noto', 'font-tiro'] as const).map((fontOption) => (
                                                <button
                                                    key={fontOption}
                                                    onClick={() => setQuestionFont(fontOption)}
                                                    className={`flex-1 py-3 px-2 flex flex-col items-center justify-center gap-1 rounded-xl transition-all border-2 ${questionFont === fontOption ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-400 text-orange-600 dark:text-orange-400 shadow-sm' : 'bg-white dark:bg-zinc-800 border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-zinc-300 shadow-sm hover:shadow'}`}
                                                >
                                                    <span className={`text-lg font-medium ${fontOption}`}>পরীক্ষাঙ্গন</span>
                                                    <span className="text-[10px] font-bold uppercase tracking-wider opacity-70">
                                                        {fontOption === 'font-noto' ? 'Modern' : 'Classic'}
                                                    </span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    {/* Size Selector */}
                                    <div className="space-y-4 pt-2">
                                        <div className="flex items-center justify-between">
                                            <p className="text-xs font-bold text-gray-500 dark:text-zinc-400 uppercase">Text Size</p>
                                            <span className="text-xs font-bold text-primary bg-orange-50 dark:bg-orange-900/20 px-2 py-0.5 rounded border border-orange-100 dark:border-orange-800/30">
                                                {questionFontSize === 'text-sm' ? 'Small' : questionFontSize === 'text-base' ? 'Normal' : questionFontSize === 'text-lg' ? 'Large' : 'Extra Large'}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-4 bg-gray-50 dark:bg-zinc-800/50 p-4 rounded-xl border border-gray-100 dark:border-zinc-800">
                                            <span className="text-sm font-medium text-gray-400 select-none">A</span>
                                            <input 
                                                type="range" 
                                                min="0" max="3" 
                                                value={questionFontSize === 'text-sm' ? 0 : questionFontSize === 'text-base' ? 1 : questionFontSize === 'text-lg' ? 2 : 3}
                                                onChange={(e) => {
                                                    const val = parseInt(e.target.value);
                                                    setQuestionFontSize(val === 0 ? 'text-sm' : val === 1 ? 'text-base' : val === 2 ? 'text-lg' : 'text-xl');
                                                }}
                                                className="w-full h-1.5 bg-gray-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer"
                                                style={{ accentColor: '#ff5200' }}
                                            />
                                            <span className="text-xl font-medium text-gray-400 select-none">A</span>
                                        </div>
                                    </div>
                                </div>
                             </div>

                             {/* Logout */}
                             <div className="pt-6 border-t border-gray-100 dark:border-zinc-800">
                                 <button 
                                     onClick={async () => {
                                         await logout();
                                         navigate('/auth');
                                     }}
                                     className="w-full flex items-center justify-center gap-3 py-4 bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-500 hover:bg-red-100 dark:hover:bg-red-900/20 font-black text-sm rounded-2xl transition-colors"
                                 >
                                     <LogOut size={18} strokeWidth={2.5}/>
                                     {t('nav_logout')}
                                 </button>
                             </div>
                         </div>
                     </div>
                </div>
            </motion.div>
        )}
      </div>
"""

new_lines = []
start_idx = -1
end_idx = -1

for i, line in enumerate(lines):
    if "SETTINGS TAB" in line and start_idx == -1:
        start_idx = i
    if "Deep Analysis Modal" in line and end_idx == -1:
        end_idx = i

if start_idx != -1 and end_idx != -1:
    new_lines = lines[:start_idx] + [new_settings_tab] + lines[end_idx:]
    with open('components/ProfilePage.tsx', 'w') as f:
        f.writelines(new_lines)
    print("Success")
else:
    print(f"Failed to find indices: {start_idx}, {end_idx}")

