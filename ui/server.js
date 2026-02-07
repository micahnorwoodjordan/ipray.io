import http from "http";
import fs from "fs";
import path from "path";
import url from "url";

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const distPath = path.join(__dirname, "app", "dist");

const PORT = process.env.PORT || 3000;
const EXPO_PUBLIC_API_URL = process.env.EXPO_PUBLIC_API_URL;

if (!EXPO_PUBLIC_API_URL) {
  console.warn("⚠️  EXPO_PUBLIC_API_URL is not set. /api requests will fail.");
}

const server = http.createServer((req, res) => {
  // -----------------------------
  // API proxy
  // -----------------------------
  if (req.url?.startsWith("/api")) {
    if (!EXPO_PUBLIC_API_URL) {
      res.writeHead(500, { "Content-Type": "text/plain" });
      res.end("EXPO_PUBLIC_API_URL not configured");
      return;
    }

    const targetUrl = new URL(req.url, EXPO_PUBLIC_API_URL);

    const proxyReq = http.request(
      targetUrl,
      {
        method: req.method,
        headers: req.headers,
      },
      (proxyRes) => {
        res.writeHead(proxyRes.statusCode || 500, proxyRes.headers);
        proxyRes.pipe(res, { end: true });
      }
    );

    proxyReq.on("error", (err) => {
      console.error("API proxy error:", err);
      res.writeHead(502, { "Content-Type": "text/plain" });
      res.end("Bad gateway");
    });

    req.pipe(proxyReq, { end: true });
    return;
  }

  // -----------------------------
  // Static file serving
  // -----------------------------
  let filePath = req.url === "/" ? "/index.html" : req.url;
  filePath = path.join(distPath, filePath);

  if (req.url === "/favicon.ico") {
    filePath = path.join(distPath, "favicon.ico");
  }

  fs.readFile(filePath, (err, content) => {
    if (err) {
      console.log(`could not find file: ${path.parse(filePath).base}`);
      res.writeHead(404, { "Content-Type": "text/plain" });
      res.end("Not found");
      return;
    }

    const ext = path.extname(filePath);
    const contentType =
      ext === ".html" ? "text/html" :
      ext === ".css" ? "text/css" :
      ext === ".ico" ? "image/x-icon" :
      ext === ".js" ? "application/javascript" :
      "text/plain";

    res.writeHead(200, { "Content-Type": contentType });
    res.end(content);
  });
});

server.listen(PORT, () => {
  console.log(`Static server running on port ${PORT}`);
  if (EXPO_PUBLIC_API_URL) {
    console.log(`Proxying /api → ${EXPO_PUBLIC_API_URL}/api`);
  }
});
