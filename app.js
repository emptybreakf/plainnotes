const express = require("express");
const fs = require("fs/promises");
const path = require("path");

const VAULT_DIR = path.join(__dirname, "vault");
const app = express();
app.use(express.json());

const slugify = (title) => {
  const slug = title
    .trim()
    .replace(/[^a-z0-9]+/gi, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();
  const base = slug || "entry-" + Date.now().toString(36);
  return base + ".md";
};

async function ensureVault() {
  await fs.mkdir(VAULT_DIR, { recursive: true });
}

app.post("/entries", async (req, res) => {
  const { title, body } = req.body || {};
  if (!title || !body) return res.status(400).json({ error: "title and body required" });
  const file = path.join(VAULT_DIR, slugify(title));
  try {
    await fs.access(file);
    return res.status(409).json({ error: "entry already exists" });
  } catch {}
  await fs.writeFile(file, `# ${title}\n\n${body}\n`);
  res.status(201).json({ ok: true, file: slugify(title) });
});

app.get("/entries", async (req, res) => {
  const files = await fs.readdir(VAULT_DIR);
  const entries = await Promise.all(
    files.map(async (f) => {
      const st = await fs.stat(path.join(VAULT_DIR, f));
      return { slug: f.replace(/\.md$/, ""), modified: st.mtime.toISOString() };
    })
  );
  entries.sort((a, b) => b.modified.localeCompare(a.modified));
  res.json(entries);
});

app.get("/entries/:slug", async (req, res) => {
  try {
    const content = await fs.readFile(
      path.join(VAULT_DIR, slugify(req.params.slug)),
      "utf8"
    );
    res.type("text/markdown").send(content);
  } catch {
    res.status(404).json({ error: "not found" });
  }
});

app.delete("/entries/:slug", async (req, res) => {
  try {
    await fs.unlink(path.join(VAULT_DIR, slugify(req.params.slug)));
    res.json({ ok: true });
  } catch {
    res.status(404).json({ error: "not found" });
  }
});

ensureVault()
  .then(() => {
    const port = process.env.PORT || 3000;
    app.listen(port, () => console.log(`plainnotes on :${port}`));
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
