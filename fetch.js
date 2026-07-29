import fs from "fs/promises";

async function fetchAllProjects() {
  const projects = [];
  let page = 1;

  while (true) {
    const url = `https://sigma-admin.ergoplatform.com/api/project-cards?populate=*&pagination[pageSize]=100&pagination[page]=${page}`;

    const res = await fetch(url);

    if (!res.ok) {
      throw new Error(`Failed to fetch page ${page}: ${res.status}`);
    }

    const json = await res.json();
    const data = json.data ?? [];

    if (data.length === 0) {
      break;
    }

    projects.push(
      ...data.map((item) => {
        const attrs = item.attributes;

        return {
          name: attrs.name,
          description: attrs.description,
          websiteLink: attrs.websiteLink,
          category: attrs.categories?.projectCategories ?? null,
          projectCategories: attrs.project_categories?.data?.[0]?.attributes.title ?? null,
        };
      })
    );

    const pagination = json.meta?.pagination;

    if (!pagination || page >= pagination.pageCount) {
      break;
    }

    page++;
  }

  return projects;
}

async function main() {
  try {
    const projects = await fetchAllProjects();

    projects.sort((a, b) => {
      const categoryA = a.projectCategories ?? "";
      const categoryB = b.projectCategories ?? "";

      const categoryCompare = categoryA.localeCompare(categoryB);

      if (categoryCompare !== 0) {
        return categoryCompare;
      }

      return a.name.localeCompare(b.name);
    });

    await fs.mkdir("data", { recursive: true });

    await fs.writeFile(
      "data/projects.json",
      JSON.stringify(projects, null, 2),
      "utf8"
    );
  } catch (err) {
    process.exit(1);
  }
}

main();
