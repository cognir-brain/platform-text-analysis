import { CardFlow } from "./card-flow";
import { HoverBorderGradient } from "../ui/hover-border-gradient";

export function TechMap() {
    return (

        <div className="container mx-auto max-w-5xl py-8 mb-20">
            {/* <img src="/img/gradient-blur2.png" alt="gradient" className="mx-auto" /> */}
            {/* <h1 className="text-5xl font-normal text-center tracking-wider mb-4 -mt-24">Decoding Emotions</h1>
            <h1 className="text-5xl font-normal text-center tracking-wider mb-2">Delivering Visuals</h1> */}
            {/* <p className="text-center text-gray-600 mb-20 tracking-wider">Turning sentiment data into impactful visual applications</p> */}
            <h1 className="text-2xl text-center font-normal tracking-wider mb-20 ">"AI That Understands: <br />
                Sentiment Analysis Meets Visual Creativity"</h1>

            <div className="grid grid-cols-3 grid-rows-1 gap-6 relative items-center">

                <div className="grid grid-cols-2 grid-rows-1 gap-20 h-full w-full justify-center items-center absolute px-4 -z-10">
                    <HoverBorderGradient containerClassName={'rounded-r-full border-2 border-gray-200'} className={' h-64 w-[30rem] bg-white'} as="div" />
                    <HoverBorderGradient containerClassName={'rounded-r-full border-2 border-gray-200'} className={' h-64 w-96 bg-white'} as="div" clockwise={true} />
                </div>
                <div className="p-1 shadow-md rounded-xl bg-white"><CardFlow /></div>
                <HoverBorderGradient containerClassName={'rounded-full mx-auto'} className={'bg-white text-black'} as='div'>
                    <div ><img src="/img/logo-circle.png" alt="cognir logo" width={180} /></div>
                </HoverBorderGradient>
                <div ><img src="/img/map-image.png" alt="dashboard" className="w-full h-full" /></div>
            </div>
        </div>

    )
}