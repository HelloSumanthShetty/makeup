

const Makeup = () => {
    return (
        <div className="w-full max-w-[1200px] bg-white rounded-[32px] shadow-sm p-8 md:p-12 min-h-[600px] flex gap-8">
            <div className="flex-1 flex flex-col gap-6">
                <div className="h-full border-2 border-dashed border-gray-100 rounded-2xl flex items-center justify-center text-gray-300">
                    Content Area
                </div>
            </div>

            <div className="flex-1 hidden md:flex flex-col gap-6">
                <div className="h-full border-2 border-dashed border-gray-100 rounded-2xl flex items-center justify-center text-gray-300">
                    Controls Area
                </div>
            </div>
        </div>
    );
};

export default Makeup;
