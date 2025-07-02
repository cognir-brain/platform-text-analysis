"use client";
import React, { useState } from "react";
import { HoveredLink, Menu, MenuItem } from "../ui/navbar-menu";
import { MobileNav } from "./mobile-nav";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useAuth } from "@/context/authContext";

function Navbar({ className }) {
    const [active, setActive] = useState(null);
    const { user, isLoggedIn } = useAuth();

    return (
        <div className={cn("fixed top-10 inset-x-0 mx-auto z-50", className)}>
            <Menu setActive={setActive}>
                <div className="flex justify-between items-center lg:w-1/5 w-full">
                    <Link href="/">
                        <img src="/img/logo-text.png" alt="cognir logo" className="logo-font h-8 hover:opacity-75" />
                    </Link>
                    <MobileNav />
                </div>
                <div className="w-full justify-start space-x-14 items-center hidden lg:flex">
                    <MenuItem setActive={setActive} active={active} item="Features">
                        <div className="flex flex-col space-y-4 text-sm">
                            <HoveredLink href="/#demo">Sentiment Analysis</HoveredLink>
                            <HoveredLink href="/features/summary" disabled>Text Summarization</HoveredLink>
                            <HoveredLink href="/features/keywords" disabled>Keyword Extraction</HoveredLink>
                            <HoveredLink href="/features/custom" disabled>Custom Analysis</HoveredLink>
                        </div>
                    </MenuItem>
                    <MenuItem setActive={setActive} active={active} item="Discover">
                        <div className="flex flex-col space-y-4 text-sm">
                            <HoveredLink href="/how-it-works/guide" disabled>Quick Start Guide</HoveredLink>
                            <HoveredLink href="/how-it-works/video" disabled>Video Tutorial</HoveredLink>
                            <HoveredLink href="/how-it-works/use-cases" disabled>Use Cases</HoveredLink>
                        </div>
                    </MenuItem>
                    <MenuItem setActive={setActive} active={active} item="Docs">
                        <div className="flex flex-col space-y-4 text-sm">
                            <HoveredLink href="/docs/api" disabled>API Docs</HoveredLink>
                            <HoveredLink href="/docs/guide" disabled>User Guide</HoveredLink>
                            <HoveredLink href="/support/faq" disabled>FAQ</HoveredLink>
                            <HoveredLink href="/support/contact" disabled>Contact Support</HoveredLink>
                        </div>
                    </MenuItem>
                </div>
                <div className="hidden lg:flex w-full justify-end gap-4 text-sm">
                    {isLoggedIn ? (
                        <button className="px-4 py-2 bg-black text-white rounded-lg hover:bg-black/[0.8] hover:shadow-lg">
                            <Link href="/analysis">Go to App</Link>
                        </button>
                    ) : (
                        <>
                            <button className="font-medium ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 border border-input hover:opacity-80 rounded-md px-4 py-2">
                                <Link href="/sign-in">Sign In</Link>
                            </button>
                            <button className="px-4 py-2 bg-black text-white rounded-lg hover:bg-black/[0.8] hover:shadow-lg">
                                <Link href="/sign-up">Sign Up</Link>
                            </button>
                        </>
                    )}
                </div>
            </Menu>
        </div>
    );
}

export function MainNav() {
    return (
        <header className="relative w-full flex items-center justify-center">
            <Navbar className="top-0" />
        </header>
    );
}