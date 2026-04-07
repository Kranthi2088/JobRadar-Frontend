import { SignInClient } from "./sign-in-client";

export const dynamic = "force-dynamic";

export default function SignInPage() {
  const showDevLocal =
    process.env.ENABLE_DEV_LOCAL_AUTH === "true" ||
    process.env.enableDevLocalAuth === "true";

  return <SignInClient showDevLocal={showDevLocal} />;
}
