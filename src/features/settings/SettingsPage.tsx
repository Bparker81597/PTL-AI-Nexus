import { Card, PageHeader } from "../../components/Ui";

export function SettingsPage() {
  return (
    <>
      <PageHeader eyebrow="Settings" title="Workspace configuration" />
      <Card>
        <h3 className="mb-3 text-xl font-black">Security rules</h3>
        <p className="max-w-3xl leading-7 text-slate-300">
          Frontend environment variables can only use public values. RunPod keys, Cloudflare R2 secrets,
          Supabase service keys, and provider credentials must live in a secure backend service.
        </p>
      </Card>
    </>
  );
}
