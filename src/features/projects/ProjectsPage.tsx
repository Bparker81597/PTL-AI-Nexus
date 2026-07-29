import { FormEvent, useState } from "react";
import { useClusterStore } from "../../app/useClusterStore";
import { Button, Card, Field, PageHeader, StatusBadge, inputClass, textareaClass } from "../../components/Ui";
import type { Project } from "../../types/domain";

export function ProjectsPage() {
  const { projects, characters, assets, createProject } = useClusterStore();
  const [name, setName] = useState("");

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!name.trim()) return;
    await createProject({ name, description: "New creator project", type: "mixed" });
    setName("");
  };

  return (
    <>
      <PageHeader eyebrow="Projects" title="Project system" />
      <div className="grid gap-4 xl:grid-cols-[360px_1fr]">
        <Card>
          <h3 className="mb-4 text-xl font-black">Start new project</h3>
          <form className="grid gap-4" onSubmit={submit}>
            <Field label="Project name"><input className={inputClass} value={name} onChange={(e) => setName(e.target.value)} /></Field>
            <Field label="Description"><textarea className={textareaClass} defaultValue="Characters, images, clips, audio, storyboards, scenes, and render jobs." /></Field>
            <Field label="Type"><select className={inputClass}><option>mixed</option><option>character</option><option>image</option><option>video</option><option>audio</option></select></Field>
            <Button type="submit">Create Project</Button>
          </form>
        </Card>
        <div className="grid gap-4">
          {projects.map((project: Project) => (
            <Card key={project.id}>
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div><h3 className="text-2xl font-black">{project.name}</h3><p className="mt-2 text-slate-300">{project.description}</p></div>
                <StatusBadge status={project.status} />
              </div>
              <div className="mt-5 grid gap-3 md:grid-cols-4">
                <div className="rounded-xl bg-white/7 p-3"><strong>{project.characterIds.length}</strong><p className="text-sm text-slate-300">Characters</p></div>
                <div className="rounded-xl bg-white/7 p-3"><strong>{project.assetIds.length}</strong><p className="text-sm text-slate-300">Assets</p></div>
                <div className="rounded-xl bg-white/7 p-3"><strong>{project.sceneIds.length}</strong><p className="text-sm text-slate-300">Scenes</p></div>
                <div className="rounded-xl bg-white/7 p-3"><strong>{characters.length + assets.length}</strong><p className="text-sm text-slate-300">Linked items</p></div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </>
  );
}
