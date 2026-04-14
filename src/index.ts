import express from "express";

const app = express();
const port = Number(process.env.PORT) || 3000;

app.get("/", (_req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Portfolio Task 3</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 0;
            min-height: 100vh;
            display: grid;
            place-items: center;
            background: linear-gradient(135deg, #f6efe8, #d9e7ff);
            color: #1f2937;
          }
          main {
            background: rgba(255, 255, 255, 0.92);
            padding: 2rem;
            border-radius: 16px;
            box-shadow: 0 12px 30px rgba(0, 0, 0, 0.12);
            max-width: 640px;
            text-align: center;
          }
          h1 {
            margin-bottom: 0.5rem;
          }
          p {
            line-height: 1.6;
          }
        </style>
      </head>
      <body>
        <main>
          <h1>Node.js + TypeScript App</h1>
          <p>This simple Express application was created for SWE40006 Portfolio Task 3.</p>
          <p>The app is ready to be pushed to GitHub and deployed on Render.</p>
        </main>
      </body>
    </html>
  `);
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
