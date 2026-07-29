import fs from "fs/promises";

const BASE =
  "https://sigma-admin.ergoplatform.com/api/project-cards";

async function fetchAllProjects() {
  const projects = [];
  let page = 1;

  while (true) {
    const url =
      `${BASE}?populate=*&pagination[pageSize]=100&pagination[page]=${page}`;

    console.log(`Fetching page ${page}...`);

    const res = await fetch(url);

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }

    const json = await res.json();

    const data = json.data ?? [];

    if (data.length === 0) break;

    projects.push(
      ...data.map((item) => ({
        name: item.attributes.name,
        description: item.attributes.description,
        websiteLink: item.attributes.websiteLink,
      }))
    );

    const pagination = json.meta?.pagination;

    if (!pagination || page >= pagination.pageCount) {
      break;
    }

    page++;
  }

  return projects;
}

const projects = await fetchAllProjects();

await fs.mkdir("data", { recursive: true });

await fs.writeFile(
  "data/projects.json",
  JSON.stringify(projects, null, 2)
);

console.log(`Saved ${projects.length} projects.`);
