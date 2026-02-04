import http from "http";
import fs from "fs";
import path from "path";
import url from "url";

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const distPath = path.join(__dirname, "app", "dist");
const PORT = process.env.PORT || 3000;

const server = http.createServer((req, res) => {
  let filePath = req.url === "/" ? "/index.html" : req.url;
  filePath = path.join(distPath, filePath);

  console.log(`URL: ${req.url} -- FP: ${filePath}`);

  if (req.url === '/favicon.ico') {
    filePath = path.join(distPath, 'favicon.ico');
  }

  fs.readFile(filePath, (err, content) => {
    if (err) {
      console.log(err);
      res.writeHead(404, { "Content-Type": "text/plain" });
      res.end("Not found");
      return;
    }

    const ext = path.extname(filePath);
    const contentType =
      ext === ".html" ? "text/html" :
      ext === ".css" ? "text/css" :
      ext === ".ico" ? "image/x-icon" :
      ext === ".js" ? "application/javascript" : "text/plain";

    res.writeHead(200, { "Content-Type": contentType });
    res.end(content);
  });
});

server.listen(PORT, () => {
  console.log(`Static server running on port ${PORT}`);
});
