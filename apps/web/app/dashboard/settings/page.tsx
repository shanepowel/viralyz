export default function SettingsPage() {
  return (
    <div className="p-8">
      <h1 className="mb-2 text-2xl font-bold">Settings</h1>
      <p className="mb-8 text-muted-foreground">
        Configure your account, API keys, and integrations.
      </p>

      <div className="max-w-2xl space-y-6">
        <section className="rounded-xl border border-border bg-card p-6">
          <h2 className="mb-4 font-semibold">API Keys</h2>
          <p className="mb-4 text-sm text-muted-foreground">
            Add your OpenAI or Anthropic API key to enable AI-powered tools.
          </p>
          <div className="rounded-lg border border-dashed border-border p-4 text-sm text-muted-foreground">
            Authentication via Clerk will be configured in the next phase.
          </div>
        </section>

        <section className="rounded-xl border border-border bg-card p-6">
          <h2 className="mb-4 font-semibold">Connected Accounts</h2>
          <p className="text-sm text-muted-foreground">
            Connect Instagram, TikTok, and YouTube for competitor tracking and Auto DM.
          </p>
        </section>
      </div>
    </div>
  );
}
