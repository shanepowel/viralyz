/**
 * Hiring-signal ingester. Reads public job boards (Greenhouse, Lever, Ashby)
 * — the three ATS platforms most B2B companies use — from a competitor's
 * careers URL. Best-effort: returns [] if the provider can't be detected,
 * the board can't be resolved, or the request fails. Flags GTM / marketing
 * roles (Head of Demand Gen, VP Marketing, etc.) since those most often
 * precede a positioning shift the Pulse digest will pick up.
 */

export type RawHiringSignal = {
  source: "greenhouse" | "lever" | "ashby";
  externalId: string;
  title: string;
  url: string | null;
  location: string | null;
  department: string | null;
  isGtmRole: boolean;
  postedAt: Date | null;
};

const GTM_RE =
  /\b(marketing|demand\s*gen|growth|brand|content|communications?|comms|pr\b|revenue|gtm|go[-\s]?to[-\s]?market|sales|revops|rev\s*ops|partnerships?|community|social|seo|paid|lifecycle|product\s*marketing|pmm|abm|field\s*marketing|events?|creative)\b/i;

function isGtm(title: string, department: string | null): boolean {
  return GTM_RE.test(title) || (!!department && GTM_RE.test(department));
}

// Extract the ATS provider + board slug from a careers/job-board URL.
function detectBoard(url: string): { provider: RawHiringSignal["source"]; slug: string } | null {
  try {
    const u = new URL(url.startsWith("http") ? url : `https://${url}`);
    const host = u.hostname.toLowerCase();
    const parts = u.pathname.split("/").filter(Boolean);
    if (host.includes("greenhouse.io")) {
      // boards.greenhouse.io/{slug} | job-boards.greenhouse.io/{slug}
      if (parts[0]) return { provider: "greenhouse", slug: parts[0] };
    }
    if (host.includes("lever.co")) {
      // jobs.lever.co/{slug}
      if (parts[0]) return { provider: "lever", slug: parts[0] };
    }
    if (host.includes("ashbyhq.com")) {
      // jobs.ashbyhq.com/{slug}
      if (parts[0]) return { provider: "ashby", slug: parts[0] };
    }
    return null;
  } catch {
    return null;
  }
}

async function fetchGreenhouse(slug: string): Promise<RawHiringSignal[]> {
  const r = await fetch(`https://boards-api.greenhouse.io/v1/boards/${encodeURIComponent(slug)}/jobs?content=false`);
  if (!r.ok) return [];
  const j: any = await r.json();
  const jobs: any[] = Array.isArray(j?.jobs) ? j.jobs : [];
  return jobs.map((job) => {
    const title = String(job.title || "").slice(0, 500);
    const department = job.departments?.[0]?.name ? String(job.departments[0].name).slice(0, 160) : null;
    return {
      source: "greenhouse" as const,
      externalId: String(job.id),
      title,
      url: job.absolute_url || null,
      location: job.location?.name ? String(job.location.name).slice(0, 200) : null,
      department,
      isGtmRole: isGtm(title, department),
      postedAt: job.updated_at ? new Date(job.updated_at) : null,
    };
  });
}

async function fetchLever(slug: string): Promise<RawHiringSignal[]> {
  const r = await fetch(`https://api.lever.co/v0/postings/${encodeURIComponent(slug)}?mode=json`);
  if (!r.ok) return [];
  const j: any = await r.json();
  const jobs: any[] = Array.isArray(j) ? j : [];
  return jobs.map((job) => {
    const title = String(job.text || "").slice(0, 500);
    const department = job.categories?.team ? String(job.categories.team).slice(0, 160) : null;
    return {
      source: "lever" as const,
      externalId: String(job.id),
      title,
      url: job.hostedUrl || job.applyUrl || null,
      location: job.categories?.location ? String(job.categories.location).slice(0, 200) : null,
      department,
      isGtmRole: isGtm(title, department),
      postedAt: typeof job.createdAt === "number" ? new Date(job.createdAt) : null,
    };
  });
}

async function fetchAshby(slug: string): Promise<RawHiringSignal[]> {
  const r = await fetch(`https://api.ashbyhq.com/posting-api/job-board/${encodeURIComponent(slug)}`);
  if (!r.ok) return [];
  const j: any = await r.json();
  const jobs: any[] = Array.isArray(j?.jobs) ? j.jobs : [];
  return jobs.map((job) => {
    const title = String(job.title || "").slice(0, 500);
    const department = job.department ? String(job.department).slice(0, 160) : (job.team ? String(job.team).slice(0, 160) : null);
    return {
      source: "ashby" as const,
      externalId: String(job.id),
      title,
      url: job.jobUrl || null,
      location: job.location ? String(job.location).slice(0, 200) : null,
      department,
      isGtmRole: isGtm(title, department),
      postedAt: job.publishedAt ? new Date(job.publishedAt) : null,
    };
  });
}

export async function fetchHiringSignals(jobBoardUrl: string): Promise<RawHiringSignal[]> {
  const board = detectBoard(jobBoardUrl);
  if (!board) return [];
  try {
    if (board.provider === "greenhouse") return await fetchGreenhouse(board.slug);
    if (board.provider === "lever") return await fetchLever(board.slug);
    if (board.provider === "ashby") return await fetchAshby(board.slug);
    return [];
  } catch {
    return [];
  }
}
