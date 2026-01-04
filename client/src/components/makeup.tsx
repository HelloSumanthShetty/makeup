import { useState, useRef, useMemo, useCallback } from 'react';
import { ArrowLeft } from 'lucide-react';
import Sidebar from './Sidebar';
import ImageCanvas from './ImageCanvas';
import ControlPanel from './ControlPanel';
import { MAKEUP_DATA, type MakeupFeature } from '../data/makeupConstants';
import { supabase } from '../lib/supabase';

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
    const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
    const [resultImage, setResultImage] = useState<string | null>(null);
    const [sidebarMessage, setSidebarMessage] = useState<{ text: string; type?: 'success' | 'error' } | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const validTypes = ['image/jpeg', 'image/png'];
            if (!validTypes.includes(file.type)) {
                setErrorMessage('Please upload a valid image file (JPG, PNG)');
                setSidebarMessage({ text: 'Invalid file type. Please upload an image.', type: 'error' });
                e.target.value = ''; // Reset input
                return;
            }

            const maxSize = 10 * 1024 * 1024;
            if (file.size > maxSize) {
                setErrorMessage('Image is too large. Maximum size is 10MB.');
                setSidebarMessage({ text: 'Image too large. Max 10MB.', type: 'error' });
                e.target.value = '';
                return;
            }

            setUploadedFileName(file.name.split('.')[0]);
            const reader = new FileReader();
            reader.onload = (event) => {
                setUploadedImage(event.target?.result as string);
                setResultImage(null);
                setSidebarMessage(null);
                setErrorMessage(null);
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

    const generateMakeupPrompt = (): string => {
        const parts: string[] = [];

        allTabs.forEach(subCat => {
            subCat.features.forEach(feature => {
                const val = makeupState[feature.id];
                
                if (val !== undefined && val !== null && val !== feature.defaultValue) {
                    let valueLabel: string = String(val);

                    if (feature.type === 'color' && feature.colors) {
                        const colorMatch = feature.colors.find(c => c.hex === val);
                        valueLabel = colorMatch ? colorMatch.name : `custom color ${val}`;
                    }
                    if (feature.options) {
                        const opt = feature.options.find(o => o.value === val);
                        if (opt) valueLabel = opt.label || val;
                    }
                    if (feature.type === 'slider') {
                        valueLabel = `${Math.round(val * 100)}%`;
                    }

                    const subject = feature.label.toLowerCase();

                    // Special handling for slider/intensity types
                    if (feature.type === 'slider') {
                        parts.push(`apply ${valueLabel} intensity ${subCat.label.toLowerCase()}`);
                    } else if (subject === 'pattern' || subject === 'shape' || subject === 'style') {
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

    const subscribeToJob = useCallback((requestId: string) => {
        return new Promise<void>((resolve, reject) => {
            let isResolved = false;
            let channel: ReturnType<typeof supabase.channel> | null = null;

            const cleanup = () => {
                if (channel) {
                    channel.unsubscribe();
                    channel = null;
                }
            };

            const handleCompletion = (job: { status: string; result_url: string | null; error: string | null }) => {
                if (isResolved) return;

                if (job.status === 'COMPLETED') {
                    isResolved = true;
                    cleanup();
                    clearTimeout(timeoutId);
                    if (job.result_url) {
                        setResultImage(job.result_url);
                        setSidebarMessage({ text: 'Image saved to gallery!', type: 'success' });
                    }
                    resolve();
                } else if (job.status === 'FAILED') {
                    isResolved = true;
                    cleanup();
                    clearTimeout(timeoutId);
                    reject(new Error(job.error || 'Job failed on server.'));
                }
            };

            const timeoutId = setTimeout(() => {
                if (!isResolved) {
                    isResolved = true;
                    cleanup();
                    reject(new Error('Processing timed out.'));
                }
            }, 120000);

            const checkInitialState = async () => {
                try {
                    const { data: job } = await supabase
                        .from('jobs')
                        .select('status, result_url, error')
                        .eq('request_id', requestId)
                        .single();

                    if (job && (job.status === 'COMPLETED' || job.status === 'FAILED')) {
                        handleCompletion(job);
                        return true;
                    }
                } catch (err) {
                    console.error('Error checking initial job state:', err);
                }
                return false;
            };

            const setupSubscription = () => {
                channel = supabase
                    .channel(`job-${requestId}`)
                    .on(
                        'postgres_changes',
                        {
                            event: 'UPDATE',
                            schema: 'public',
                            table: 'jobs',
                            filter: `request_id=eq.${requestId}`
                        },
                        (payload) => {
                            const job = payload.new as { status: string; result_url: string | null; error: string | null };
                            handleCompletion(job);
                        }
                    )
                    .subscribe((status) => {
                        if (status === 'SUBSCRIBED') {
                            checkInitialState();
                        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
                            console.error('Realtime subscription error:', status);
                            setTimeout(() => {
                                if (!isResolved) checkInitialState();
                            }, 2000);
                        }
                    });
            };

            checkInitialState().then((alreadyDone) => {
                if (!alreadyDone && !isResolved) {
                    setupSubscription();
                }
            });
        });
    }, []);

    const handleEditPhoto = async () => {
        if (!uploadedImage) return;

        setIsProcessing(true);
        setSidebarMessage(null);
        setErrorMessage(null);

        const prompt = generateMakeupPrompt();
        console.log(prompt)
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/makeup/process`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
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
                return;
            }

            if (data.success && data.requestId) {
                await subscribeToJob(data.requestId);
            } else {
                throw new Error(data.message || 'Failed to upload job');
            }
        } catch (error: any) {
            console.error("Failed to process makeup:", error);
            setErrorMessage(error.message || "Something went wrong. Please try again.");
            setSidebarMessage({ text: error.message || "Something went wrong." });
        } finally {
            setIsProcessing(false);
        }
    };

    const renderFeatureControl = (feature: MakeupFeature) => {
        const valInState = makeupState[feature.id];
        const value = valInState !== undefined ? valInState : feature.defaultValue;

        switch (feature.type) {
            case 'color':
                return (
                    <div key={feature.id} className="space-y-3">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{feature.label}</label>
                        <div className="flex flex-wrap gap-3">
                            {feature.colors?.map((color) => (
                                <button
                                    key={color.hex}
                                    onClick={() => handleFeatureChange(feature.id, value === color.hex ? null : color.hex)}
                                    className={`w-8 h-8 rounded-full border-2 transition-all ${value === color.hex ? 'border-purple-600 scale-110 shadow-md' : 'border-transparent hover:scale-105'
                                        }`}
                                    style={{ backgroundColor: color.hex }}
                                    title={color.name}
                                />
                            ))}
                            <button
                                onClick={() => handleFeatureChange(feature.id, null)}
                                className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-lg text-gray-400 transition-all
                                    ${value === null
                                        ? 'border-purple-600 scale-110 shadow-md'
                                        : 'border-transparent hover:scale-105 bg-gray-50'
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
                                    onClick={() => handleFeatureChange(feature.id, value === opt.value ? null : opt.value)}
                                    className={`flex flex-col items-center gap-2 p-2 rounded-xl border-2 transition-all ${value === opt.value
                                        ? 'border-purple-600 bg-purple-50 text-purple-700'
                                        : 'border-slate-100 hover:border-slate-200 text-slate-600'
                                        }`}
                                >
                                    <div className="w-full h-8 rounded-lg bg-gray-200 overflow-hidden relative">
                                        {opt.render?.mask && (
                                            <img src={opt.render.mask} className="w-full h-full object-contain mix-blend-multiply" alt="" />
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
            <Sidebar />

            <div className="flex-1 flex flex-col h-full overflow-hidden relative">
                <div className="h-16 flex items-center px-8 border-b border-gray-50 md:border-none z-10">
                    <button
                        onClick={() => window.open("https://www.gostudio.ai/app/ai-tools", "_blank")}
                        className="flex items-center gap-2 text-purple-600 font-medium text-sm hover:text-purple-700 transition-colors"
                    >
                        <ArrowLeft size={16} />
                        Back to Tools
                    </button>
                </div>

                <div className="flex-1 flex overflow-hidden">
                    {/* Center Canvas */}
                    <ImageCanvas
                        uploadedImage={uploadedImage}
                        resultImage={resultImage}
                        onUpload={() => fileInputRef.current?.click()}
                        onFileChange={handleFileChange}
                        fileInputRef={fileInputRef}
                    />

                    <ControlPanel
                        makeupState={makeupState}
                        activeTabId={activeTabId}
                        setActiveTabId={setActiveTabId}
                        onFeatureChange={handleFeatureChange}
                        renderFeatureControl={renderFeatureControl}
                        uploadedImage={uploadedImage}
                        resultImage={resultImage}
                        uploadedFileName={uploadedFileName}
                        sidebarMessage={sidebarMessage}
                        errorMessage={errorMessage}
                        isProcessing={isProcessing}
                        onEditPhoto={handleEditPhoto}
                    />
                </div>
            </div>
        </div>
    );
};

export default Makeup;
