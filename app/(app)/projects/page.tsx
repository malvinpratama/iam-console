import { ProjectsManager } from "@/components/projects-manager";
import { iamGet, backendLabel, type ProjectsResponse, type Identity } from "@/lib/iam";

export default async function Projects() {
  let projects: ProjectsResponse = { projects: [] };
  let perms: string[] = [];
  let error: string | null = null;
  try {
    const [p, me] = await Promise.all([
      iamGet<ProjectsResponse>("/projects"),
      iamGet<Identity>("/me"),
    ]);
    projects = p;
    perms = me.permissions;
  } catch (e) {
    error = (e as Error).message;
  }

  return (
    <div className="rise">
      <header className="mb-8">
        <div className="mono mb-1 text-xs uppercase tracking-[0.25em] text-muted">
          Active tenant
        </div>
        <h1 className="font-display text-3xl font-extrabold tracking-tight text-text">Projects</h1>
      </header>
      {error ? (
        <div className="card p-6 text-sm text-danger">
          Couldn&apos;t load projects ({await backendLabel()}): <span className="mono">{error}</span>
        </div>
      ) : (
        <ProjectsManager projects={projects.projects} canWrite={perms.includes("project:write")} />
      )}
    </div>
  );
}
