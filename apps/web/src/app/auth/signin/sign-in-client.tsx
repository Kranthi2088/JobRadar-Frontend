"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Zap, Loader2 } from "lucide-react";

type Props = {
  showDevLocal: boolean;
  hasGoogle: boolean;
  hasGithub: boolean;
};

export function SignInClient({ showDevLocal, hasGoogle, hasGithub }: Props) {
  const router = useRouter();
  const [email, setEmail] = useState("dev@localhost.local");
  const [name, setName] = useState("Local Dev");
  const [secret, setSecret] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDevSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await signIn("dev-local", {
      email,
      name,
      secret: secret || "",
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

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-bg px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-jr-accent">
            <Zap className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-2xl font-semibold tracking-[-0.2px] text-jr-text1">
            Welcome to JobRadar
          </h1>
          <p className="mt-2 text-sm text-jr-text2">
            Sign in to start monitoring your target companies
          </p>
        </div>

        {showDevLocal && (
          <form onSubmit={handleDevSignIn} className="card space-y-4 mb-6">
            <div className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-900 ring-1 ring-amber-200">
              <strong className="font-semibold">Local dev sign-in</strong> — creates
              or reuses a user in your database. Enable with{" "}
              <code className="rounded bg-amber-100 px-1">ENABLE_DEV_LOCAL_AUTH=true</code>.
              Never enable in production.
            </div>

            {error && (
              <p className="text-sm text-red-600" role="alert">
                {error}
              </p>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
                value={name}
                onChange={(e) => setName(e.target.value)}
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
                value={secret}
                onChange={(e) => setSecret(e.target.value)}
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

        {(hasGoogle || hasGithub) && (
          <>
            {showDevLocal && (
              <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-black/10" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-surface-bg px-2 text-jr-text3">Or</span>
                </div>
              </div>
            )}

            <div className="card space-y-4">
              {hasGoogle && (
                <button
                  type="button"
                  onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
                  className="btn-secondary w-full justify-center gap-3"
                >
                  <svg className="h-5 w-5" viewBox="0 0 24 24">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                  </svg>
                  Continue with Google
                </button>
              )}

              {hasGithub && (
                <button
                  type="button"
                  onClick={() => signIn("github", { callbackUrl: "/dashboard" })}
                  className="btn-secondary w-full justify-center gap-3"
                >
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2z" />
                  </svg>
                  Continue with GitHub
                </button>
              )}
            </div>
          </>
        )}

        {!showDevLocal && !hasGoogle && !hasGithub && (
          <div className="card text-center text-sm text-red-600">
            No auth providers configured. Set{" "}
            <code className="rounded bg-gray-100 px-1">ENABLE_DEV_LOCAL_AUTH=true</code>{" "}
            for local testing, or add Google/GitHub OAuth credentials.
          </div>
        )}

        <p className="mt-6 text-center text-xs text-jr-text3">
          By signing in, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
}
