import { useClusterStore } from "../../app/useClusterStore";
import { Button, Card, PageHeader, StatusBadge } from "../../components/Ui";

export function RenderQueuePage() {
  const { renderJobs, retryJob } = useClusterStore();

  return (
    <>
      <PageHeader eyebrow="Render Queue" title="Job processing" />
      <Card>
        <div className="grid gap-3">
          {renderJobs.map((job) => (
            <div key={job.id} className="grid gap-4 rounded-xl bg-white/7 p-4 xl:grid-cols-[1.2fr_1fr_0.8fr_0.8fr_1fr_auto] xl:items-center">
              <div><strong>{job.name}</strong><p className="text-sm text-slate-300">{job.projectName ?? "No project"}</p></div>
              <span className="font-bold">{job.generationType}</span>
              <span>{job.providerId}</span>
              <StatusBadge status={job.status} />
              <div><div className="h-2 rounded-full bg-white/10"><div className="h-2 rounded-full bg-cyan-300" style={{ width: `${job.progress}%` }} /></div><p className="mt-1 text-xs text-slate-300">{job.progress}% - {job.estimatedCompletion}</p></div>
              <div className="flex gap-2">
                <Button variant="secondary">Cancel</Button>
                <Button variant="secondary" onClick={() => void retryJob(job.id)}>Retry</Button>
                <Button variant="secondary">View</Button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </>
  );
}
