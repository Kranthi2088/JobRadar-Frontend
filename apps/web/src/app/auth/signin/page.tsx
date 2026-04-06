import { SignInClient } from "./sign-in-client";

export default function SignInPage() {
  const showDevLocal =
    process.env.ENABLE_DEV_LOCAL_AUTH === "true" ||
    process.env.enableDevLocalAuth === "true";
  const hasGoogle = Boolean(
    process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
  );
  const hasGithub = Boolean(
    process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET
  );

  return (
    <SignInClient
      showDevLocal={showDevLocal}
      hasGoogle={hasGoogle}
      hasGithub={hasGithub}
    />
  );
}
