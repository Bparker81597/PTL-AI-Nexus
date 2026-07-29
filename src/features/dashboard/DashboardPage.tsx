import { Link } from "react-router-dom";
import { useClusterStore } from "../../app/useClusterStore";
import { Button, Card, PageHeader, StatusBadge } from "../../components/Ui";

const quickActions = [
  ["Create Character", "/characters"],
  ["Generate Image", "/canvas"],
  ["Animate Scene", "/dreamframe"],
  ["Create Audio", "/novatone"],
  ["Start New Project", "/projects"],
] as const;

export function DashboardPage() {
  const { assets, characters, projects, renderJobs, loading } = useClusterStore();
  const activeJobs = renderJobs.filter((job) => ["queued", "preparing", "running"].includes(job.status));
  const storageUsed = Math.min(82, assets.length * 7);

  if (loading) return <p className="text-slate-300">Loading PTL AI Cluster...</p>;

  return (
    <>
      <PageHeader eyebrow="Creator command center" title="Welcome back to PTL AI Cluster">
        <div className="flex flex-wrap gap-2">
          {quickActions.map(([label, href]) => (
            <Link key={href} to={href}>
              <Button>{label}</Button>
            </Link>
          ))}
        </div>
      </PageHeader>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card><p className="text-sm text-slate-300">Recent projects</p><strong className="text-4xl">{projects.length}</strong></Card>
        <Card><p className="text-sm text-slate-300">Active render jobs</p><strong className="text-4xl">{activeJobs.length}</strong></Card>
        <Card><p className="text-sm text-slate-300">Saved characters</p><strong className="text-4xl">{characters.length}</strong></Card>
        <Card><p className="text-sm text-slate-300">Storage usage</p><strong className="text-4xl">{storageUsed}%</strong></Card>
      </div>
      <div className="mt-4 grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <h3 className="mb-4 text-xl font-black">Recent projects</h3>
          <div className="grid gap-3">
            {projects.map((project) => (
              <Link key={project.id} to="/projects" className="rounded-xl bg-white/7 p-4 transition hover:bg-white/10">
                <div className="flex items-center justify-between gap-3">
                  <strong>{project.name}</strong>
                  <StatusBadge status={project.status} />
                </div>
                <p className="mt-2 text-sm text-slate-300">{project.description}</p>
              </Link>
            ))}
          </div>
        </Card>
        <Card>
          <h3 className="mb-4 text-xl font-black">AI engine status</h3>
          <div className="grid gap-3">
            {["Mock Provider connected", "ComfyUI placeholder", "RunPod placeholder", "R2 storage placeholder"].map((item) => (
              <div key={item} className="flex items-center justify-between rounded-xl bg-white/7 p-3">
                <span className="font-bold">{item}</span>
                <span className="h-3 w-3 rounded-full bg-teal-300" />
              </div>
            ))}
          </div>
        </Card>
      </div>
      <div className="mt-4 grid gap-4 xl:grid-cols-2">
        <Card>
          <h3 className="mb-4 text-xl font-black">Activity history</h3>
          <div className="grid gap-3">
            {renderJobs.slice(0, 5).map((job) => (
              <div key={job.id} className="flex items-center justify-between gap-3 rounded-xl bg-white/7 p-3">
                <span className="font-bold">{job.name}</span>
                <StatusBadge status={job.status} />
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <h3 className="mb-4 text-xl font-black">Saved characters</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            {characters.map((character) => (
              <Link key={character.id} to={`/characters/${character.id}`} className="rounded-xl bg-white/7 p-4 hover:bg-white/10">
                <strong>{character.name}</strong>
                <p className="mt-2 text-sm text-slate-300">{character.visualStyle}</p>
              </Link>
            ))}
          </div>
        </Card>
      </div>
    </>
  );
}
