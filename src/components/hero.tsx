
import { TypeAnimation } from 'react-type-animation';

const Hero = () => {
    return (
        <div className="relative w-full max-w-7xl overflow-hidden mx-auto px-4 sm:px-6 lg:px-8 py-20 flex flex-col items-center justify-center text-center">
            
            <div className="absolute top-0 left-1/4 w-72 h-72 bg-rose-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
            <div className="absolute top-0 right-1/4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
            <div className="absolute -bottom-8 left-1/3 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>

            <div className="relative z-10 ">
                

                <h1 className="text-5xl md:text-8xl font-gold font-extrabold  mb-6 tracking-tight leading-tight">
                    <span className='text-shine   bg-clip-text text-transparent '> 

                    Perfect Your Look with <br />
                    </span>
                    <span className="bg-white bg-clip-text text-transparent">
                        <TypeAnimation
                            sequence={[
                                'AI Makeup',
                                1000,
                                'Digital Retouching',
                                1000,
                                'Virtual Glamour',
                                1000,
                                'Instant Beauty',
                                1000
                            ]}
                            wrapper="span"
                            speed={50}
                            repeat={Infinity}
                            cursor={true}
                        />
                    </span>
                </h1>

                <p className="mt-4 text-xl text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed">
                    Experience the magic of AI-powered beauty. Enhance your photos with professional makeup looks, flawless skin, and radiant styles in seconds.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                    <button className="px-8 py-4 bg-slate-900 text-white rounded-full font-semibold text-lg hover:bg-slate-800 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1">
                        Try AI Makeup
                    </button>
                    <button className="px-8 py-4 bg-white text-slate-700 rounded-full font-semibold text-lg border border-slate-200 hover:bg-slate-50 transition-all shadow-sm hover:shadow-md">
                        View Examples
                    </button>
                </div>

                <div className="mt-12 flex items-center justify-center gap-8 text-slate-400 grayscale opacity-70">
                </div>
            </div>
        </div>
    );
};

export default Hero;
