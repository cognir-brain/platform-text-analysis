"use client";

import { useFormStatus } from "react-dom";

export function SubmitButton({
    children,
    pendingText = "Submitting...",
    ...props
}) {
    const { pending } = useFormStatus();

    return (


        <button className="px-4 py-3 bg-black text-white font-medium text-sm rounded-full hover:bg-black/[0.8] hover:shadow-lg" type="submit" aria-disabled={pending} {...props}>
            {pending ? pendingText : children}
        </button>
    );
}