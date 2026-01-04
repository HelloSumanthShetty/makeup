import { Home, Image as ImageIcon, Layers, Sparkles, Wand2, LogOut, MessageSquare, Heart, PenTool, LayoutGrid } from 'lucide-react';

const Sidebar = () => {
    return (
        <div className="w-64 bg-white h-full border-r border-gray-100 hidden md:flex flex-col font-sans">
            
            <a href="/" className="flex items-center border-b-2 border-gray-200">
                <img
                    src="https://r1.gostudio.ai/public/final_Logo.svg"
                    alt="Studio.ai logo"
                    className="h-[40px] w-[120px]"
                />
            </a>
            
            <div className="flex-1  my-1 px-4 space-y-8 overflow-y-auto">
                
                <div>
                    <h3 className="text-xs font-bold text-slate-400 tracking-wider mb-3 px-3">Home</h3>
                    <div className="space-y-1">
                        <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-500 hover:text-slate-900 hover:bg-gray-50 transition-colors">
                            <Home size={20} strokeWidth={1.5} />
                            <span>Home</span>
                        </button>
                        <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-500 hover:text-slate-900 hover:bg-gray-50 transition-colors">
                            <ImageIcon size={20} strokeWidth={1.5} />
                            <span>My Album</span>
                        </button>
                        <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-500 hover:text-slate-900 hover:bg-gray-50 transition-colors">
                            <LayoutGrid size={20} strokeWidth={1.5} />
                            <span>All Packs</span>
                        </button>
                        <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-500 hover:text-slate-900 hover:bg-gray-50 transition-colors group">
                            <Sparkles size={20} strokeWidth={1.5} />
                            <span>Custom Photos</span>
                            <span className="ml-auto text-[10px] font-bold bg-[#6366F1] text-white px-2 py-0.5 rounded-md flex items-center gap-1">
                                <span className="mb-[1px]">👑</span> PRO
                            </span>
                        </button>
                    </div>
                </div>

                {/* Section: TOOLS */}
                <div>
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 px-3">Tools</h3>
                    <div className="space-y-1">
                        <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-500 hover:text-slate-900 hover:bg-gray-50 transition-colors">
                            <PenTool size={20} strokeWidth={1.5} />
                            <span>AI Editor</span>
                        </button>
                        <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-[#8B5CF6] hover:bg-purple-50 transition-colors">
                            <Wand2 size={20} strokeWidth={1.5} />
                            <span>AI Tools</span>
                        </button>
                    </div>
                </div>

                {/* Section: RESOURCES */}
                <div>
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 px-3">Resources</h3>
                    <div className="space-y-1">
                        <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-500 hover:text-slate-900 hover:bg-gray-50 transition-colors">
                            <Heart size={20} strokeWidth={1.5} />
                            <span>Become an Affiliate</span>
                        </button>
                        <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-500 hover:text-slate-900 hover:bg-gray-50 transition-colors">
                            <MessageSquare size={20} strokeWidth={1.5} />
                            <span>Feedback & Support</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="p-4 px-6 mb-2">
                <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-500 hover:text-slate-900 hover:bg-gray-50 transition-colors">
                    <LogOut size={20} strokeWidth={1.5} />
                    <span>Logout</span>
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
