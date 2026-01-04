import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GripVertical } from 'lucide-react';

interface ComparisonSliderProps {
    beforeImage: string;
    afterImage: string;
}

const ComparisonSlider: React.FC<ComparisonSliderProps> = ({ beforeImage, afterImage }) => {
    const [sliderPosition, setSliderPosition] = useState(50);
    const [isDragging, setIsDragging] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const handleMove = useCallback((clientX: number) => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
        const percent = Math.max(0, Math.min((x / rect.width) * 100, 100));
        setSliderPosition(percent);
    }, []);

    const onMouseDown = () => setIsDragging(true);
    const onTouchStart = () => setIsDragging(true);

    useEffect(() => {
        const onMouseUp = () => setIsDragging(false);
        const onTouchEnd = () => setIsDragging(false);
        const onMouseMove = (e: MouseEvent) => isDragging && handleMove(e.clientX);
        const onTouchMove = (e: TouchEvent) => isDragging && handleMove(e.touches[0].clientX);

        if (isDragging) {
            window.addEventListener('mousemove', onMouseMove);
            window.addEventListener('mouseup', onMouseUp);
            window.addEventListener('touchmove', onTouchMove);
            window.addEventListener('touchend', onTouchEnd);
        }

        return () => {
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mouseup', onMouseUp);
            window.removeEventListener('touchmove', onTouchMove);
            window.removeEventListener('touchend', onTouchEnd);
        };
    }, [isDragging, handleMove]);

    return (
        <div
            ref={containerRef}
            className="relative w-full h-full select-none overflow-hidden group cursor-col-resize rounded-lg"
            onMouseDown={(e) => { onMouseDown(); handleMove(e.clientX); }}
            onTouchStart={(e) => { onTouchStart(); handleMove(e.touches[0].clientX); }}
        >
            {/* After Image (Background) - Positioned absolutely to match */}
            <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
                <img src={afterImage} alt="After" className="max-w-full max-h-full object-contain" />
            </div>

            {/* Overlay Label (After) */}
            <div className="absolute top-4 right-4 bg-black/70 text-white text-xs font-bold px-3 py-1 rounded-full z-10 pointer-events-none">
                After
            </div>

            {/* Before Image (Clipped) */}
            <div
                className="absolute inset-0 overflow-hidden flex items-center justify-center bg-gray-50 bg-white"
                style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
            >
                <img src={beforeImage} alt="Before" className="max-w-full max-h-full object-contain" />
                {/* Overlay Label (Before) */}
                <div className="absolute top-4 left-4 bg-black/70 text-white text-xs font-bold px-3 py-1 rounded-full z-10 pointer-events-none">
                    Before
                </div>
            </div>

            {/* Slider Handle */}
            <div
                className="absolute top-0 bottom-0 w-1 bg-white cursor-col-resize z-20 flex items-center justify-center shadow-lg"
                style={{ left: `${sliderPosition}%` }}
            >
                <div className="w-8 h-8 p-8 bg-white rounded-full shadow-md flex items-center justify-center -ml-[14px] text-slate-800 transform hover:scale-110 transition-transform">
                    <GripVertical  size={16} />
                </div>
            </div>
        </div>
    );
};

export default ComparisonSlider;
