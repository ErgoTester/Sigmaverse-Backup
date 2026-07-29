import fs from "fs/promises";

async function fetchAllProjects() {
  const projects = [];
  let page = 1;

  while (true) {
    const res = await fetch(`https://sigma-admin.ergoplatform.com/api/project-cards?populate=*&pagination[pageSize]=100&pagination[page]=${page}`);
    if (!res.ok) throw new Error(`Failed to fetch page ${page}: ${res.status}`);

    const { data = [], meta } = await res.json();
    if (!data.length) break;

    projects.push(
      ...data.map(({ attributes: a }) => ({
        name: a.name,
        description: a.description,
        websiteLink: a.websiteLink,
        category: a.categories?.projectCategories ?? null,
        projectCategories: a.project_categories?.data?.[0]?.attributes.title ?? null,
      }))
    );

    if (page >= (meta?.pagination?.pageCount ?? 1)) break;
    page++;
  }

  return projects;
}

async function main() {
  try {
    const projects = await fetchAllProjects();

    projects.sort((a, b) => 
      (a.projectCategories ?? "").localeCompare(b.projectCategories ?? "") ||
      a.name.localeCompare(b.name)
    );

    await fs.mkdir("data", { recursive: true });
    await fs.writeFile("data/projects.json", JSON.stringify(projects, null, 2));
  } catch {
    process.exit(1);
  }
}

main();
