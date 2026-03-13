import React, { useState, useEffect, useMemo } from 'react';
import { createAvatar } from '@dicebear/core';
import { adventurer } from '@dicebear/collection';
import { Shuffle, Save, User, Smile, Palette, Glasses } from 'lucide-react';

interface AvatarCreatorProps {
    initialSeed?: string;
    onSave: (dataUri: string) => void;
    onCancel?: () => void;
}

const AvatarCreator: React.FC<AvatarCreatorProps> = ({ initialSeed, onSave, onCancel }) => {
    // We'll use a seed string to generate the avatar, but also allow fine-tuning specific options
    // For simplicity in this UI, we'll expose key options that map to the adventurer style
    
    const [options, setOptions] = useState<any>({
        seed: initialSeed || Math.random().toString(36).substring(7),
        radius: 50,
        backgroundColor: ['b6e3f4','c0aede','d1d4f9','ffd5dc','ffdfbf'],
        backgroundType: ['gradientLinear', 'solid'],
    });

    // Specific customization state
    // Adventurer style options
    const [activeCategory, setActiveCategory] = useState<'base' | 'hair' | 'face' | 'accessories'>('base');

    // Options lists (simplified for UI)
    const skinColors = ['ecad80', 'f2d3b1', '9e5622', '763900', 'f9c9b6', 'ac6651'];
    const hairColors = ['0e0e0e', '855a39', 'e19643', 'fdd160', '582617', 'ffffff'];
    
    // These are actually option keys in the adventurer collection
    const hairStyles = ['short01', 'short02', 'short03', 'short04', 'short05', 'short06', 'short07', 'short08', 'long01', 'long02', 'long03', 'long04', 'long05', 'long06', 'long07', 'long08'];
    const eyesStyles = ['variant01', 'variant02', 'variant03', 'variant04', 'variant05', 'variant06', 'variant07', 'variant08', 'variant09', 'variant10'];
    const mouthStyles = ['variant01', 'variant02', 'variant03', 'variant04', 'variant05', 'variant06', 'variant07', 'variant08', 'variant09', 'variant10'];
    const glassesStyles = ['variant01', 'variant02', 'variant03', 'variant04', 'variant05', 'variant06', 'variant07', 'variant08'];

    // Generate avatar SVG
    const avatarSvg = useMemo(() => {
        const avatar = createAvatar(adventurer, {
            ...options,
            size: 128,
        });
        return avatar.toDataUri();
    }, [options]);

    const handleRandomize = () => {
        setOptions((prev: any) => ({
            ...prev,
            seed: Math.random().toString(36).substring(7),
            // Reset specific overrides to let seed drive them, or randomize them too
            hair: undefined,
            eyes: undefined,
            mouth: undefined,
            glasses: undefined,
            skinColor: [skinColors[Math.floor(Math.random() * skinColors.length)]],
        }));
    };

    const updateOption = (key: string, value: any) => {
        setOptions((prev: any) => ({
            ...prev,
            [key]: value
        }));
    };

    const handleSave = () => {
        onSave(avatarSvg);
    };

    const renderColorPicker = (label: string, key: string, colors: string[]) => (
        <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase">{label}</label>
            <div className="flex flex-wrap gap-2">
                {colors.map(color => (
                    <button
                        key={color}
                        onClick={() => updateOption(key, [color])}
                        className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${options[key]?.[0] === color ? 'border-primary ring-2 ring-primary/20' : 'border-transparent'}`}
                        style={{ backgroundColor: `#${color}` }}
                    />
                ))}
            </div>
        </div>
    );

    const renderAssetGrid = (label: string, key: string, assets: string[]) => (
        <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase">{label}</label>
            <div className="grid grid-cols-4 gap-2">
                <button
                    onClick={() => updateOption(key, undefined)} // Random/Default
                    className={`aspect-square rounded-xl border-2 flex items-center justify-center text-xs font-bold text-gray-400 ${!options[key] ? 'border-primary bg-primary/5 text-primary' : 'border-gray-200 dark:border-gray-700'}`}
                >
                    Auto
                </button>
                {assets.map((asset, idx) => (
                    <button
                        key={asset}
                        onClick={() => updateOption(key, [asset])}
                        className={`aspect-square rounded-xl border-2 overflow-hidden transition-all ${options[key]?.[0] === asset ? 'border-primary ring-2 ring-primary/20' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'}`}
                    >
                        {/* We render a mini avatar to show the asset */}
                        <img 
                            src={createAvatar(adventurer, { 
                                seed: 'preview', 
                                [key]: [asset],
                                backgroundType: ['solid'],
                                backgroundColor: ['f0f0f0']
                            }).toDataUri()} 
                            alt={asset}
                            className="w-full h-full object-cover"
                        />
                    </button>
                ))}
            </div>
        </div>
    );

    return (
        <div className="flex flex-col h-full max-h-[600px]">
            {/* Preview Area */}
            <div className="flex-shrink-0 bg-gray-50 dark:bg-gray-800/50 p-6 flex flex-col items-center justify-center border-b border-gray-100 dark:border-gray-800 relative">
                <div className="w-40 h-40 rounded-full border-4 border-white dark:border-gray-700 shadow-xl overflow-hidden bg-white relative group">
                    <img src={avatarSvg} alt="Avatar Preview" className="w-full h-full object-cover" />
                    <button 
                        onClick={handleRandomize}
                        className="absolute bottom-2 right-2 p-2 bg-white dark:bg-gray-800 rounded-full shadow-lg border border-gray-200 dark:border-gray-700 hover:scale-110 transition-transform text-gray-600 dark:text-gray-300"
                        title="Randomize"
                    >
                        <Shuffle size={16} />
                    </button>
                </div>
            </div>

            {/* Controls Area */}
            <div className="flex-1 flex flex-col min-h-0">
                {/* Tabs */}
                <div className="flex border-b border-gray-100 dark:border-gray-800 overflow-x-auto">
                    <button 
                        onClick={() => setActiveCategory('base')}
                        className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 border-b-2 transition-colors ${activeCategory === 'base' ? 'border-primary text-primary' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
                    >
                        <User size={14}/> Base
                    </button>
                    <button 
                        onClick={() => setActiveCategory('hair')}
                        className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 border-b-2 transition-colors ${activeCategory === 'hair' ? 'border-primary text-primary' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
                    >
                        <Palette size={14}/> Hair
                    </button>
                    <button 
                        onClick={() => setActiveCategory('face')}
                        className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 border-b-2 transition-colors ${activeCategory === 'face' ? 'border-primary text-primary' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
                    >
                        <Smile size={14}/> Face
                    </button>
                    <button 
                        onClick={() => setActiveCategory('accessories')}
                        className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 border-b-2 transition-colors ${activeCategory === 'accessories' ? 'border-primary text-primary' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
                    >
                        <Glasses size={14}/> Extras
                    </button>
                </div>

                {/* Options */}
                <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
                    {activeCategory === 'base' && (
                        <>
                            {renderColorPicker('Skin Tone', 'skinColor', skinColors)}
                            {renderColorPicker('Background Color', 'backgroundColor', ['b6e3f4','c0aede','d1d4f9','ffd5dc','ffdfbf', 'ffffff', 'e0e0e0'])}
                        </>
                    )}

                    {activeCategory === 'hair' && (
                        <>
                            {renderAssetGrid('Hair Style', 'hair', hairStyles)}
                            {renderColorPicker('Hair Color', 'hairColor', hairColors)}
                        </>
                    )}

                    {activeCategory === 'face' && (
                        <>
                            {renderAssetGrid('Eyes', 'eyes', eyesStyles)}
                            {renderAssetGrid('Mouth', 'mouth', mouthStyles)}
                            {renderColorPicker('Eyebrow Color', 'eyebrowsColor', hairColors)}
                        </>
                    )}

                    {activeCategory === 'accessories' && (
                        <>
                            {renderAssetGrid('Glasses', 'glasses', glassesStyles)}
                        </>
                    )}
                </div>
            </div>

            {/* Footer Actions */}
            <div className="p-4 border-t border-gray-100 dark:border-gray-800 flex gap-3">
                {onCancel && (
                    <button 
                        onClick={onCancel}
                        className="px-6 py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                        Cancel
                    </button>
                )}
                <button 
                    onClick={handleSave}
                    className="flex-1 py-3 bg-primary hover:bg-blue-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 active:scale-95 transition-all"
                >
                    <Save size={18} /> Save Avatar
                </button>
            </div>
        </div>
    );
};

export default AvatarCreator;
