"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Zap, Loader2 } from "lucide-react";

type Props = {
  showDevLocal: boolean;
};

export function SignInClient({ showDevLocal }: Props) {
  const router = useRouter();
  const [devEmail, setDevEmail] = useState("dev@localhost.local");
  const [devName, setDevName] = useState("Local Dev");
  const [devSecret, setDevSecret] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDevSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await signIn("dev-local", {
      email: devEmail,
      name: devName,
      secret: devSecret || "",
      redirect: false,
    });

    setLoading(false);

    if (res?.error) {
      setError(
        "Could not sign in. Check email, optional dev secret, DATABASE_URL, and that ENABLE_DEV_LOCAL_AUTH=true."
      );
      return;
    }

    if (res?.ok) {
      router.push("/dashboard");
      router.refresh();
    }
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await signIn("email-password", {
      email: email.trim().toLowerCase(),
      password,
      redirect: false,
    });

    setLoading(false);

    if (res?.error) {
      setError("Invalid email or password.");
      return;
    }

    if (res?.ok) {
      router.push("/dashboard");
      router.refresh();
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-bg px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-jr-accent">
            <Zap className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-2xl font-semibold tracking-[-0.2px] text-jr-text1">
            Welcome back
          </h1>
          <p className="mt-2 text-sm text-jr-text2">
            Sign in to JobRadar
          </p>
        </div>

        <form onSubmit={handleEmailSignIn} className="card space-y-4 mb-6">
          {error && (
            <p className="text-sm text-red-600" role="alert">
              {error}
            </p>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="signin-email">
              Email
            </label>
            <input
              id="signin-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input"
              autoComplete="email"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="signin-password">
              Password
            </label>
            <input
              id="signin-password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input"
              autoComplete="current-password"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Signing in…
              </>
            ) : (
              "Sign in"
            )}
          </button>
        </form>

        <p className="text-center text-sm text-jr-text2 mb-6">
          Don&apos;t have an account?{" "}
          <Link href="/auth/signup" className="font-medium text-jr-accent hover:underline">
            Sign up
          </Link>
        </p>

        {showDevLocal && (
          <form onSubmit={handleDevSignIn} className="card space-y-4 mb-6">
            <div className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-900 ring-1 ring-amber-200">
              <strong className="font-semibold">Local dev sign-in</strong> — creates
              or reuses a user in your database. Enable with{" "}
              <code className="rounded bg-amber-100 px-1">ENABLE_DEV_LOCAL_AUTH=true</code>.
              Never enable in production.
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                required
                value={devEmail}
                onChange={(e) => setDevEmail(e.target.value)}
                className="input"
                autoComplete="email"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Display name
              </label>
              <input
                type="text"
                value={devName}
                onChange={(e) => setDevName(e.target.value)}
                className="input"
                autoComplete="name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Dev secret{" "}
                <span className="font-normal text-gray-500">(optional)</span>
              </label>
              <input
                type="password"
                value={devSecret}
                onChange={(e) => setDevSecret(e.target.value)}
                className="input"
                placeholder="If DEV_LOCAL_AUTH_SECRET is set in .env"
                autoComplete="off"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Signing in…
                </>
              ) : (
                "Continue as local user"
              )}
            </button>
          </form>
        )}

        <p className="mt-6 text-center text-xs text-jr-text3">
          By signing in, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
}
