import { FlipWords } from "@/components/ui/flip-words";
import { Play } from "lucide-react";

export function Hero() {
    const words = ["Decisions", "Deals", "Result"];
    return (
        <div className="min-h-screen flex flex-col justify-center items-center leading-tight px-4 mt-40">
            <p className=" text-lg text-gray-500 mb-4">Powered by Cognir AI</p>
            <h1 className="text-[52px] mx-auto font-extrabold text-center">
                Smarter Text Analysis, <br />
                Faster <span className="relative inline-block">
                    <span className="absolute inset-0 bg-gradient-to-r from-cyan-200 via-purple-200 to-pink-200 blur-md -z-10 scale-90"></span>
                    <FlipWords words={words} />
                </span>
            </h1>
            <div className="flex gap-5 mt-8">
                <span className="px-8 py-3 bg-black text-white text-base rounded-lg shadow-lg inline-flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                    Available Now
                </span>
                <span className="px-8 py-3 inline-flex items-center gap-2 rounded-lg border-2 border-neutral-400 text-black font-semibold bg-white">
                    <Play size={16} />
                    Coming Soon
                </span>
            </div>
            <p className=" text-sm text-gray-500 mt-8">Get Started for free   -    No credit card required</p>
            <img src="/img/hero-image.png" alt="dashboard example" />
        </div>
    )
}