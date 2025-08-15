import { useEffect, useState } from "react";

const OWNER = "AvnishSingh-Ch";
const REPO = "web-img";
const BRANCH = "main";

export default function Home() {
  const [path, setPath] = useState("");
  const [stack, setStack] = useState([]); // breadcrumb segments
  const [data, setData] = useState({ items: [] });
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const fetchPath = async (p) => {
    setLoading(true);
    setErr("");
    try {
      const qs = new URLSearchParams({ owner: OWNER, repo: REPO, branch: BRANCH, path: p });
      const r = await fetch(`/api/list?${qs.toString()}`);
      const j = await r.json();
      if (!r.ok || j.error) throw new Error(j.message || `HTTP ${r.status}`);
      setData(j);
    } catch (e) {
      setErr(e.message || "Failed to load");
    } finally {
      setLoading(false);
    }
  };

  // init + handle deep links like ?path=blog-img/stuff
  useEffect(() => {
    const urlPath = new URL(window.location.href).searchParams.get("path") || "";
    setPath(urlPath);
    setStack(urlPath ? urlPath.split("/").filter(Boolean) : []);
    fetchPath(urlPath);
  }, []);

  // navigate helper
  const goTo = (newPath) => {
    setPath(newPath);
    const segs = newPath ? newPath.split("/").filter(Boolean) : [];
    setStack(segs);
    const url = new URL(window.location.href);
    if (newPath) url.searchParams.set("path", newPath); else url.searchParams.delete("path");
    window.history.pushState({}, "", url.toString());
    fetchPath(newPath);
  };

  const goUp = () => {
    if (!path) return;
    const parts = path.split("/").filter(Boolean);
    parts.pop();
    goTo(parts.join("/"));
  };

  return (
    <div style={{ fontFamily: "Inter, system-ui, sans-serif", padding: 20, maxWidth: 900, margin: "0 auto" }}>
      <h2 style={{ marginBottom: 10 }}>📁 {OWNER}/{REPO} ({BRANCH})</h2>

      {/* Breadcrumb */}
      <div style={{ marginBottom: 12, fontSize: 14 }}>
        <span
          style={{ cursor: "pointer", color: "#0366d6" }}
          onClick={() => goTo("")}
          title="Go to repo root"
        >
          /
        </span>
        {stack.map((seg, i) => {
          const sub = stack.slice(0, i + 1).join("/");
          return (
            <span key={sub}>
              <span> </span>
              <span> / </span>
              <span
                style={{ cursor: "pointer", color: "#0366d6" }}
                onClick={() => goTo(sub)}
                title={sub}
              >
                {seg}
              </span>
            </span>
          );
        })}
      </div>

      {/* Controls */}
      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <button onClick={goUp} disabled={!path} style={btnStyle}>⬅️ Up</button>
        <button onClick={() => fetchPath(path)} style={btnStyle}>↻ Refresh</button>
      </div>

      {/* Status */}
      {loading && <div>Loading…</div>}
      {err && <div style={{ color: "crimson" }}>Error: {err}</div>}

      {/* Listing */}
      {!loading && !err && (
        <div>
          {/* Folders */}
          {data.items.filter(i => i.type === "dir").map((d) => (
            <div key={d.path}>
              <a
                style={linkStyle}
                onClick={(e) => { e.preventDefault(); goTo(d.path); }}
                href={`?path=${encodeURIComponent(d.path)}`}
              >
                📁 {d.name}
              </a>
            </div>
          ))}

          {/* Files */}
          {data.items.filter(i => i.type === "file").map((f) => {
            const isImage = /\.(png|jpe?g|gif|webp|svg)$/i.test(f.name);
            const href = f.download_url || `https://raw.githubusercontent.com/${OWNER}/${REPO}/${BRANCH}/${f.path}`;

            return (
              <div key={f.path} style={{ marginBottom: 8 }}>
                <a style={linkStyle} href={href} target="_blank" rel="noreferrer">
                  {isImage ? "🖼️" : "📄"} {f.name}
                </a>
                {isImage && (
                  <div style={{ margin: "6px 0 16px 0" }}>
                    <img
                      src={href}
                      alt={f.name}
                      style={{ maxWidth: "100%", height: "auto", border: "1px solid #eee", borderRadius: 8, padding: 4 }}
                      loading="lazy"
                    />
                  </div>
                )}
              </div>
            );
          })}

          {data.items.length === 0 && <div>Empty folder.</div>}
        </div>
      )}
    </div>
  );
}

const btnStyle = {
  padding: "6px 10px",
  borderRadius: 8,
  border: "1px solid #e5e7eb",
  background: "#fff",
  cursor: "pointer"
};

const linkStyle = {
  display: "inline-block",
  color: "#0366d6",
  textDecoration: "none",
  cursor: "pointer",
  margin: "6px 0"
};
