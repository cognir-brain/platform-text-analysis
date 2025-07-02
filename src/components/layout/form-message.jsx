import { TextHoverEffect } from "../ui/text-hover"
import { Mail } from "lucide-react"

export function EmailCard() {
    return (
        <section className="w-full mx-auto px-5 lg:px-0">
            <div className="bg-gray-950 dark p-6 md:p-10 rounded-b-3xl mx-auto flex flex-col gap-y-5 justify-center items-center relative">
                <TextHoverEffect text="COGNIR" />
                <h3 className="text-2xl md:text-3xl lg:text-4xl font-medium tracking-wide text-white text-center">Get the latest updates
                </h3>
                <h4 className="text-white font-light">Sign up for news on the latest innovations from Cognir A.</h4>
                <div className="max-w-2xl mx-auto w-full flex flex-row gap-y-2 items-center justify-center lg:justify-start gap-x-5 lg:gap-x-5 mt-5">
                    <div className="relative w-full mt-1">
                        <input type="email" id="input-6" className="bg-white/20 block w-full py-4 px-12 text-sm text-white border border-zinc-400/40 focus:outline-none rounded-xl placeholder:text-sm  focus:border-indigo-500/50" placeholder="Enter your email address" />
                        <span className="absolute inset-y-0 left-0 text-zinc-400/50 flex items-center justify-center ml-4">
                            <Mail strokeWidth={1.5} />
                        </span>
                    </div>
                    <button
                        className="bg-white w-1/5 hover:shadow-md focus:ring-2 focus:ring-indigo-500/50 ring-offset-2 ring-offset-[#EAE8FF] hover:drop-shadow transition duration-200 lg:w-1/3 text-zinc-800 text-xs lg:text-sm rounded-full py-4 font-medium">
                        Send Email
                    </button>
                </div>
            </div>
        </section>
    )
}