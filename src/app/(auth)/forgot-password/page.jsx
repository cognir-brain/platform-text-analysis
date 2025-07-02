'use client'

import { useState } from "react";
import { useAuth } from "@/context/authContext";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";

export default function ForgotPassword() {
    const { resetPassword } = useAuth();
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setMessage(null);

        try {
            await resetPassword(email);
            setMessage("Check your email for a link to reset your password.");
            setEmail("");
        } catch (err) {
            setError(err.message || "Failed to send reset email");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col min-w-64 max-w-5xl mx-auto my-40 px-5">
            <form onSubmit={handleSubmit}>
                <h1 className="text-2xl text-center font-medium">Reset Password</h1>
                <p className="text-sm text-center text-foreground">
                    Enter your email and we'll send you a link to reset your password.
                </p>
                <div className="flex flex-col gap-2 [&>input]:mb-3 mt-8">
                    <Label htmlFor="email">Email</Label>
                    <Input
                        name="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="your@email.com"
                        required
                    />

                    <button type="submit" disabled={loading} className="px-4 py-3 bg-black text-white font-medium text-sm rounded-full hover:bg-black/[0.8] hover:shadow-lg">

                        {loading ? "Sending..." : "Send Reset Link"}
                    </button>

                    {message && (
                        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mt-2">
                            {message}
                        </div>
                    )}

                    {error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mt-2">
                            {error}
                        </div>
                    )}

                    <div className="text-center mt-2">
                        <Link className="text-sm text-foreground underline" href="/sign-in">
                            Back to Sign In
                        </Link>
                    </div>
                </div>
            </form>
        </div>
    );
}