import { Upload } from 'lucide-react';
import ComparisonSlider from './ComparisonSlider';

interface ImageCanvasProps {
    uploadedImage: string | null;
    resultImage: string | null;
    onUpload: () => void;
    onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    fileInputRef: React.RefObject<HTMLInputElement | null>;
}

const ImageCanvas = ({
    uploadedImage,
    resultImage,
    onUpload,
    onFileChange,
    fileInputRef
}: ImageCanvasProps) => {
    return (
        <div className="flex-1 p-8 pt-0 flex flex-col min-w-0">
            <div className="flex-1 border-2 border-dashed border-purple-200 rounded-sm bg-white relative flex items-center justify-center overflow-hidden transition-all hover:border-purple-300">
                {resultImage && uploadedImage ? (
                    <div className="w-full h-full relative">
                        <ComparisonSlider beforeImage={uploadedImage} afterImage={resultImage} />
                        <button
                            onClick={onUpload}
                            className="absolute top-4 right-20 bg-white/90 backdrop-blur text-slate-800 px-4 py-2 rounded-xl shadow-lg text-xs font-bold hover:bg-white transition-colors z-30"
                        >
                            Change Photo
                        </button>
                    </div>
                ) : uploadedImage ? (
                    <div className="relative w-full h-full flex items-center justify-center bg-gray-50/50 p-4">
                        <img
                            src={uploadedImage}
                            className="max-h-full max-w-full object-contain rounded-sm shadow-sm"
                            alt="Uploaded portrait"
                        />
                        <button
                            onClick={onUpload}
                            className="absolute top-0 right-4 bg-white/80 backdrop-blur text-black px-3 p-2 rounded-xl drop-shadow-lg transition-colors"
                        >
                            Change Photo
                        </button>
                    </div>
                ) : (
                    <div
                        className="text-center cursor-pointer p-12"
                        onClick={onUpload}
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
                    onChange={onFileChange}
                    className="hidden"
                />
            </div>
        </div>
    );
};

export default ImageCanvas;
