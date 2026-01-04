import { useState, useRef, useMemo } from 'react';
import { Upload, ArrowLeft, Sparkles, LoaderCircle } from 'lucide-react';
import Sidebar from './Sidebar';
import { MAKEUP_DATA, type MakeupFeature } from '../data/makeupConstants';

const Makeup = () => {
    const [uploadedImage, setUploadedImage] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    // Flatten logic: Get all subcategories across all main categories to use as tabs
    const allTabs = useMemo(() => {
        return MAKEUP_DATA.flatMap(mainCat =>
            mainCat.subCategories.map(subCat => ({
                ...subCat,
                mainCategoryLabel: mainCat.label,
                icon: mainCat.icon
            }))
        );
    }, []);

    const [activeTabId, setActiveTabId] = useState<string>(allTabs[0]?.id || 'eyeshadow');
    const [makeupState, setMakeupState] = useState<Record<string, any>>({});
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const activeTab = allTabs.find(t => t.id === activeTabId);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                setUploadedImage(event.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleFeatureChange = (featureId: string, value: any) => {
        setMakeupState(prev => ({
            ...prev,
            [featureId]: value
        }));
    };

    // Construct natural language prompt
    const generateMakeupPrompt = (): string => {
        const parts: string[] = [];

        allTabs.forEach(subCat => {
            subCat.features.forEach(feature => {
                const val = makeupState[feature.id];
                if (val && val !== feature.defaultValue) {
                    // Try to find a human-readable label for the value if possible
                    let valueLabel = val;
                    if (feature.type === 'color' && feature.colors) {
                        // Simplify color values to generic names if exact match found (optional, 
                        // but for "color" hex might be tricky for LLM unless it understands hex)
                        // For now, simpler: "add [hex] [feature label] to the image" might be weird.
                        // But user specifically asked for "add thick eye brows".
                        // Let's rely on option label if available
                        valueLabel = "custom color " + val;
                    }
                    if (feature.options) {
                        const opt = feature.options.find(o => o.value === val);
                        if (opt) valueLabel = opt.label || val;
                    }

                    // Specific logic for sliders
                    if (feature.type === 'slider') {
                        valueLabel = `${val * 100}% intensity`;
                    }

                    // For patterns/styles, usually "value" is descriptive enough or mapped to label
                    // Example: "add thick eye brows"
                    // Feature: id="eyebrow_shape", label="Shape" (of eyebrows)
                    // If subcat is "Eyebrows", we want to say "add [value] eyebrows".

                    // Heuristic: Use valueLabel + subCategory Label (if feature label is generic like "Shape" or "Style")
                    const subject = feature.label.toLowerCase();
                    if (subject === 'pattern' || subject === 'shape' || subject === 'style') {
                        parts.push(`add ${valueLabel} ${subCat.label.toLowerCase()}`);
                    } else if (subject === 'color' || subject === 'shade') {
                        parts.push(`change ${subCat.label.toLowerCase()} color to ${valueLabel}`);
                    } else {
                        parts.push(`set ${feature.label.toLowerCase()} to ${valueLabel}`);
                    }
                }
            });
        });

        if (parts.length === 0) return "enhance the portrait with natural makeup";
        return parts.join(" and ") + " to the image";
    };

    const pollStatus = async (requestId: string) => {
        const pollInterval = 1000; // 1 second
        const maxAttempts = 60; // 1 minute timeout roughly
        let attempts = 0;

        while (attempts < maxAttempts) {
            try {
                const response = await fetch(`http://localhost:5000/api/makeup/status/${requestId}`);
                const data = await response.json();

                if (data.status === 'COMPLETED') {
                    if (data.resultUrl) {
                        // Success!
                        // For this demo we are just logging, but ideally we show the result.
                        // I'll assume we wanted to swap the uploaded image or show a comparison.
                        // Since I don't have a comparison view state yet, I'll just log it 
                        // and maybe replace the uploadedImage to show the result? 
                        // The user flow is "Edit Photo" -> modifies the photo. 
                        // Let's replace the current view or just log for now as per previous code style.
                        console.log("Makeup COMPLETED:", data.resultUrl);
                        // Optional: Visualize result - replacing uploadedImage to show it worked
                        setUploadedImage(data.resultUrl);
                    }
                    return;
                } else if (data.status === 'FAILED') {
                    throw new Error("Job failed on server.");
                }

                // If IN_QUEUE or IN_PROGRESS, wait and retry
                await new Promise(resolve => setTimeout(resolve, pollInterval));
                attempts++;
            } catch (error) {
                console.error("Polling error:", error);
                throw error; // Re-throw to be caught by main handler
            }
        }
        throw new Error("Processing timed out.");
    };

    const handleEditPhoto = async () => {
        if (!uploadedImage) return;

        setIsProcessing(true);
        setErrorMessage(null);

        const prompt = generateMakeupPrompt();
        console.log("Generated Prompt:", prompt);

        try {
            // Step 1: Submit Job
            const response = await fetch('http://localhost:5000/api/makeup/process', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    image: uploadedImage,
                    style: 'Custom',
                    intensity: 'Custom',
                    prompt: prompt
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to submit job');
            }

            if (data.mock) {
                console.log("Mock success:", data);
                return;
            }

            if (data.success && data.requestId) {
                console.log("Job Submitted. Request ID:", data.requestId);
                // Step 2: Poll for Status
                await pollStatus(data.requestId);
            } else {
                throw new Error(data.message || 'Failed to submit job');
            }
        } catch (error: any) {
            console.error("Failed to process makeup:", error);
            setErrorMessage(error.message || "Something went wrong. Please try again.");
        } finally {
            setIsProcessing(false);
        }
    };

    const renderFeatureControl = (feature: MakeupFeature) => {
        const value = makeupState[feature.id] ?? feature.defaultValue;

        switch (feature.type) {
            case 'color':
                return (
                    <div key={feature.id} className="space-y-3">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{feature.label}</label>
                        <div className="flex flex-wrap gap-3">
                            {feature.colors?.map((color) => (
                                <button
                                    key={color}
                                    onClick={() => handleFeatureChange(feature.id, color)}
                                    className={`w-8 h-8 rounded-full border-2 transition-all ${value === color ? 'border-purple-600 scale-110 shadow-md' : 'border-transparent hover:scale-105'
                                        }`}
                                    style={{ backgroundColor: color }}
                                    title={color}
                                />
                            ))}
                            {/* Clear/None option */}
                            <button
                                onClick={() => handleFeatureChange(feature.id, null)}
                                className={`w-8 h-8 rounded-full border-2 flex items-center justify-center bg-gray-50 transition-all ${value === null ? 'border-red-400 text-red-400' : 'border-gray-200 text-gray-400'
                                    }`}
                                title="None"
                            >
                                <div className="w-full h-[1px] bg-current rotate-45" />
                            </button>
                        </div>
                    </div>
                );

            case 'pattern':
            case 'select':
                return (
                    <div key={feature.id} className="space-y-3">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{feature.label}</label>
                        <div className="grid grid-cols-3 gap-3">
                            {feature.options?.map((opt) => (
                                <button
                                    key={opt.id}
                                    onClick={() => handleFeatureChange(feature.id, opt.value)}
                                    className={`flex flex-col items-center gap-2 p-2 rounded-xl border-2 transition-all ${value === opt.value
                                        ? 'border-purple-600 bg-purple-50 text-purple-700'
                                        : 'border-slate-100 hover:border-slate-200 text-slate-600'
                                        }`}
                                >
                                    {/* Placeholder visual if thumbnail missing */}
                                    <div className="w-full h-8 rounded-lg bg-gray-200  overflow-hidden relative">
                                        {opt.render?.mask && (
                                            <img src={opt.render.mask} className="w-full h-full object-cover opacity-50 mix-blend-multiply" alt="" />
                                        )}
                                    </div>
                                    <span className="text-[10px] font-bold text-center leading-tight">{opt.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                );

            case 'slider':
                return (
                    <div key={feature.id} className="space-y-3">
                        <div className="flex justify-between items-center">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{feature.label}</label>
                            <span className="text-xs font-medium text-slate-700">{Math.round((value || 0) * 100)}%</span>
                        </div>
                        <input
                            type="range"
                            min={feature.min}
                            max={feature.max}
                            step={feature.step}
                            value={value || 0}
                            onChange={(e) => handleFeatureChange(feature.id, parseFloat(e.target.value))}
                            className="w-full h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-purple-600"
                        />
                    </div>
                )

            default:
                return null;
        }
    };

    return (
        <div className="flex h-screen bg-white overflow-hidden font-sans text-slate-900">
            {/* 1. Left Sidebar */}
            <Sidebar />

            <div className="flex-1 flex flex-col h-full overflow-hidden relative">
                {/* Header / Back Link - Floating or top area */}
                <div className="h-16 flex items-center px-8 border-b border-gray-50 md:border-none z-10">
                    <button onClick={() => { window.open("https://www.gostudio.ai/app/ai-tools", "_blank") }} className="flex items-center gap-2 text-purple-600 font-medium text-sm hover:text-purple-700 transition-colors">
                        <ArrowLeft size={16} />
                        Back to Tools
                    </button>
                </div>

                <div className="flex-1 flex overflow-hidden">
                    {/* 2. Center Canvas */}
                    <div className="flex-1 p-8 pt-0 flex flex-col min-w-0">

                        {/* Error Alert */}
                        {errorMessage && (
                            <div className="mb-4 bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" x2="12" y1="8" y2="12" /><line x1="12" x2="12.01" y1="16" y2="16" /></svg>
                                <span className="text-sm font-medium">{errorMessage}</span>
                            </div>
                        )}

                        <div className="flex-1 border-2 border-dashed border-purple-200 rounded-sm bg-white relative flex items-center justify-center overflow-hidden transition-all hover:border-purple-300">
                            {uploadedImage ? (
                                <div className="relative w-full h-full flex items-center justify-center bg-gray-50/50 p-4">
                                    <img
                                        src={uploadedImage}
                                        className="max-h-full max-w-full object-contain rounded-sm shadow-sm"
                                        alt="Uploaded portrait"
                                    />
                                    <button
                                     onClick={() => fileInputRef.current?.click()}

                                        className="absolute top-0 right-4 bg-white/80 backdrop-blur text-black px-3 p-2 rounded-xl drop-shadow-lg transition-colors"
                                    >
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                className="hidden"
                            />
                                        Change Photo
                                    </button>
                                </div>
                            ) : (
                                <div
                                    className="text-center cursor-pointer p-12"
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    <div className="w-16 h-16 mx-auto mb-6 text-gray-300">
                                        <Upload size={64} strokeWidth={1.5} />
                                    </div>
                                    <h3 className="text-xl font-medium text-slate-700 mb-2">Upload a portrait photo</h3>
                                    <p className="text-slate-400 text-sm">Click to browse or drag and drop</p>
                                </div>
                            )}

                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                className="hidden"
                            />
                        </div>
                    </div>

                    {/* 3. Right Panel - Dynamic Controls */}
                    <div className="w-[400px] bg-white h-full border-l border-gray-100 flex flex-col overflow-hidden">

                        <div className="p-6 pb-2 border-b border-gray-50 bg-white z-10">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center">
                                    <Sparkles size={18} />
                                </div>
                                <h2 className="text-xl font-bold text-slate-900">Makeup Studio</h2>
                            </div>
                        </div>

                        {/* Tabs (Subcategories flattened) */}
                        <div className="flex flex-wrap gap-2 p-4 px-6 bg-white border-b border-gray-50 max-h-[140px] overflow-y-auto">
                            {allTabs.map(tab => {
                                const Icon = tab.icon || Sparkles;
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTabId(tab.id)}
                                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold transition-all border ${activeTabId === tab.id
                                            ? 'bg-slate-900 text-white border-slate-900 shadow-md'
                                            : 'bg-white text-slate-500 border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                            }`}
                                    >
                                        <Icon size={14} className={activeTabId === tab.id ? 'text-purple-300' : 'text-slate-400'} />
                                        {tab.label}
                                    </button>
                                )
                            })}
                        </div>

                        {/* Features Scroll Area */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-8">
                            {activeTab ? (
                                <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-lg font-bold text-slate-800">{activeTab.label}</h3>
                                        <span className="text-xs font-medium text-slate-400 px-2 py-1 bg-gray-100 rounded-md">
                                            {activeTab.mainCategoryLabel}
                                        </span>
                                    </div>

                                    <div className="space-y-6">
                                        {activeTab.features.map(feature => renderFeatureControl(feature))}
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center text-slate-400 py-12">
                                    Select a category to customize
                                </div>
                            )}
                        </div>

                        {/* Action Button */}
                        <div className="p-6 border-t border-gray-50 bg-white">
                            <button
                                onClick={handleEditPhoto}
                                disabled={isProcessing || !uploadedImage}
                                className={`w-full py-4 rounded-xl font-bold text-lg shadow-sm transition-all active:scale-[0.98] flex items-center justify-center gap-2
                                    ${isProcessing || !uploadedImage
                                        ? 'bg-[#BFA3FF] text-gray-100 cursor-not-allowed'
                                        : 'bg-[#814bff] hover:bg-[#692df4] text-white shadow-[#BFA3FF]/30'
                                    }`}
                            >
                                {isProcessing ? (
                                    <>
                                        <LoaderCircle size={20} className="animate-spin" />
                                        Applying makeup...
                                    </>
                                ) : (
                                    <>
                                        Edit photo
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default Makeup;
