import { prisma } from "../src/index";

type SourceSeed = {
  priority: number;
  atsType:
    | "greenhouse"
    | "lever"
    | "ashby"
    | "microsoft_pcsx"
    | "custom"
    | "playwright";
  endpoint: string;
};

/** Greenhouse API first; if empty or error, static HTML then Playwright on the public careers site. */
function greenhouseThenCareersSite(
  greenhouseJobsUrl: string,
  careersUrl: string
): SourceSeed[] {
  return [
    { priority: 0, atsType: "greenhouse", endpoint: greenhouseJobsUrl },
    { priority: 1, atsType: "custom", endpoint: careersUrl },
    { priority: 2, atsType: "playwright", endpoint: careersUrl },
  ];
}

/** Curated employers — ATS first, then company careers (HTML + Playwright), same pattern as Microsoft. */
const companies: Array<{
  slug: string;
  name: string;
  logoHost: string;
  sources: SourceSeed[];
}> = [
  {
    slug: "microsoft",
    name: "Microsoft",
    logoHost: "microsoft.com",
    sources: [
      {
        priority: 0,
        atsType: "microsoft_pcsx",
        endpoint: "microsoft.com",
      },
      {
        priority: 1,
        atsType: "custom",
        endpoint: "https://apply.careers.microsoft.com/careers?hl=en",
      },
      {
        priority: 2,
        atsType: "playwright",
        endpoint: "https://apply.careers.microsoft.com/careers?hl=en",
      },
    ],
  },
  {
    slug: "linkedin",
    name: "LinkedIn",
    logoHost: "linkedin.com",
    sources: greenhouseThenCareersSite(
      "https://api.greenhouse.io/v1/boards/linkedin/jobs",
      "https://careers.linkedin.com"
    ),
  },
  {
    slug: "google",
    name: "Google",
    logoHost: "google.com",
    sources: [
      {
        priority: 0,
        atsType: "custom",
        endpoint:
          "https://www.google.com/about/careers/applications/jobs/results",
      },
      {
        priority: 1,
        atsType: "playwright",
        endpoint:
          "https://www.google.com/about/careers/applications/jobs/results",
      },
    ],
  },
  {
    slug: "airbnb",
    name: "Airbnb",
    logoHost: "airbnb.com",
    sources: greenhouseThenCareersSite(
      "https://api.greenhouse.io/v1/boards/airbnb/jobs",
      "https://careers.airbnb.com"
    ),
  },
  {
    slug: "coinbase",
    name: "Coinbase",
    logoHost: "coinbase.com",
    sources: greenhouseThenCareersSite(
      "https://api.greenhouse.io/v1/boards/coinbase/jobs",
      "https://www.coinbase.com/careers"
    ),
  },
  {
    slug: "cloudflare",
    name: "Cloudflare",
    logoHost: "cloudflare.com",
    sources: greenhouseThenCareersSite(
      "https://api.greenhouse.io/v1/boards/cloudflare/jobs",
      "https://www.cloudflare.com/careers/"
    ),
  },
  {
    slug: "vercel",
    name: "Vercel",
    logoHost: "vercel.com",
    sources: greenhouseThenCareersSite(
      "https://api.greenhouse.io/v1/boards/vercel/jobs",
      "https://vercel.com/careers"
    ),
  },
  {
    slug: "datadog",
    name: "Datadog",
    logoHost: "datadoghq.com",
    sources: greenhouseThenCareersSite(
      "https://api.greenhouse.io/v1/boards/datadog/jobs",
      "https://careers.datadoghq.com"
    ),
  },
  {
    slug: "databricks",
    name: "Databricks",
    logoHost: "databricks.com",
    sources: greenhouseThenCareersSite(
      "https://api.greenhouse.io/v1/boards/databricks/jobs",
      "https://www.databricks.com/company/careers"
    ),
  },
  {
    slug: "reddit",
    name: "Reddit",
    logoHost: "reddit.com",
    sources: greenhouseThenCareersSite(
      "https://api.greenhouse.io/v1/boards/reddit/jobs",
      "https://careers.reddit.com"
    ),
  },
  {
    slug: "shopify",
    name: "Shopify",
    logoHost: "shopify.com",
    sources: greenhouseThenCareersSite(
      "https://api.greenhouse.io/v1/boards/shopify/jobs",
      "https://www.shopify.com/careers"
    ),
  },
  {
    slug: "doordash",
    name: "DoorDash",
    logoHost: "doordash.com",
    sources: greenhouseThenCareersSite(
      "https://api.greenhouse.io/v1/boards/doordash/jobs",
      "https://careers.doordash.com"
    ),
  },
  {
    slug: "apple",
    name: "Apple",
    logoHost: "apple.com",
    sources: [
      {
        priority: 0,
        atsType: "custom",
        endpoint: "https://jobs.apple.com/en-us/search",
      },
      {
        priority: 1,
        atsType: "playwright",
        endpoint: "https://jobs.apple.com/en-us/search",
      },
    ],
  },
  {
    slug: "uber",
    name: "Uber",
    logoHost: "uber.com",
    sources: [
      {
        priority: 0,
        atsType: "custom",
        endpoint: "https://www.uber.com/us/en/careers/list/",
      },
      {
        priority: 1,
        atsType: "playwright",
        endpoint: "https://www.uber.com/us/en/careers/list/",
      },
    ],
  },
];

async function main() {
  console.log("Seeding companies and sources...");

  for (const row of companies) {
    const company = await prisma.company.upsert({
      where: { slug: row.slug },
      create: {
        slug: row.slug,
        name: row.name,
        logoUrl: `https://logo.clearbit.com/${row.logoHost}`,
      },
      update: {
        name: row.name,
        logoUrl: `https://logo.clearbit.com/${row.logoHost}`,
      },
    });

    await prisma.companySource.deleteMany({ where: { companyId: company.id } });
    for (const s of row.sources) {
      await prisma.companySource.create({
        data: {
          companyId: company.id,
          priority: s.priority,
          atsType: s.atsType,
          endpoint: s.endpoint,
        },
      });
    }
  }

  console.log(`Seeded ${companies.length} companies with CompanySource rows`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
