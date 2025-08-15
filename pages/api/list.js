// /api/list?path=blog-img
// Lists contents of a path in a GitHub repo using the contents API.
// Env (optional): GITHUB_TOKEN to avoid rate limits.

export default async function handler(req, res) {
    const {
      owner = "AvnishSingh-Ch",
      repo = "web-img",
      branch = "main",
      path = ""
    } = req.query;
  
    const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${encodeURIComponent(path)}?ref=${branch}`;
  
    try {
      const headers = { 'Accept': 'application/vnd.github.v3+json' };
      if (process.env.GITHUB_TOKEN) {
        headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
      }
  
      const r = await fetch(apiUrl, { headers });
      if (!r.ok) {
        const text = await r.text();
        return res.status(r.status).json({ error: true, status: r.status, message: text });
      }
  
      const json = await r.json();
  
      // Normalize output: always return {path, items:[{name,type,path,url}]}
      const items = Array.isArray(json) ? json : [json];
      const mapped = items.map((it) => ({
        name: it.name,
        type: it.type, // "dir" or "file"
        path: it.path,
        // direct file link (raw) when it's a file:
        download_url: it.download_url || null,
        size: it.size ?? null
      }));
  
      return res.status(200).json({
        owner, repo, branch, path,
        items: mapped.sort((a, b) => {
          // dirs first, then files; then alphabetical
          if (a.type !== b.type) return a.type === 'dir' ? -1 : 1;
          return a.name.localeCompare(b.name);
        })
      });
    } catch (e) {
      return res.status(500).json({ error: true, message: e.message || 'Unknown error' });
    }
  }
  