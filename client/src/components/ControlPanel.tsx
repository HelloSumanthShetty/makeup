import { Sparkles, LoaderCircle } from 'lucide-react';
import { MAKEUP_DATA, type MakeupFeature } from '../data/makeupConstants';
import { useMemo } from 'react';

interface ControlPanelProps {
    makeupState: Record<string, any>;
    activeTabId: string;
    setActiveTabId: (id: string) => void;
    onFeatureChange: (featureId: string, value: any) => void;
    renderFeatureControl: (feature: MakeupFeature) => React.ReactNode;
    uploadedImage: string | null;
    resultImage: string | null;
    uploadedFileName: string | null;
    sidebarMessage: { text: string; type?: 'success' | 'error' } | null;
    errorMessage: string | null;
    isProcessing: boolean;
    onEditPhoto: () => void;
}

const ControlPanel = ({
    makeupState,
    activeTabId,
    setActiveTabId,
    renderFeatureControl,
    uploadedImage,
    resultImage,
    uploadedFileName,
    sidebarMessage,
    errorMessage,
    isProcessing,
    onEditPhoto
}: ControlPanelProps) => {
    const allTabs = useMemo(() => {
        return MAKEUP_DATA.flatMap(mainCat =>
            mainCat.subCategories.map(subCat => ({
                ...subCat,
                mainCategoryLabel: mainCat.label,
                icon: mainCat.icon
            }))
        );
    }, []);

    const activeTab = allTabs.find(t => t.id === activeTabId);

    return (
        <div className="w-[400px] bg-white h-full border-l border-gray-100 flex flex-col overflow-hidden">
            {/* Header */}
            <div className="p-6 pb-2 border-b border-gray-50 bg-white z-10">
                <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center">
                        <Sparkles size={18} />
                    </div>
                    <h2 className="text-xl font-bold text-slate-900">Makeup Studio</h2>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex flex-wrap gap-2 p-4 px-6 bg-white border-b border-gray-50 max-h-[140px] overflow-y-auto">
                {allTabs.map(tab => {
                    const Icon = tab.icon || Sparkles;
                    const hasActiveFeature = tab.features.some(f => {
                        const val = makeupState[f.id];
                        return val !== undefined && val !== null && val !== f.defaultValue;
                    });
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTabId(tab.id)}
                            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold transition-all border ${activeTabId === tab.id
                                ? 'bg-slate-900 text-white border-slate-900 shadow-md'
                                : hasActiveFeature
                                    ? 'bg-purple-50 text-slate-700 border-[#692df4]'
                                    : 'bg-white text-slate-500 border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                }`}
                        >
                            <Icon size={14} className={activeTabId === tab.id ? 'text-purple-300' : 'text-slate-400'} />
                            {tab.label}
                        </button>
                    )
                })}
            </div>

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
                ) : ""}

                {/* Before/After Example */}
                {resultImage && (
                    <div className="mt-8 border-t border-gray-100 pt-6">
                        <h4 className="text-sm font-bold text-slate-800 mb-3">Example of makeup changer:</h4>
                        <div className="relative rounded-xl overflow-hidden border border-gray-200 aspect-video bg-gray-100 flex">
                            <div className="relative w-1/2 h-full overflow-hidden border-r border-white/20">
                                <img src={uploadedImage || ''} alt="Before" className="absolute inset-0 w-full h-full object-cover" />
                                <div className="absolute top-2 left-2 bg-black/70 text-white text-[10px] px-2 py-0.5 rounded-full z-10">Before</div>
                            </div>
                            <div className="relative w-1/2 h-full overflow-hidden">
                                <img src={resultImage || ''} alt="After" className="absolute inset-0 w-full h-full object-cover" />
                                <div className="absolute top-2 right-2 bg-black/70 text-white text-[10px] px-2 py-0.5 rounded-full z-10">After</div>
                            </div>
                        </div>
                    </div>
                )}

                
                {(sidebarMessage || errorMessage) && (
                    <div className={`mt-6 p-4 rounded-xl text-sm animate-in fade-in slide-in-from-bottom-2 ${(sidebarMessage?.type === 'success')
                        ? 'bg-green-50 text-green-700 border border-green-100'
                        : 'bg-red-50 text-red-600 border border-red-100'
                        }`}>
                        {(sidebarMessage?.type === 'success') ? (
                            <>
                                <p className="font-bold mb-1">Image saved to gallery!</p>
                                <p>5 credits deducted from your account.</p>
                                <button
                                    onClick={() => window.open('https://www.gostudio.ai/app/dashboard', '_blank')}
                                    className="block mt-2 underline opacity-80 hover:opacity-100"
                                >
                                    View in Dashboard Gallery
                                </button>
                            </>
                        ) : (
                            <p className="font-medium">{errorMessage || sidebarMessage?.text}</p>
                        )}
                    </div>
                )}
            </div>

            {/* Action Buttons */}
            <div className="p-6 border-t border-gray-50 bg-white">
                <button
                    onClick={onEditPhoto}
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
                    ) : resultImage ? (
                        <>Apply Different Style</>
                    ) : (
                        <>Edit photo</>
                    )}
                </button>

                {resultImage && !isProcessing && (
                    <button
                        onClick={async () => {
                            if (!resultImage) return;
                            try {
                                const response = await fetch(resultImage);
                                const blob = await response.blob();
                                const url = window.URL.createObjectURL(blob);
                                const link = document.createElement('a');
                                link.href = url;
                                link.download = `makeup-${uploadedFileName || 'result'}.png`;
                                document.body.appendChild(link);
                                link.click();
                                document.body.removeChild(link);
                                window.URL.revokeObjectURL(url);
                            } catch (error) {
                                console.error('Download failed:', error);
                                window.open(resultImage, '_blank');
                            }
                        }}
                        className="w-full mt-3 py-4 rounded-xl font-bold text-lg border-2 border-[#814bff] text-[#692df4] transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                    >
                        Download Result
                    </button>
                )}

                {isProcessing && (
                    <div className="mt-3 p-3 bg-purple-50 rounded-xl flex items-center justify-center gap-2 text-purple-600 animate-in fade-in slide-in-from-bottom-2">
                        <Sparkles size={16} className="animate-pulse" />
                        <span className="text-xs font-medium">AI is transforming your photo...</span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ControlPanel;
