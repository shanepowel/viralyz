function log(message: string, source = "email") {
  const t = new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", second: "2-digit", hour12: true });
  console.log(`${t} [${source}] ${message}`);
}

export type EmailMessage = {
  to: string;
  subject: string;
  html: string;
  text: string;
};

const FROM_EMAIL = process.env.EMAIL_FROM || "Viralyz <noreply@viralyz.app>";
const APP_URL = process.env.APP_URL || "https://viralyz.app";

function isConfigured(): boolean {
  return !!process.env.SENDGRID_API_KEY;
}

export async function sendEmail(msg: EmailMessage): Promise<{ ok: boolean; reason?: string }> {
  if (!msg.to) return { ok: false, reason: "no-recipient" };

  if (!isConfigured()) {
    log(
      `email skipped (no SENDGRID_API_KEY) -> to=${msg.to} subject="${msg.subject}"`,
      "email",
    );
    return { ok: false, reason: "not-configured" };
  }

  const fromMatch = FROM_EMAIL.match(/^(.*?)\s*<([^>]+)>$/);
  const fromObj = fromMatch
    ? { name: fromMatch[1].trim(), email: fromMatch[2].trim() }
    : { email: FROM_EMAIL };

  const body = {
    personalizations: [{ to: [{ email: msg.to }] }],
    from: fromObj,
    subject: msg.subject,
    content: [
      { type: "text/plain", value: msg.text },
      { type: "text/html", value: msg.html },
    ],
  };

  try {
    const res = await fetch("https://api.sendgrid.com/v3/mail/send", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.SENDGRID_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const txt = await res.text().catch(() => "");
      log(`email send failed (${res.status}): ${txt}`, "email");
      return { ok: false, reason: `sendgrid-${res.status}` };
    }
    log(`email sent -> to=${msg.to} subject="${msg.subject}"`, "email");
    return { ok: true };
  } catch (e: any) {
    log(`email send error: ${e?.message || e}`, "email");
    return { ok: false, reason: "exception" };
  }
}

function shell(title: string, preheader: string, inner: string): string {
  return `<!doctype html>
<html><head><meta charset="utf-8"><title>${title}</title></head>
<body style="margin:0;padding:0;background:#0b1020;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#e5e7eb;">
  <span style="display:none;visibility:hidden;opacity:0;color:transparent;">${preheader}</span>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0b1020;padding:24px 0;">
    <tr><td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#111827;border:1px solid #1f2937;border-radius:16px;padding:32px;">
        <tr><td style="padding-bottom:24px;">
          <div style="font-size:22px;font-weight:700;color:#a5b4fc;">Viralyz</div>
        </td></tr>
        ${inner}
        <tr><td style="padding-top:32px;border-top:1px solid #1f2937;color:#6b7280;font-size:12px;">
          You're receiving this because you have an account with Viralyz.
          <a href="${APP_URL}/settings" style="color:#a5b4fc;">Manage email preferences</a>.
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

export function renderWelcomeEmail(args: {
  firstName?: string | null;
  email: string;
}): EmailMessage {
  const name = args.firstName?.trim() || "there";
  const subject = "Welcome to Viralyz: let's grow your reach";
  const inner = `
    <tr><td>
      <h1 style="font-size:24px;color:#fff;margin:0 0 12px;">Welcome, ${name}!</h1>
      <p style="font-size:15px;line-height:1.6;color:#cbd5e1;margin:0 0 20px;">
        Your AI co-pilot is ready. Drop in a clip, caption or thumbnail and we'll
        score it, suggest improvements, and help you ship content that actually lands.
      </p>
      <p style="margin:0 0 24px;">
        <a href="${APP_URL}/analyze" style="display:inline-block;background:#6366f1;color:#fff;text-decoration:none;padding:12px 20px;border-radius:10px;font-weight:600;">Analyze your first piece</a>
      </p>
      <p style="font-size:14px;color:#94a3b8;margin:0;">
        A few good places to start:
      </p>
      <ul style="font-size:14px;color:#cbd5e1;line-height:1.8;">
        <li><a style="color:#a5b4fc;" href="${APP_URL}/hook-lab">Hook Lab</a>: generate scroll-stopping openers</li>
        <li><a style="color:#a5b4fc;" href="${APP_URL}/caption-studio">Caption Studio</a>: rewrite captions for each platform</li>
        <li><a style="color:#a5b4fc;" href="${APP_URL}/calendar">Calendar</a>: schedule and track your posts</li>
      </ul>
    </td></tr>`;
  const text = `Welcome to Viralyz, ${name}!

Your AI co-pilot is ready. Analyze your first piece: ${APP_URL}/analyze

- Hook Lab: ${APP_URL}/hook-lab
- Caption Studio: ${APP_URL}/caption-studio
- Calendar: ${APP_URL}/calendar

Manage email preferences: ${APP_URL}/settings`;
  return { to: args.email, subject, html: shell(subject, "Your AI co-pilot is ready.", inner), text };
}

export type WeeklyDigestData = {
  firstName?: string | null;
  email: string;
  analysisCount: number;
  topAnalysis?: { id: string; title: string | null; viralScore: number | null; platform: string | null };
  averageScore: number | null;
  upcomingPosts: Array<{ id: string; title: string | null; scheduledFor: Date; platform: string | null }>;
  accuracy: { sampleSize: number; meanAbsoluteError: number | null };
};

export function renderWeeklyDigestEmail(d: WeeklyDigestData): EmailMessage {
  const name = d.firstName?.trim() || "creator";
  const subject = `Your weekly Viralyz recap (${d.analysisCount} ${d.analysisCount === 1 ? "analysis" : "analyses"})`;

  const topBlock = d.topAnalysis
    ? `<div style="background:#0f172a;border:1px solid #1f2937;border-radius:12px;padding:16px;margin:0 0 16px;">
        <div style="font-size:12px;color:#94a3b8;text-transform:uppercase;letter-spacing:.08em;">Top score this week</div>
        <div style="font-size:18px;color:#fff;margin:6px 0 4px;">${escapeHtml(d.topAnalysis.title || "Untitled analysis")}</div>
        <div style="font-size:28px;font-weight:700;color:#34d399;">${d.topAnalysis.viralScore ?? "-"}<span style="font-size:14px;color:#94a3b8;font-weight:500;"> /100${d.topAnalysis.platform ? ` · ${escapeHtml(d.topAnalysis.platform)}` : ""}</span></div>
      </div>`
    : `<div style="background:#0f172a;border:1px solid #1f2937;border-radius:12px;padding:16px;margin:0 0 16px;color:#94a3b8;">No analyses this week. Try one now to start tracking your scores.</div>`;

  const upcomingBlock = d.upcomingPosts.length
    ? `<div style="margin:0 0 16px;">
        <div style="font-size:12px;color:#94a3b8;text-transform:uppercase;letter-spacing:.08em;margin:0 0 8px;">Upcoming scheduled posts</div>
        ${d.upcomingPosts
          .map(
            (p) => `<div style="background:#0f172a;border:1px solid #1f2937;border-radius:10px;padding:12px;margin:0 0 8px;">
              <div style="color:#fff;font-size:14px;">${escapeHtml(p.title || "Untitled")}</div>
              <div style="color:#94a3b8;font-size:12px;margin-top:4px;">${new Date(p.scheduledFor).toUTCString()}${p.platform ? ` · ${escapeHtml(p.platform)}` : ""}</div>
            </div>`,
          )
          .join("")}
      </div>`
    : "";

  const accuracyBlock =
    d.accuracy.sampleSize > 0 && d.accuracy.meanAbsoluteError != null
      ? `<div style="background:#0f172a;border:1px solid #1f2937;border-radius:12px;padding:16px;margin:0 0 16px;">
          <div style="font-size:12px;color:#94a3b8;text-transform:uppercase;letter-spacing:.08em;">Prediction accuracy</div>
          <div style="font-size:16px;color:#fff;margin-top:6px;">Avg error of ${d.accuracy.meanAbsoluteError.toFixed(1)} pts across ${d.accuracy.sampleSize} posted ${d.accuracy.sampleSize === 1 ? "piece" : "pieces"}.</div>
        </div>`
      : "";

  const inner = `
    <tr><td>
      <h1 style="font-size:22px;color:#fff;margin:0 0 6px;">Hey ${escapeHtml(name)}, here's your week</h1>
      <p style="font-size:14px;color:#94a3b8;margin:0 0 20px;">${d.analysisCount} ${d.analysisCount === 1 ? "analysis" : "analyses"}${d.averageScore != null ? ` · avg score ${d.averageScore.toFixed(0)}/100` : ""}</p>
      ${topBlock}
      ${upcomingBlock}
      ${accuracyBlock}
      <p style="margin:24px 0 0;">
        <a href="${APP_URL}/dashboard" style="display:inline-block;background:#6366f1;color:#fff;text-decoration:none;padding:12px 20px;border-radius:10px;font-weight:600;">Open dashboard</a>
      </p>
    </td></tr>`;

  const text = `Your weekly Viralyz recap

${d.analysisCount} ${d.analysisCount === 1 ? "analysis" : "analyses"} this week${d.averageScore != null ? ` · avg score ${d.averageScore.toFixed(0)}/100` : ""}.
${d.topAnalysis ? `Top: ${d.topAnalysis.title || "Untitled"}: ${d.topAnalysis.viralScore ?? "-"}/100\n` : ""}${d.upcomingPosts.length ? `\nUpcoming:\n${d.upcomingPosts.map((p) => `- ${p.title || "Untitled"} @ ${new Date(p.scheduledFor).toUTCString()}`).join("\n")}\n` : ""}${d.accuracy.sampleSize > 0 && d.accuracy.meanAbsoluteError != null ? `\nPrediction accuracy: avg error ${d.accuracy.meanAbsoluteError.toFixed(1)} pts across ${d.accuracy.sampleSize} posted pieces.\n` : ""}
Dashboard: ${APP_URL}/dashboard
Manage email preferences: ${APP_URL}/settings`;

  return { to: d.email, subject, html: shell(subject, "Your weekly creator recap.", inner), text };
}

export type CompetitorDigestData = {
  firstName?: string | null;
  email: string;
  competitorName: string;
  competitorId: string;
  weekStart: Date;
  themes: Array<{ title: string; summary: string }>;
  amplifiers: Array<{ name: string; title?: string; reach: number }>;
  qualifiedEngagement: number;
  rawEngagement: number;
  postsThisWeek: number;
  velocityChangePct: number | null;
};

export function renderCompetitorDigestEmail(d: CompetitorDigestData): EmailMessage {
  const name = d.firstName?.trim() || "there";
  const subject = `Pulse: ${d.competitorName}, week of ${d.weekStart.toISOString().slice(0, 10)}`;
  const themesBlock = d.themes.length
    ? d.themes
        .map(
          (t) => `<div style="background:#0f172a;border:1px solid #1f2937;border-radius:10px;padding:12px;margin:0 0 8px;">
        <div style="color:#fff;font-size:14px;font-weight:600;">${escapeHtml(t.title)}</div>
        <div style="color:#cbd5e1;font-size:13px;margin-top:4px;line-height:1.5;">${escapeHtml(t.summary)}</div>
      </div>`,
        )
        .join("")
    : `<div style="color:#94a3b8;font-size:13px;">No themes detected this week.</div>`;
  const amplifiersBlock = d.amplifiers.length
    ? d.amplifiers
        .map(
          (a) => `<div style="display:block;color:#cbd5e1;font-size:13px;padding:6px 0;">
        <span style="color:#fff;font-weight:600;">${escapeHtml(a.name)}</span>${a.title ? ` <span style="color:#94a3b8;">· ${escapeHtml(a.title)}</span>` : ""}
        <span style="float:right;color:#a5b4fc;">${a.reach.toLocaleString()} reach</span>
      </div>`,
        )
        .join("")
    : `<div style="color:#94a3b8;font-size:13px;">No amplifiers detected this week.</div>`;
  const velocityLabel =
    d.velocityChangePct == null
      ? "n/a"
      : `${d.velocityChangePct > 0 ? "+" : ""}${d.velocityChangePct}% vs trailing 4w`;
  const inner = `
    <tr><td>
      <div style="font-size:12px;color:#94a3b8;text-transform:uppercase;letter-spacing:.08em;">Competitor pulse</div>
      <h1 style="font-size:22px;color:#fff;margin:4px 0 16px;">${escapeHtml(d.competitorName)}</h1>
      <div style="display:block;background:#0f172a;border:1px solid #1f2937;border-radius:12px;padding:16px;margin:0 0 16px;">
        <table width="100%" cellpadding="0" cellspacing="0"><tr>
          <td style="color:#fff;font-size:20px;font-weight:700;">${d.postsThisWeek}<div style="font-size:11px;color:#94a3b8;font-weight:500;text-transform:uppercase;letter-spacing:.06em;">posts this week</div></td>
          <td style="color:#34d399;font-size:20px;font-weight:700;text-align:center;">${d.qualifiedEngagement}<div style="font-size:11px;color:#94a3b8;font-weight:500;text-transform:uppercase;letter-spacing:.06em;">qualified eng</div></td>
          <td style="color:#94a3b8;font-size:14px;text-align:right;">${d.rawEngagement.toLocaleString()} raw<br><span style="color:#a5b4fc;font-size:12px;">${velocityLabel}</span></td>
        </tr></table>
      </div>
      <div style="font-size:12px;color:#94a3b8;text-transform:uppercase;letter-spacing:.08em;margin:0 0 8px;">Themes pushed</div>
      ${themesBlock}
      <div style="font-size:12px;color:#94a3b8;text-transform:uppercase;letter-spacing:.08em;margin:16px 0 8px;">Top amplifiers</div>
      ${amplifiersBlock}
      <p style="margin:24px 0 0;">
        <a href="${APP_URL}/intelligence/${d.competitorId}" style="display:inline-block;background:#6366f1;color:#fff;text-decoration:none;padding:12px 20px;border-radius:10px;font-weight:600;">Open full digest</a>
      </p>
      <p style="font-size:12px;color:#6b7280;margin:16px 0 0;">Hi ${escapeHtml(name)}, this is your Viralyz Signal weekly pulse for ${escapeHtml(d.competitorName)}.</p>
    </td></tr>`;
  const text = `Pulse: ${d.competitorName}, week of ${d.weekStart.toISOString().slice(0, 10)}

${d.postsThisWeek} posts this week. ${d.qualifiedEngagement} qualified engagement (${d.rawEngagement.toLocaleString()} raw). ${velocityLabel}.

Themes:
${d.themes.map((t) => `- ${t.title}: ${t.summary}`).join("\n") || "(none detected)"}

Amplifiers:
${d.amplifiers.map((a) => `- ${a.name}${a.title ? ` (${a.title})` : ""}: ${a.reach.toLocaleString()} reach`).join("\n") || "(none detected)"}

Open: ${APP_URL}/intelligence/${d.competitorId}`;
  return { to: d.email, subject, html: shell(subject, `Weekly pulse for ${d.competitorName}.`, inner), text };
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!,
  );
}
