import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"
import { Menu as BurgerIcon } from "lucide-react";
import Link from "next/link";




export function MobileNav() {
    return (
        <div className="lg:hidden bg-white">
            <Sheet>
                <SheetTrigger>
                    <BurgerIcon />
                </SheetTrigger>
                <SheetContent >
                    <SheetHeader>
                        <SheetTitle>
                            <Link href={'/'}>
                                <img src="/img/logo-text.png" alt="cognir logo" className="h-8 hover:opacity-75" />
                            </Link>
                        </SheetTitle>
                        <SheetDescription>
                            <span className="flex flex-col gap-6 mt-6 text-lg text-zinc-900">
                                <Link href="/">Product</Link>
                                <Link href="/">Blog</Link>
                                <Link href="/">Company</Link>
                                <Link href="/">Sign in</Link>
                                <Link href="/">Sign Up</Link>
                            </span>
                        </SheetDescription>
                    </SheetHeader>
                </SheetContent>
            </Sheet>
        </div>
    )

}