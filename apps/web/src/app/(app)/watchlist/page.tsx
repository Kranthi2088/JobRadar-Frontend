import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@jobradar/db";
import { WatchlistManager } from "@/components/watchlist-manager";

export default async function WatchlistPage() {
  const session = await getServerSession(authOptions);
  const userId = (session!.user as any).id;
  const plan = (session!.user as any).plan || "free";

  const watchlists = await prisma.watchlist.findMany({
    where: { userId },
    include: {
      company: {
        include: {
          sources: { orderBy: { priority: "asc" } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const companies = await prisma.company.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
    include: {
      sources: { orderBy: { priority: "asc" } },
    },
  });

  return (
    <WatchlistManager
      initialWatchlists={watchlists}
      companies={companies}
      plan={plan}
    />
  );
}
