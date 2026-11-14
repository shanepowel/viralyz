"use server";

import { headers } from "next/headers";
import { z } from "zod";
import { CONTACT } from "@/lib/site";

export type FormState = {
  ok: boolean;
  errors?: Record<string, string[]>;
  message?: string;
};

const contactSchema = z.object({
  name: z.string().min(2, "Add your name"),
  email: z.string().email("That email doesn't look right"),
  company: z.string().optional(),
  message: z.string().min(10, "Tell us a little more"),
  website: z.string().max(0).optional(),
});

const newsletterSchema = z.object({
  email: z.string().email("That email doesn't look right"),
  website: z.string().max(0).optional(),
});

const RESEND = "https://api.resend.com";

/** Small per-instance limiter: enough to blunt a burst from one address. */
const hits = new Map<string, number[]>();
async function limited(scope: string): Promise<boolean> {
  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const key = `${scope}:${ip}`;
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < 10 * 60 * 1000);
  recent.push(now);
  hits.set(key, recent);
  return recent.length > 5;
}

function escapeHtml(v: string) {
  return v.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

async function resend(path: string, body: unknown): Promise<boolean> {
  const key = process.env.RESEND_API_KEY;
  if (!key) return false;
  try {
    const res = await fetch(`${RESEND}${path}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) console.error("[forms] resend", path, res.status);
    return res.ok;
  } catch (err) {
    console.error("[forms] resend", path, err);
    return false;
  }
}

const NOT_SENT = `We could not send that just now. Please email ${CONTACT.hello} instead.`;

export async function submitContact(
  _prev: FormState,
  form: FormData,
): Promise<FormState> {
  const parsed = contactSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) {
    return { ok: false, errors: parsed.error.flatten().fieldErrors };
  }
  // Honeypot: tell a bot it worked and do nothing.
  if (parsed.data.website) return { ok: true };
  if (await limited("contact")) {
    return { ok: false, message: "Too many messages from this connection. Try again in a few minutes." };
  }

  const { name, email, company, message } = parsed.data;
  const from = process.env.CONTACT_FROM_EMAIL || "Viralyz <hello@viralyz.com>";
  const sent = await resend("/emails", {
    from,
    to: [process.env.CONTACT_TO_EMAIL || CONTACT.hello],
    reply_to: email,
    subject: `Contact form: ${name}${company ? ` (${company})` : ""}`,
    html: `<p><strong>${escapeHtml(name)}</strong> &lt;${escapeHtml(email)}&gt;${
      company ? `, ${escapeHtml(company)}` : ""
    }</p><p style="white-space:pre-wrap">${escapeHtml(message)}</p>`,
  });
  // Never claim a message was sent when it was not.
  if (!sent) return { ok: false, message: NOT_SENT };

  await resend("/emails", {
    from,
    to: [email],
    subject: "We have your message",
    html: `<p>Hi ${escapeHtml(name)},</p><p>Thanks for getting in touch. We reply within one working day.</p><p>Viralyz</p>`,
  });
  return { ok: true, message: "Message sent. We reply within one working day." };
}

export async function submitNewsletter(
  _prev: FormState,
  form: FormData,
): Promise<FormState> {
  const parsed = newsletterSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) {
    return { ok: false, errors: parsed.error.flatten().fieldErrors };
  }
  if (parsed.data.website) return { ok: true };
  if (await limited("newsletter")) {
    return { ok: false, message: "Too many tries from this connection. Try again in a few minutes." };
  }

  const audience = process.env.RESEND_AUDIENCE_ID;
  const saved = audience
    ? await resend(`/audiences/${audience}/contacts`, { email: parsed.data.email, unsubscribed: false })
    : false;
  if (!saved) return { ok: false, message: NOT_SENT };
  return { ok: true, message: "You are on the list." };
}

export async function submitLaunchNotify(
  _prev: FormState,
  form: FormData,
): Promise<FormState> {
  return submitNewsletter(_prev, form);
}
