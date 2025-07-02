import { ChartColumnBig, KeyRound, Folder, Search, Scroll, Glasses } from 'lucide-react';
import { HoverBorderGradient } from '../ui/hover-border-gradient';


export function FeatureCard() {
    return (
        <div className="container mx-auto max-w-5xl py-8 px-8 mb-20">
            <p className="text-center font-medium text-base text-gray-600 mb-4 uppercase">Smart & Accurate AI Text Analysis</p>
            <h1 className=" text-5xl font-normal text-center tracking-wider mb-4">Unlock Insights with</h1>
            <h1 className=" text-5xl font-normal text-center tracking-wider mb-2">AI-Powered Text Analysis</h1>
            <p className="text-center text-gray-600 mb-12 tracking-wider">Discover deep insights from text using advanced artificial intelligence. Our solution helps <br /> you identify patterns, understand sentiment, and extract key information automatically.</p>


            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7 feature-bg py-8">
                <HoverBorderGradient containerClassName={'rounded-lg'} className={'bg-white px-6 py-12 space-y-4 shadow-md '} as='div'>
                    <ChartColumnBig color='#18181B' size={42} strokeWidth={1.5} />
                    <h2 className="text-xl text-black mb-2">Smart & Accurate AI Text Analysis</h2>
                    <p className="text-gray-600 text-sm">Identifies sentiment (positive, negative, neutral) and emotions in text to understand user opinions and feelings.</p>
                </HoverBorderGradient>

                <HoverBorderGradient containerClassName={'rounded-lg'} className={'bg-white px-6 py-12 space-y-4 shadow-md '} as='div'>
                    <KeyRound color='#18181B' size={42} strokeWidth={1.5} />
                    <h2 className="text-xl text-black mb-2">Entity & Keyphrase <br /> Extraction</h2>
                    <p className="text-gray-600 text-sm">Extracts key entities (names, places, organizations) and important keywords to summarize information quickly.</p>
                </HoverBorderGradient>

                <HoverBorderGradient containerClassName={'rounded-lg'} className={'bg-white px-6 py-12 space-y-4 shadow-md '} as='div'>
                    <Folder color='#18181B' size={42} strokeWidth={1.5} />
                    <h2 className="text-xl mb-2 text-black">Topic & Category Classification</h2>
                    <p className="text-gray-600 text-sm">Detects main topics and classifies text into relevant categories for better organization and trend analysis.</p>
                </HoverBorderGradient>


                <HoverBorderGradient containerClassName={'rounded-lg'} className={'bg-white px-6 py-12 space-y-4 shadow-md '} as='div'>
                    <Search color='#18181B' size={42} strokeWidth={1.5} />
                    <h2 className="text-xl text-black mb-2">Bias & Stance <br /> Detection</h2>
                    <p className="text-gray-600 text-sm">Analyzes bias in text and determines whether it supports, opposes, or is neutral toward a claim.</p>
                </HoverBorderGradient>

                <HoverBorderGradient containerClassName={'rounded-lg'} className={'bg-white px-6 py-12 space-y-4 shadow-md '} as='div'>
                    <Scroll color='#18181B' size={42} strokeWidth={1.5} />
                    <h2 className="text-xl text-black mb-2">Summary & Relevance Scoring</h2>
                    <p className="text-gray-600 text-sm">Generates automatic summaries and evaluates text relevance to improve information retrieval efficiency.</p>
                </HoverBorderGradient>

                <HoverBorderGradient containerClassName={'rounded-lg'} className={'bg-white px-6 py-12 space-y-4 shadow-md '} as='div'>
                    <Glasses color='#18181B' size={42} strokeWidth={1.5} />
                    <h2 className="text-xl text-black mb-2">Reading Complexity & Language Style</h2>
                    <p className="text-gray-600 text-sm">Assesses text difficulty and analyzes writing style to ensure it fits the target audience.</p>
                </HoverBorderGradient>
            </div>
        </div>
    )
}