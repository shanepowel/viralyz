"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { submitContact, type FormState } from "@/app/actions/forms";
import { Button } from "@/components/ui/Button";
import { Field, Input, Textarea } from "@/components/ui/Field";
import { track } from "@/lib/analytics";
import { useEffect } from "react";

const initial: FormState = { ok: false };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full sm:w-auto">
      {pending ? "Sending…" : "Send message"}
    </Button>
  );
}

export function ContactForm() {
  const [state, action] = useActionState(submitContact, initial);

  useEffect(() => {
    if (state.ok) track("contact_submitted");
  }, [state.ok]);

  if (state.ok) {
    return (
      <div className="rounded-md border border-line bg-raised p-8 shadow-sm">
        <h3 className="text-lg font-semibold text-ink">Message sent</h3>
        <p className="mt-2 text-sm text-ink-secondary">
          {state.message ?? "We reply within one working day."}
        </p>
      </div>
    );
  }

  return (
    <form action={action} className="space-y-4">
      <Field id="name" label="Your name" error={state.errors?.name?.[0]}>
        <Input name="name" required autoComplete="name" />
      </Field>
      <Field id="email" label="Email" error={state.errors?.email?.[0]}>
        <Input name="email" type="email" required autoComplete="email" />
      </Field>
      <Field id="company" label="Company (optional)">
        <Input name="company" autoComplete="organization" />
      </Field>
      <Field
        id="message"
        label="Message"
        error={state.errors?.message?.[0]}
      >
        <Textarea name="message" required rows={5} />
      </Field>
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        className="hidden"
        aria-hidden
      />
      <SubmitButton />
    </form>
  );
}
