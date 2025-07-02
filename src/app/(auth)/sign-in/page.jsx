'use client'

import { useState } from "react";
import { useAuth } from "@/context/authContext";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GoogleAuth } from "../google-auth";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";

export default function Login() {
    const { signIn } = useAuth();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        email: "",
        password: ""
    });
    const [errors, setErrors] = useState({
        email: "",
        password: ""
    });

    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email) return "Email is required";
        if (!emailRegex.test(email)) return "Please enter a valid email address";
        return "";
    };

    const validatePassword = (password) => {
        if (!password) return "Password is required";
        return "";
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate form
        const emailError = validateEmail(formData.email);
        const passwordError = validatePassword(formData.password);

        setErrors({
            email: emailError,
            password: passwordError
        });

        // If there are validation errors, stop submission
        if (emailError || passwordError) {
            return;
        }

        setLoading(true);
        setError(null);

        try {
            await signIn(formData);
            router.push("/analysis");
        } catch (err) {
            setError(err.message || "Failed to sign in");
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        // Clear error when user types
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: "" }));
        }
    };

    const togglePasswordVisibility = () => {
        setShowPassword(prev => !prev);
    };

    return (
        <div className="flex-1 flex flex-col min-w-64 gap-2 max-w-5xl mx-auto my-40 px-5">
            <form onSubmit={handleSubmit}>
                <h1 className="text-2xl text-center font-medium">Sign in</h1>
                <p className="text-sm text-center text-foreground">
                    Don't have an account?{" "}
                    <Link className="text-foreground font-medium underline" href="/sign-up">
                        Sign up
                    </Link>
                </p>
                <div className="flex flex-col gap-2 [&>input]:mb-3 mt-8">
                    <Label htmlFor="email">Email</Label>
                    <Input
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="your@email.com"
                        required
                        className={errors.email ? "border-red-500" : ""}
                    />
                    {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}

                    <div className="flex justify-between items-center">
                        <Label htmlFor="password">Password</Label>
                        <Link
                            className="text-xs text-foreground underline"
                            href="/forgot-password"
                        >
                            Forgot Password?
                        </Link>
                    </div>
                    <div className="relative">
                        <Input
                            type={showPassword ? "text" : "password"}
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="Your password"
                            required
                            className={errors.password ? "border-red-500" : ""}
                        />
                        <button
                            type="button"
                            onClick={togglePasswordVisibility}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                        >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>
                    {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}

                    <button
                        type="submit"
                        disabled={loading}
                        className="px-4 py-3 bg-black text-white font-medium text-sm rounded-full hover:bg-black/[0.8] hover:shadow-lg disabled:bg-gray-400 mt-3"
                    >
                        {loading ? "Signing In..." : "Sign in"}
                    </button>

                    {error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mt-2">
                            {error}
                        </div>
                    )}
                </div>
            </form>
            <GoogleAuth text="Sign in" />
        </div>
    );
}