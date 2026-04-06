import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@jobradar/db";
import { SettingsForm } from "@/components/settings-form";

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);
  const userId = (session!.user as any).id;

  let preferences = await prisma.userPreferences.findUnique({
    where: { userId },
  });

  if (!preferences) {
    preferences = await prisma.userPreferences.create({
      data: { userId },
    });
  }

  const pushSubscriptions = await prisma.pushSubscription.count({
    where: { userId },
  });

  return (
    <div className="mx-auto max-w-[1080px] px-8 py-10">
      <div className="mb-8">
        <h1 className="text-[28px] font-bold font-display text-jr-text1 tracking-[-0.03em] mb-1">
          Settings
        </h1>
        <p className="text-sm text-jr-text2 font-text">
          Manage your notification preferences and account settings.
        </p>
      </div>
      <SettingsForm
        preferences={preferences}
        hasPushSubscription={pushSubscriptions > 0}
      />
    </div>
  );
}
