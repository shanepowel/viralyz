"use server";

import { z } from "zod";

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

export async function submitContact(
  _prev: FormState,
  form: FormData,
): Promise<FormState> {
  const parsed = contactSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) {
    return { ok: false, errors: parsed.error.flatten().fieldErrors };
  }
  if (parsed.data.website) return { ok: true };
  // Wire Resend later — accept and acknowledge for now.
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
  return { ok: true };
}

export async function submitLaunchNotify(
  _prev: FormState,
  form: FormData,
): Promise<FormState> {
  return submitNewsletter(_prev, form);
}
