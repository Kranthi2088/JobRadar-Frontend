import Redis from "ioredis";

const url = process.env.REDIS_URL || "redis://localhost:6379";

let client: Redis | null = null;

export function getRedis(): Redis | null {
  try {
    if (!client) {
      client = new Redis(url, {
        maxRetriesPerRequest: null,
        enableReadyCheck: false,
      });
    }
    return client;
  } catch {
    return null;
  }
}

/** Best-effort: delete keys matching JobRadar worker patterns (seen jobs, poll state, circuit). */
export async function clearWorkerJobCache(): Promise<{ deleted: number }> {
  const redis = getRedis();
  if (!redis) return { deleted: 0 };

  const patterns = [
    "seen:*",
    "poll:last-at:*",
    "poll:failures:*",
    "circuit:*",
  ];

  let deleted = 0;
  for (const pattern of patterns) {
    let cursor = "0";
    do {
      const [next, keys] = await redis.scan(
        cursor,
        "MATCH",
        pattern,
        "COUNT",
        "200"
      );
      cursor = next;
      if (keys.length) {
        deleted += await redis.del(...keys);
      }
    } while (cursor !== "0");
  }

  return { deleted };
}
