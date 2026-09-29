"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import {
  Alert,
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Field,
  Input,
  PlatformChips,
  ScoreRing,
  Separator,
  Skeleton,
  StatCard,
  StatusChip,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Textarea,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
  type Platform,
} from "@repo/ui";

function SectionBlock({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24 border-t border-line py-10">
      <h2 className="font-display text-2xl font-semibold tracking-tight text-ink">
        {title}
      </h2>
      <div className="mt-6">{children}</div>
    </section>
  );
}

function SampleForm() {
  const [errors, setErrors] = useState<{ email?: string; note?: string }>({});
  const [sent, setSent] = useState(false);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const email = String(data.get("email") ?? "");
    const note = String(data.get("note") ?? "");
    const next: { email?: string; note?: string } = {};
    if (!email.includes("@")) next.email = "Enter a valid email address.";
    if (note.trim().length < 8) next.note = "Add at least a short note.";
    setErrors(next);
    setSent(Object.keys(next).length === 0);
  }

  return (
    <form onSubmit={onSubmit} className="max-w-md space-y-4" noValidate>
      <Field
        id="ds-email"
        label="Email"
        description="We only use this to reply."
        error={errors.email}
      >
        <Input name="email" type="email" autoComplete="email" placeholder="you@studio.com" />
      </Field>
      <Field id="ds-note" label="Note" error={errors.note}>
        <Textarea name="note" rows={4} placeholder="What should we standardise next?" />
      </Field>
      <Button type="submit">Check fields</Button>
      {sent ? (
        <Alert tone="success" title="Looks good">
          Validation passed. This sample stays on the page.
        </Alert>
      ) : null}
    </form>
  );
}

export function DesignSystemGallery() {
  const [platform, setPlatform] = useState<Platform>("tiktok");

  return (
    <TooltipProvider>
      <SectionBlock id="buttons" title="Buttons">
        <div className="flex flex-wrap items-center gap-3">
          <Button>Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="link">Link</Button>
          <Button variant="danger">Danger</Button>
          <Button size="sm">Small</Button>
          <Button size="lg">Large</Button>
          <Button disabled>Disabled</Button>
        </div>
      </SectionBlock>

      <SectionBlock id="fields" title="Fields">
        <SampleForm />
      </SectionBlock>

      <SectionBlock id="feedback" title="Badges and alerts">
        <div className="flex flex-wrap items-center gap-2">
          <Badge>Neutral</Badge>
          <Badge variant="accent">Accent</Badge>
          <Badge variant="success">Ready</Badge>
          <Badge variant="warning">Review</Badge>
          <Badge variant="danger">Blocked</Badge>
          <Badge variant="score" score={88} label="score" />
          <Badge variant="score" score={62} />
          <Badge variant="score" score={31} />
        </div>
        <div className="mt-6 grid gap-3">
          <Alert tone="info" title="Use one accent">
            Violet is for actions and links. Score colours stay on scores.
          </Alert>
          <Alert tone="warning" title="Check the claim">
            Example data should be labelled before it ships.
          </Alert>
          <Alert tone="danger" title="Something failed">
            Say what broke and what to do next.
          </Alert>
        </div>
      </SectionBlock>

      <SectionBlock id="surfaces" title="Cards, tabs, and dialogs">
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Hook Lab</CardTitle>
              <CardDescription>
                Shared cards keep radius, border, and shadow identical.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-ink-secondary">
              Put the action in the footer so the eye lands in the same place
              on every surface.
            </CardContent>
            <CardFooter>
              <Button size="sm">Open</Button>
              <Button size="sm" variant="ghost">
                Dismiss
              </Button>
            </CardFooter>
          </Card>
          <Card hoverable className="p-5">
            <p className="text-sm font-medium text-ink">Hoverable card</p>
            <p className="mt-2 text-sm text-ink-secondary">
              Use this for linked tiles. The lift is disabled when motion is reduced.
            </p>
          </Card>
        </div>

        <Tabs defaultValue="usage" className="mt-8">
          <TabsList>
            <TabsTrigger value="usage">Usage</TabsTrigger>
            <TabsTrigger value="import">Import</TabsTrigger>
          </TabsList>
          <TabsContent value="usage">
            Import primitives from <span className="font-mono text-ink">@repo/ui</span>.
            Marketing files re-export the same components so existing pages stay put.
          </TabsContent>
          <TabsContent value="import">
            <span className="font-mono text-ink">
              {`import { Button, Card, Field } from "@repo/ui"`}
            </span>
          </TabsContent>
        </Tabs>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="secondary">Open dialog</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Publish this cut?</DialogTitle>
                <DialogDescription>
                  Focus stays in the dialog until you close it. Escape and the
                  close button both dismiss it.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="ghost">Not yet</Button>
                </DialogClose>
                <Button>Publish</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost">Hover for a tip</Button>
            </TooltipTrigger>
            <TooltipContent>Tooltips explain, they do not hide required info.</TooltipContent>
          </Tooltip>
        </div>
      </SectionBlock>

      <SectionBlock id="status" title="Status and scores">
        <div className="flex flex-wrap items-center gap-2">
          <StatusChip tone="draft">Draft</StatusChip>
          <StatusChip tone="scheduled">Scheduled</StatusChip>
          <StatusChip tone="posted">Posted</StatusChip>
          <StatusChip tone="tracking">Tracking</StatusChip>
        </div>
        <div className="mt-6 flex flex-wrap items-end gap-8">
          <ScoreRing score={86} size={120} label="Score" />
          <ScoreRing score={54} size={96} label="Fair" />
          <ScoreRing score={28} size={96} label="Low" />
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <StatCard label="Posts scored" value="128" delta={{ value: "12%", direction: "up" }} />
          <StatCard label="Avg. score" value="74" footnote="Last 30 days" />
          <StatCard label="Best hook" value="86" variant="nba" />
        </div>
        <div className="mt-6">
          <PlatformChips value={platform} onChange={setPlatform} />
        </div>
      </SectionBlock>

      <SectionBlock id="loading" title="Loading">
        <div className="max-w-sm space-y-3">
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-24 w-full rounded-md" />
        </div>
        <Separator className="my-8" />
        <p className="text-sm text-ink-tertiary">
          Separators divide sections without adding another heading.
        </p>
      </SectionBlock>
    </TooltipProvider>
  );
}
