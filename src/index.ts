import express from "express";
import { Pool } from "pg";

const app = express();
const port = Number(process.env.PORT) || 3000;
const appName = process.env.APP_NAME || "Project Feature Request App";
const appMessage =
  process.env.APP_MESSAGE ||
  "This simple web application was built with Node.js, Express, and TypeScript for Task 3.2. It includes multiple pages and a working form so the app is more than a basic landing page.";
const databaseUrl = process.env.DATABASE_URL;

app.use(express.urlencoded({ extended: true }));

type Feature = {
  title: string;
  detail: string;
};

type RequestEntry = {
  id?: number;
  name: string;
  idea: string;
};

const features: Feature[] = [
  {
    title: "Express Routing",
    detail: "The app uses multiple routes so users can view the homepage, project info, and submitted ideas.",
  },
  {
    title: "TypeScript Build",
    detail: "The source code is written in TypeScript and compiled before deployment.",
  },
  {
    title: "Form Handling",
    detail: "A simple form lets users submit feature ideas to simulate user interaction.",
  },
];

const pool = databaseUrl
  ? new Pool({
      connectionString: databaseUrl,
      ssl: databaseUrl.includes("localhost") ? false : { rejectUnauthorized: false },
    })
  : null;

async function ensureDatabase() {
  if (!pool) {
    return;
  }

  await pool.query(`
    CREATE TABLE IF NOT EXISTS feature_requests (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      idea TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  const countResult = await pool.query<{ count: string }>(
    "SELECT COUNT(*)::text AS count FROM feature_requests",
  );

  if (countResult.rows[0]?.count === "0") {
    await pool.query(
      "INSERT INTO feature_requests (name, idea) VALUES ($1, $2)",
      ["William", "Add deployment status tracking for the project."],
    );
  }
}

async function getRequests(): Promise<RequestEntry[]> {
  if (!pool) {
    return [{ name: "Database not configured", idea: "Set DATABASE_URL to enable PostgreSQL storage." }];
  }

  const result = await pool.query<RequestEntry>(
    "SELECT id, name, idea FROM feature_requests ORDER BY id DESC",
  );

  return result.rows;
}

async function addRequest(name: string, idea: string) {
  if (!pool) {
    return;
  }

  await pool.query("INSERT INTO feature_requests (name, idea) VALUES ($1, $2)", [name, idea]);
}

function renderPage(title: string, content: string) {
  return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>${title}</title>
        <style>
          :root {
            --bg-start: #f8efe5;
            --bg-end: #dbe9ff;
            --panel: rgba(255, 255, 255, 0.92);
            --text: #1f2937;
            --muted: #516074;
            --accent: #0f766e;
            --accent-dark: #115e59;
            --border: rgba(15, 23, 42, 0.1);
          }
          * {
            box-sizing: border-box;
          }
          body {
            margin: 0;
            font-family: Arial, sans-serif;
            background: linear-gradient(135deg, var(--bg-start), var(--bg-end));
            color: var(--text);
          }
          .shell {
            width: min(960px, calc(100% - 2rem));
            margin: 2rem auto;
          }
          .hero, .panel {
            background: var(--panel);
            border-radius: 20px;
            box-shadow: 0 16px 36px rgba(15, 23, 42, 0.12);
            border: 1px solid var(--border);
          }
          .hero {
            padding: 2rem;
            margin-bottom: 1.5rem;
          }
          .hero h1 {
            margin: 0 0 0.75rem;
            font-size: clamp(2rem, 5vw, 3rem);
          }
          .hero p {
            margin: 0;
            line-height: 1.7;
            color: var(--muted);
            max-width: 700px;
          }
          nav {
            display: flex;
            gap: 0.75rem;
            flex-wrap: wrap;
            margin-top: 1.25rem;
          }
          nav a, .button {
            display: inline-block;
            text-decoration: none;
            background: var(--accent);
            color: white;
            padding: 0.8rem 1rem;
            border-radius: 999px;
            font-weight: 700;
          }
          nav a.secondary {
            background: white;
            color: var(--accent-dark);
            border: 1px solid rgba(17, 94, 89, 0.2);
          }
          .grid {
            display: grid;
            gap: 1rem;
            grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          }
          .panel {
            padding: 1.25rem;
          }
          .panel h2, .panel h3 {
            margin-top: 0;
          }
          ul {
            padding-left: 1.1rem;
            margin-bottom: 0;
          }
          li + li {
            margin-top: 0.75rem;
          }
          form {
            display: grid;
            gap: 0.75rem;
          }
          label {
            font-weight: 700;
          }
          input, textarea {
            width: 100%;
            padding: 0.8rem 0.9rem;
            border-radius: 12px;
            border: 1px solid rgba(148, 163, 184, 0.5);
            font: inherit;
          }
          textarea {
            min-height: 110px;
            resize: vertical;
          }
          button {
            border: 0;
            cursor: pointer;
            font: inherit;
          }
          .footer-note {
            margin-top: 1rem;
            color: var(--muted);
            font-size: 0.95rem;
          }
        </style>
      </head>
      <body>
        <div class="shell">
          ${content}
        </div>
      </body>
    </html>
  `;
}

app.get("/", async (_req, res) => {
  const featureItems = features
    .map(
      (feature) => `
        <div class="panel">
          <h3>${feature.title}</h3>
          <p>${feature.detail}</p>
        </div>
      `,
    )
    .join("");

  const databaseStatus = pool
    ? "Requests are stored in the Render PostgreSQL database."
    : "Database not configured yet. Add DATABASE_URL to enable persistence.";

  res.send(
    renderPage(
      "Portfolio Task 3",
      `
        <section class="hero">
          <h1>${appName}</h1>
          <p>${appMessage}</p>
          <nav>
            <a href="/about">About This Project</a>
            <a class="secondary" href="/requests">View Submitted Requests</a>
          </nav>
        </section>

        <section class="grid">
          ${featureItems}
        </section>

        <section class="panel" style="margin-top: 1rem;">
          <h2>Submit a Feature Idea</h2>
          <form method="post" action="/requests">
            <div>
              <label for="name">Your Name</label>
              <input id="name" name="name" type="text" placeholder="Enter your name" required />
            </div>
            <div>
              <label for="idea">Feature Idea</label>
              <textarea id="idea" name="idea" placeholder="Describe a feature you would like to add" required></textarea>
            </div>
            <button class="button" type="submit">Submit Request</button>
          </form>
          <p class="footer-note">${databaseStatus}</p>
        </section>
      `,
    ),
  );
});

app.get("/about", (_req, res) => {
  res.send(
    renderPage(
      "About This Project",
      `
        <section class="hero">
          <h1>About This Project</h1>
          <p>
            This app was created to demonstrate a simple but functional Node.js web application that can
            be deployed to Render. It includes navigation, server-side rendering, and request submission.
          </p>
          <nav>
            <a href="/">Back to Home</a>
            <a class="secondary" href="/requests">Submitted Requests</a>
          </nav>
        </section>
      `,
    ),
  );
});

app.get("/requests", async (_req, res) => {
  const requests = await getRequests();
  const requestItems = requests
    .map(
      (request) => `
        <li>
          <strong>${request.name}</strong>: ${request.idea}
        </li>
      `,
    )
    .join("");

  res.send(
    renderPage(
      "Submitted Requests",
      `
        <section class="hero">
          <h1>Submitted Requests</h1>
          <p>
            This page shows the ideas submitted through the feature request form on the homepage.
          </p>
          <nav>
            <a href="/">Back to Home</a>
            <a class="secondary" href="/about">About</a>
          </nav>
        </section>

        <section class="panel">
          <h2>Current Requests</h2>
          <ul>${requestItems}</ul>
        </section>
      `,
    ),
  );
});

app.post("/requests", async (req, res) => {
  const name = String(req.body.name || "").trim();
  const idea = String(req.body.idea || "").trim();

  if (name && idea) {
    await addRequest(name, idea);
  }

  res.redirect("/requests");
});

ensureDatabase()
  .then(() => {
    app.listen(port, () => {
      console.log(`Server running on http://localhost:${port}`);
    });
  })
  .catch((error: unknown) => {
    console.error("Failed to initialize database", error);
    process.exit(1);
  });
