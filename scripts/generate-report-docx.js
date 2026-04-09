const fs = require("fs");
const path = require("path");

const root = process.cwd();
const buildDir = path.join(root, "docs", "report-docx-build");
const outDir = path.join(root, "docs");

const images = [
  { file: "repo-root.png", caption: "Figure 1. Real repository root structure used for project organization." },
  { file: "git-log.png", caption: "Figure 2. Real git history evidence from the repository." },
  { file: "backend-authcontroller.png", caption: "Figure 3. Authentication controller showing backend route implementation." },
  { file: "backend-taskcontroller.png", caption: "Figure 4. Task controller showing CRUD and comment route definitions." },
  { file: "frontend-login.png", caption: "Figure 5. Real deployed frontend login page." },
  { file: "frontend-register.png", caption: "Figure 6. Real deployed frontend registration page." },
  { file: "dockerfile.png", caption: "Figure 7. Dockerfile used for multi-stage application packaging." },
  { file: "docker-compose.png", caption: "Figure 8. Docker Compose configuration for local execution." },
  { file: "ci-workflow.png", caption: "Figure 9. GitHub Actions CI workflow for testing and build validation." },
  { file: "docker-publish-workflow.png", caption: "Figure 10. Docker publish workflow for image automation." },
];

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function escapeXml(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function paragraph(text, options = {}) {
  const {
    align,
    bold,
    italic,
    underline,
    size,
    color,
    spacingBefore = 0,
    spacingAfter = 120,
    pageBreakBefore = false,
  } = options;

  const pPr = [];
  if (align) pPr.push(`<w:jc w:val="${align}"/>`);
  pPr.push(`<w:spacing w:before="${spacingBefore}" w:after="${spacingAfter}"/>`);

  const rPr = [];
  if (bold) rPr.push("<w:b/>");
  if (italic) rPr.push("<w:i/>");
  if (underline) rPr.push('<w:u w:val="single"/>');
  if (size) {
    rPr.push(`<w:sz w:val="${size}"/>`);
    rPr.push(`<w:szCs w:val="${size}"/>`);
  }
  if (color) rPr.push(`<w:color w:val="${color}"/>`);

  const pageBreak = pageBreakBefore ? '<w:r><w:br w:type="page"/></w:r>' : "";

  return `<w:p><w:pPr>${pPr.join("")}</w:pPr>${pageBreak}<w:r><w:rPr>${rPr.join("")}</w:rPr><w:t xml:space="preserve">${escapeXml(
    text,
  )}</w:t></w:r></w:p>`;
}

function imageBlock(relId, imageIndex, caption, cx = 5486400, cy = 3200400) {
  return `
<w:p>
  <w:pPr><w:jc w:val="center"/><w:spacing w:before="120" w:after="120"/></w:pPr>
  <w:r>
    <w:drawing>
      <wp:inline distT="0" distB="0" distL="0" distR="0"
        xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing">
        <wp:extent cx="${cx}" cy="${cy}"/>
        <wp:docPr id="${100 + imageIndex}" name="Picture ${imageIndex}"/>
        <a:graphic xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main">
          <a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture">
            <pic:pic xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture">
              <pic:nvPicPr>
                <pic:cNvPr id="${100 + imageIndex}" name="Picture ${imageIndex}"/>
                <pic:cNvPicPr/>
              </pic:nvPicPr>
              <pic:blipFill>
                <a:blip r:embed="${relId}"/>
                <a:stretch><a:fillRect/></a:stretch>
              </pic:blipFill>
              <pic:spPr>
                <a:xfrm><a:off x="0" y="0"/><a:ext cx="${cx}" cy="${cy}"/></a:xfrm>
                <a:prstGeom prst="rect"><a:avLst/></a:prstGeom>
              </pic:spPr>
            </pic:pic>
          </a:graphicData>
        </a:graphic>
      </wp:inline>
    </w:drawing>
  </w:r>
</w:p>
${paragraph(caption, { align: "center", italic: true, size: 20, spacingAfter: 180 })}
`;
}

const blocks = [];

blocks.push(paragraph("Task Management System", { align: "center", bold: true, size: 36, spacingBefore: 800, spacingAfter: 220 }));
blocks.push(paragraph("Academic Project Report", { align: "center", bold: true, size: 28, spacingAfter: 360 }));
blocks.push(paragraph("Master's Level Full-Stack Software Development Project", { align: "center", italic: true, size: 22, color: "4F81BD", spacingAfter: 720 }));
blocks.push(paragraph("Program: Master of Science", { align: "center", size: 22, spacingAfter: 120 }));
blocks.push(paragraph("Project Type: Team-Based Full-Stack Web Application", { align: "center", size: 22, spacingAfter: 120 }));
blocks.push(paragraph("Report Prepared from the real current project state", { align: "center", size: 20, spacingAfter: 720 }));
blocks.push(paragraph("", { pageBreakBefore: true, spacingAfter: 0 }));

blocks.push(paragraph("Abstract", { bold: true, size: 28, spacingAfter: 180 }));
blocks.push(
  paragraph(
    "This report presents the complete workflow, implementation process, collaboration strategy, and deployment preparation of a team-based Task Management System. The project was developed as a full-stack application using Spring Boot, React, TypeScript, PostgreSQL, Docker, GitHub Actions, and Netlify. The system supports user authentication, workspace collaboration, task CRUD operations, task comments, automated build validation, and public demonstration support. The report documents the role distribution across team members and explains how project management, backend development, frontend implementation, and DevOps automation were combined into a unified software engineering process.",
    { size: 22, spacingAfter: 260 },
  ),
);

blocks.push(paragraph("1. Introduction", { bold: true, size: 28, spacingAfter: 180 }));
blocks.push(
  paragraph(
    "The Task Management System was developed as a collaborative software engineering project intended to reflect practical team-based full-stack development. The system allows users to register, create and join workspaces, manage tasks, assign work, add comments, and track progress visually. Beyond software functionality, the project emphasized disciplined Git usage, branch-based teamwork, reproducible deployment, and automated validation.",
    { size: 22 },
  ),
);

blocks.push(paragraph("2. Project Objectives", { bold: true, size: 28, spacingAfter: 180 }));
[
  "To build a complete full-stack web application with collaborative task management features.",
  "To distribute development responsibilities across defined team roles.",
  "To implement backend APIs, frontend pages, and persistent data storage.",
  "To package the system using Docker for consistent local execution.",
  "To automate testing and build validation through GitHub Actions.",
  "To prepare the project for public demonstration through hosted frontend deployment.",
].forEach((item) => blocks.push(paragraph(`- ${item}`, { size: 22, spacingAfter: 100 })));

blocks.push(paragraph("3. Team Role Distribution", { bold: true, size: 28, spacingAfter: 180 }));
[
  "Member 1: Project manager and GitHub maintainer. Responsible for repository creation, branch management, merge control, task tracking, and final repository preparation.",
  "Member 2: Backend developer. Responsible for API routes, database connection, CRUD logic, security, and API testing.",
  "Member 3: Frontend developer. Responsible for forms, pages, frontend-backend integration, and demo-friendly interface design.",
  "Member 4: DevOps, Docker, and CI-CD developer. Responsible for Dockerfile, docker-compose, GitHub Actions, and automated build readiness.",
].forEach((item) => blocks.push(paragraph(`- ${item}`, { size: 22, spacingAfter: 100 })));

blocks.push(paragraph("4. GitHub and Repository Management Workflow", { bold: true, size: 28, spacingAfter: 180 }));
blocks.push(
  paragraph(
    "Version control was used as the coordination backbone of the project. The repository was organized into backend, frontend, workflow, documentation, and deployment sections. Branch-based collaboration allowed multiple members to work in parallel while the project manager controlled integration and maintained the final repository structure.",
    { size: 22 },
  ),
);
blocks.push(imageBlock("rId1", 1, images[0].caption));
blocks.push(imageBlock("rId2", 2, images[1].caption, 4300000, 1700000));

blocks.push(paragraph("5. Backend Development", { bold: true, size: 28, spacingAfter: 180 }));
blocks.push(
  paragraph(
    "The backend was built with Spring Boot and Java. PostgreSQL was connected through JPA and application configuration. The backend developer implemented authentication routes, workspace routes, task CRUD routes, and comment routes. Spring Security protected authenticated operations and ensured that access was limited to authorized users.",
    { size: 22 },
  ),
);
blocks.push(imageBlock("rId3", 3, images[2].caption));
blocks.push(imageBlock("rId4", 4, images[3].caption));

blocks.push(paragraph("6. Frontend Development and Integration", { bold: true, size: 28, spacingAfter: 180 }));
blocks.push(
  paragraph(
    "The frontend was developed using React, TypeScript, and Vite. It includes login and registration pages, workspace management, and a task board interface. The frontend was connected to backend APIs through a dedicated API layer and authentication context. Additional work was completed to improve usability and make the application suitable for live demonstration.",
    { size: 22 },
  ),
);
blocks.push(imageBlock("rId5", 5, images[4].caption));
blocks.push(imageBlock("rId6", 6, images[5].caption));

blocks.push(paragraph("7. Docker and Containerization", { bold: true, size: 28, spacingAfter: 180 }));
blocks.push(
  paragraph(
    "The project includes a multi-stage Dockerfile that builds the frontend, packages it into the backend application, and produces a runnable image. Docker Compose was added to run the application together with PostgreSQL in a local environment. This ensured consistency across developer machines and simplified demonstration setup.",
    { size: 22 },
  ),
);
blocks.push(imageBlock("rId7", 7, images[6].caption, 4300000, 1700000));
blocks.push(imageBlock("rId8", 8, images[7].caption, 4300000, 1700000));

blocks.push(paragraph("8. CI/CD and Automation", { bold: true, size: 28, spacingAfter: 180 }));
blocks.push(
  paragraph(
    "GitHub Actions workflows were configured to automate validation of the project. The CI workflow installs frontend dependencies, runs frontend tests, builds the frontend, and executes backend tests. A second workflow builds and publishes Docker images from the main branch, supporting repeatable delivery practices.",
    { size: 22 },
  ),
);
blocks.push(imageBlock("rId9", 9, images[8].caption, 4300000, 1700000));
blocks.push(imageBlock("rId10", 10, images[9].caption, 4300000, 1700000));

blocks.push(paragraph("9. Deployment and Demo Preparation", { bold: true, size: 28, spacingAfter: 180 }));
blocks.push(
  paragraph(
    "The frontend was deployed to Netlify for public demonstration. Because the backend required separate hosting, the frontend was additionally prepared for hosted demo use. This allowed the system to remain usable during presentation while preserving the original full-stack architecture.",
    { size: 22 },
  ),
);

blocks.push(paragraph("10. Challenges Encountered", { bold: true, size: 28, spacingAfter: 180 }));
[
  "Integration between frontend and backend required careful API consistency.",
  "Public hosting was straightforward for the frontend but more complex for the backend and database stack.",
  "Coordinating team contributions required disciplined branch management and repository structure control.",
  "The project required both Java and Node toolchains, which increased the importance of Docker and CI automation.",
].forEach((item) => blocks.push(paragraph(`- ${item}`, { size: 22, spacingAfter: 100 })));

blocks.push(paragraph("11. Conclusion", { bold: true, size: 28, spacingAfter: 180 }));
blocks.push(
  paragraph(
    "The Task Management System demonstrates a complete team-based software engineering workflow appropriate for master's-level academic work. The project integrates repository management, backend engineering, frontend development, containerization, automated testing, and deployment preparation into a single coordinated process. The resulting system is not only a functional CRUD-based application, but also a structured example of collaborative full-stack development practice.",
    { size: 22 },
  ),
);

const documentXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document
  xmlns:wpc="http://schemas.microsoft.com/office/word/2010/wordprocessingCanvas"
  xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006"
  xmlns:o="urn:schemas-microsoft-com:office:office"
  xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"
  xmlns:m="http://schemas.openxmlformats.org/officeDocument/2006/math"
  xmlns:v="urn:schemas-microsoft-com:vml"
  xmlns:wp14="http://schemas.microsoft.com/office/word/2010/wordprocessingDrawing"
  xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing"
  xmlns:w10="urn:schemas-microsoft-com:office:word"
  xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"
  xmlns:w14="http://schemas.microsoft.com/office/word/2010/wordml"
  xmlns:w15="http://schemas.microsoft.com/office/word/2012/wordml"
  xmlns:wpg="http://schemas.microsoft.com/office/word/2010/wordprocessingGroup"
  xmlns:wpi="http://schemas.microsoft.com/office/word/2010/wordprocessingInk"
  xmlns:wne="http://schemas.microsoft.com/office/word/2006/wordml"
  xmlns:wps="http://schemas.microsoft.com/office/word/2010/wordprocessingShape"
  xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"
  xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture"
  mc:Ignorable="w14 wp14 w15">
  <w:body>
    ${blocks.join("\n")}
    <w:sectPr>
      <w:pgSz w:w="12240" w:h="15840"/>
      <w:pgMar w:top="1080" w:right="1080" w:bottom="1080" w:left="1080" w:header="720" w:footer="720" w:gutter="0"/>
    </w:sectPr>
  </w:body>
</w:document>`;

const contentTypes = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Default Extension="png" ContentType="image/png"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
  <Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>
  <Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/>
</Types>`;

const packageRels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/>
  <Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/>
</Relationships>`;

const documentRels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  ${images
    .map(
      (image, index) =>
        `<Relationship Id="rId${index + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/${image.file}"/>`,
    )
    .join("\n  ")}
</Relationships>`;

const appXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties"
 xmlns:vt="http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes">
  <Application>Microsoft Office Word</Application>
  <DocSecurity>0</DocSecurity>
  <ScaleCrop>false</ScaleCrop>
  <SharedDoc>false</SharedDoc>
  <HyperlinksChanged>false</HyperlinksChanged>
  <AppVersion>16.0000</AppVersion>
</Properties>`;

const coreXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties"
 xmlns:dc="http://purl.org/dc/elements/1.1/"
 xmlns:dcterms="http://purl.org/dc/terms/"
 xmlns:dcmitype="http://purl.org/dc/dcmitype/"
 xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <dc:title>Task Management System Academic Project Report</dc:title>
  <dc:subject>Software Development Report</dc:subject>
  <dc:creator>OpenAI Codex</dc:creator>
  <cp:keywords>Task Management, Spring Boot, React, Docker, CI/CD</cp:keywords>
  <dc:description>Master's level academic report generated from the project workflow and real screenshots.</dc:description>
  <cp:lastModifiedBy>OpenAI Codex</cp:lastModifiedBy>
  <dcterms:created xsi:type="dcterms:W3CDTF">2026-04-09T00:00:00Z</dcterms:created>
  <dcterms:modified xsi:type="dcterms:W3CDTF">2026-04-09T00:00:00Z</dcterms:modified>
</cp:coreProperties>`;

fs.rmSync(buildDir, { recursive: true, force: true });
ensureDir(path.join(buildDir, "_rels"));
ensureDir(path.join(buildDir, "docProps"));
ensureDir(path.join(buildDir, "word", "_rels"));
ensureDir(path.join(buildDir, "word", "media"));

fs.writeFileSync(path.join(buildDir, "[Content_Types].xml"), contentTypes);
fs.writeFileSync(path.join(buildDir, "_rels", ".rels"), packageRels);
fs.writeFileSync(path.join(buildDir, "docProps", "app.xml"), appXml);
fs.writeFileSync(path.join(buildDir, "docProps", "core.xml"), coreXml);
fs.writeFileSync(path.join(buildDir, "word", "document.xml"), documentXml);
fs.writeFileSync(path.join(buildDir, "word", "_rels", "document.xml.rels"), documentRels);

for (const image of images) {
  const src = path.join(root, "docs", "real-screenshots", image.file);
  const dest = path.join(buildDir, "word", "media", image.file);
  fs.copyFileSync(src, dest);
}

console.log("DOCX build folder generated:", buildDir);
