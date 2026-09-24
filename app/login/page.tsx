"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
    
    setIsLoading(true);
    
    const { error: signInError } = await authClient.signIn.email({
      email,
      password,
    });
    
    if (signInError) {
      toast.error(signInError.message || "Failed to sign in");
      setIsLoading(false);
      return;
    }
    
    toast.success("Successfully logged in!");
    router.push("/");
    router.refresh();
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-8 bg-background">
      <div className="w-full max-w-md p-6 sm:p-8 space-y-6 sm:space-y-8 bg-white border border-sage rounded-xl shadow-sm">
        <h1 className="text-3xl font-bold text-center text-charcoal">Welcome Back</h1>
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block mb-2 text-sm font-medium text-charcoal" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
              className="w-full px-3 py-2 border border-sage rounded-md text-charcoal focus:outline-none focus:ring-2 focus:ring-forest bg-white disabled:opacity-50"
            />
          </div>
          <div>
            <label className="block mb-2 text-sm font-medium text-charcoal" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
              className="w-full px-3 py-2 border border-sage rounded-md text-charcoal focus:outline-none focus:ring-2 focus:ring-forest bg-white disabled:opacity-50"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="flex justify-center items-center w-full px-4 py-2 font-bold text-white bg-forest rounded-md hover:bg-forest/90 transition-colors shadow-sm disabled:opacity-70"
          >
            {isLoading ? <Loader2 className="animate-spin w-5 h-5" /> : "Sign In"}
          </button>
        </form>
        <p className="text-center text-sm text-charcoal/70">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="text-forest font-semibold hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
