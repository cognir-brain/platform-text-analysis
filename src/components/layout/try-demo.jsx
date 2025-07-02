import { SquareArrowOutUpRight } from "lucide-react"
import Link from "next/link"

export function TryDemo() {
    return (
        <div className="mx-auto max-w-5xl" id="demo">
            <h1 className="font-bold text-4xl text-center mb-4">Text Analysis Demo</h1>
            <p className="text-center text-gray-600 tracking-wider mb-4">Gain deep insights from your text using advanced AI. Analyze sentiment, <br /> extract key phrases, detect topics, and summarize content—all in one tool </p>

            <Link href="/analysis" className="px-4 py-2 w-32 rounded-full mx-auto flex gap-3 items-center border border-neutral-600 text-black bg-white hover:bg-gray-100 transition duration-200">
                Try App  <SquareArrowOutUpRight strokeWidth={1.5} size={16} />
            </Link>

            <img src="/img/demo-img.png" alt="demo" />
        </div>
    )
}