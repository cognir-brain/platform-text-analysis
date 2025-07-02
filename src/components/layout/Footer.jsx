import { TwitterIcon, InstagramIcon, LinkedinIcon, YoutubeIcon, FacebookIcon } from "lucide-react";

const Footer = () => {
    return (
        <footer className="w-full">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                {/* <!--Grid--> */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-8 py-10 max-sm:max-w-sm max-sm:mx-auto gap-y-8">
                    <div className="col-span-full mb-10 lg:col-span-3 lg:mb-0">
                        <div className="flex justify-center lg:justify-start">
                            <img src="/img/logo-text.png" alt="cognir logo" className='w-1/3 logo-font' />
                        </div>
                        <p className="py-8 text-sm text-gray-500 lg:max-w-xs text-center lg:text-left">Trusted in more than 100 countries & 5 million customers. Have any question ?</p>
                        <a href="https://cognir.ai/" target='blank' className="py-2.5 px-5 h-9 block w-fit bg-black rounded-full shadow-sm text-xs text-white mx-auto transition-all  duration-500 hover:bg-black/[0.8] lg:mx-0">
                            Contact us
                        </a>
                    </div>
                    {/* <!--End Col--> */}

                    <div className="lg:mx-auto text-left ">
                        <h4 className="text-lg text-gray-900 font-medium mb-7">Features</h4>
                        <ul className="text-sm  transition-all duration-500">
                            <li className="mb-6"><a href="/#demo" className="text-gray-600 hover:text-gray-900">Sentiment Analysis</a></li>
                            <li className="mb-6"><span className="text-gray-400">Text Summarization</span></li>
                            <li className="mb-6"><span className="text-gray-400">Keyword Extraction</span></li>
                            <li><span className="text-gray-400">Custom Analysis</span></li>
                        </ul>
                    </div>
                    {/* <!--End Col--> */}
                    <div className="lg:mx-auto text-left">
                        <h4 className="text-lg text-gray-900 font-medium mb-7">Discover</h4>
                        <ul className="text-sm  transition-all duration-500">
                            <li className="mb-6"><span className="text-gray-400">Quick Start Guide</span></li>
                            <li className="mb-6"><span className="text-gray-400">Video Tutorial</span></li>
                            <li><span className="text-gray-400">Use Cases</span></li>
                        </ul>
                    </div>
                    {/* <!--End Col--> */}
                    <div className="lg:mx-auto text-left">
                        <h4 className="text-lg text-gray-900 font-medium mb-7">Docs</h4>
                        <ul className="text-sm  transition-all duration-500">
                            <li className="mb-6"><span className="text-gray-400">API Docs</span></li>
                            <li className="mb-6"><span className="text-gray-400">User Guide</span></li>
                            <li className="mb-6"><span className="text-gray-400">FAQ</span></li>
                            <li><span className="text-gray-400">Contact Support</span></li>
                        </ul>
                    </div>
                </div>
                {/* <!--Grid--> */}
                <div className="py-7 border-t border-gray-200">
                    <div className="flex items-center justify-center flex-col lg:justify-between lg:flex-row">
                        <span className="text-sm text-gray-500 ">©<a href="https://pagedone.io/">Cognir.AI</a> 2025, All rights reserved.</span>
                        <div className="flex mt-4 space-x-4 sm:justify-center lg:mt-0 ">
                            <a href='https://x.com/CognirAi' target="blank" className="w-10 h-10 rounded-full bg-black flex justify-center items-center hover:bg-black/[0.8]">
                                <TwitterIcon color="white" strokeWidth={1.5} />
                            </a>
                            <a href='https://www.instagram.com/CognirAi/#' target="blank" className="w-10 h-10 rounded-full bg-black flex justify-center items-center hover:bg-black/[0.8]">
                                <InstagramIcon color="white" strokeWidth={1.5} />
                            </a>
                            <a href='https://www.linkedin.com/company/cognir-ai/' target="blank" className="w-10 h-10 rounded-full bg-black flex justify-center items-center hover:bg-black/[0.8]">
                                <LinkedinIcon color="white" strokeWidth={1.5} />

                            </a>
                            <a href='https://web.facebook.com/profile.php?id=61575511954285' target="blank" className="w-10 h-10 rounded-full bg-black flex justify-center items-center hover:bg-black/[0.8]">
                                <FacebookIcon color="white" strokeWidth={1.5} />
                            </a>
                            <a href='https://www.youtube.com/@CognirAI' target="blank" className="w-10 h-10 rounded-full bg-black flex justify-center items-center hover:bg-black/[0.8]">
                                <YoutubeIcon color="white" strokeWidth={1.5} />
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;