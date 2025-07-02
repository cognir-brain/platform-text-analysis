'use client';

import { useState } from "react";
import { useRouter } from 'next/navigation';
import { useAuth } from "@/context/authContext";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";

export default function ResetPassword() {
    const router = useRouter();
    const { updatePassword } = useAuth();
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);
    const [error, setError] = useState(null);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [formData, setFormData] = useState({
        password: "",
        confirmPassword: ""
    });
    const [errors, setErrors] = useState({
        password: "",
        confirmPassword: ""
    });

    const validatePassword = (password) => {
        if (!password) return "Password is required";
        if (password.length < 6) return "Password must be at least 6 characters";
        return "";
    };

    const validateConfirmPassword = (confirmPassword, password) => {
        if (!confirmPassword) return "Please confirm your password";
        if (confirmPassword !== password) return "Passwords do not match";
        return "";
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate form
        const passwordError = validatePassword(formData.password);
        const confirmPasswordError = validateConfirmPassword(formData.confirmPassword, formData.password);

        setErrors({
            password: passwordError,
            confirmPassword: confirmPasswordError
        });

        // If there are validation errors, stop submission
        if (passwordError || confirmPasswordError) {
            return;
        }

        setLoading(true);
        setError(null);
        setMessage(null);

        try {
            await updatePassword(formData.password);
            setMessage("Your password has been successfully reset.");

            // Redirect after successful password reset
            setTimeout(() => {
                router.push('/analysis');
            }, 2000);
        } catch (err) {
            setError(err.message || "Failed to reset password");
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

    const toggleConfirmPasswordVisibility = () => {
        setShowConfirmPassword(prev => !prev);
    };

    if (message) {
        return (
            <div className="w-full flex-1 flex items-center h-screen sm:max-w-md justify-center gap-2 p-4">
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative">
                    {message}
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-2 min-w-64 max-w-5xl mx-auto my-40 px-5">
            <form onSubmit={handleSubmit}>
                <h1 className="text-2xl text-center font-medium">Reset Password</h1>
                <p className="text-sm text-center text-foreground">
                    Enter a new password for your account
                </p>
                <div className="flex flex-col gap-2 [&>input]:mb-3 mt-8">
                    <Label htmlFor="password">New Password</Label>
                    <div className="relative">
                        <Input
                            type={showPassword ? "text" : "password"}
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="Your new password"
                            minLength={6}
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

                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <div className="relative">
                        <Input
                            type={showConfirmPassword ? "text" : "password"}
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            placeholder="Confirm your new password"
                            required
                            className={errors.confirmPassword ? "border-red-500" : ""}
                        />
                        <button
                            type="button"
                            onClick={toggleConfirmPasswordVisibility}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                        >
                            {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>
                    {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}

                    <button
                        type="submit"
                        disabled={loading}
                        className="px-4 py-3 bg-black text-white font-medium text-sm rounded-full hover:bg-black/[0.8] hover:shadow-lg disabled:bg-gray-400 mt-3"
                    >
                        {loading ? "Updating password..." : "Reset Password"}
                    </button>

                    {error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mt-2">
                            {error}
                        </div>
                    )}
                </div>
            </form>
            <div className="text-center mt-4">
                <Link href="/sign-in" className="text-primary font-medium hover:underline text-sm">
                    Back to Sign In
                </Link>
            </div>
        </div>
    );
}