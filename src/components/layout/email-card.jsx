"use client";

import { useState, useRef } from "react";
import { TextHoverEffect } from "../ui/text-hover";
import { Mail } from "lucide-react";
import emailjs from "@emailjs/browser";



export function EmailCard() {
  const formRef = useRef(null);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {

      await emailjs.send(
        process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID,
        process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID_USER,
        {
          to_email: email
        },
        process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY
      );


      // Untuk kirim ke admin
      const feting = await emailjs.send(
        process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID,
        process.env.NEXT_PUBLIC_EMAILJS_ADMIN_TEMPLATE_ID,
        {
          email,
          time: new Date().toLocaleString(),
        },
        process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY
      );

      console.log("Email sent successfully:", feting);

      setSuccess(true);
      setEmail("");
      setTimeout(() => setSuccess(false), 4000);

    } catch (err) {
      setError("Failed to send email. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="w-full mx-auto px-5 lg:px-0">
      <div className="bg-gray-950 dark p-6 md:p-10 rounded-b-3xl mx-auto flex flex-col gap-y-5 justify-center items-center relative">
        <TextHoverEffect text="COGNIR" />
        <h3 className="text-2xl md:text-3xl lg:text-4xl font-medium tracking-wide text-white text-center">
          Get the latest updates
        </h3>
        <h4 className="text-white font-light">
          Sign up for news on the latest innovations from Cognir AI.
        </h4>

        <form
          ref={formRef}
          onSubmit={handleSubmit}
          className="max-w-2xl mx-auto w-full flex flex-col lg:flex-row gap-y-2 items-center justify-center lg:justify-start gap-x-5 mt-5"
        >
          <div className="relative w-full mt-1">
            <input
              type="email"
              name="user_email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-white/20 block w-full py-4 px-12 text-sm text-white border border-zinc-400/40 focus:outline-none rounded-xl placeholder:text-sm focus:border-indigo-500/50"
              placeholder="Enter your email address"
            />
            <span className="absolute inset-y-0 left-0 text-zinc-400/50 flex items-center justify-center ml-4">
              <Mail strokeWidth={1.5} />
            </span>
          </div>

          <input
            type="hidden"
            name="time"
            value={new Date().toLocaleString()}
          />

          <button
            type="submit"
            disabled={loading}
            className="bg-white w-full lg:w-1/3 hover:shadow-md focus:ring-2 focus:ring-indigo-500/50 ring-offset-2 ring-offset-[#EAE8FF] hover:drop-shadow transition duration-200 text-zinc-800 text-xs lg:text-sm rounded-full py-4 font-medium"
          >
            {loading ? "Sending..." : "Send Email"}
          </button>
        </form>

        {success && (
          <p className="text-green-400 text-sm mt-2">
            Email sent successfully!
          </p>
        )}

        {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
      </div>
    </section>
  );
}
