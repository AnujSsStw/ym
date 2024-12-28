"use client";

import { signIn } from "next-auth/react";

export default function LoginPage() {
  return (
    <div className="relative flex h-screen w-full flex-col items-center justify-center overflow-hidden">
      {/* Background Video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute left-0 top-0 z-0 h-full w-full object-cover"
      >
        <source src="/Cooking.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* Overlay to darken the video for readability */}
      <div className="z-1 absolute left-0 top-0 h-full w-full bg-black/50"></div>

      {/* Hero Section */}
      <div className="relative z-10 mt-10 px-6 text-center md:mt-0">
        <h1 className="text-3xl font-bold leading-tight text-white md:text-5xl">
          Welcome to <span className="text-white">Yummy Hub</span>
        </h1>
        <p className="mt-2 text-sm text-white md:text-lg">
          Discover delicious recipes, save your favorites, and get cooking!
        </p>
      </div>

      {/* Login Card */}
      <div className="z-10 mt-8 w-full max-w-sm rounded-lg bg-white/90 p-6 text-center shadow-lg md:mt-10 md:p-8">
        <h2 className="text-secondary mb-4 text-2xl font-bold">
          Sign In to <span className="text-primary">Yummy Hub</span>
        </h2>
        <button
          onClick={() => signIn("google", { callbackUrl: "/" })}
          className="flex w-full items-center justify-center gap-2 rounded bg-blue-600 px-4 py-2 font-medium text-white transition hover:bg-blue-700"
        >
          <img src="/google-solid-sharp.svg" alt="Google" className="h-5 w-5" />
          Sign in with Google
        </button>
        <p className="mt-4 text-xs text-gray-500">
          By signing in, you agree to our{" "}
          <a href="#" className="text-primary underline">
            Terms of Service
          </a>{" "}
          and{" "}
          <a href="#" className="text-primary underline">
            Privacy Policy
          </a>
        </p>
      </div>
    </div>
  );
}
