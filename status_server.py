from http.server import HTTPServer, BaseHTTPRequestHandler
import os

class StatusHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        self.send_response(200)
        self.send_header('Content-type', 'text/html; charset=utf-8')
        self.end_headers()
        html = """<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>LMArena Cloud Browser Node</title>
  <style>
    body { font-family: -apple-system, sans-serif; background: #0f172a; color: #f8fafc; padding: 3rem; text-align: center; }
    .card { background: #1e293b; border-radius: 12px; padding: 2rem; max-width: 600px; margin: auto; border: 1px solid #334155; }
    .badge { background: #166534; color: #4ade80; padding: 0.35rem 0.75rem; border-radius: 9999px; font-weight: 600; }
    code { background: #0f172a; padding: 0.2rem 0.4rem; border-radius: 4px; color: #38bdf8; }
  </style>
</head>
<body>
  <div class="card">
    <h2>🤖 LMArena Headless Browser Node</h2>
    <p><span class="badge">🟢 Chromium Active (24/7)</span></p>
    <p>Running headless browser bridge in the background.</p>
    <hr style="border: 0; border-top: 1px solid #334155; margin: 1.5rem 0;">
    <p>Connected to Cloudflare Gateway:</p>
    <p><code>https://lmarena-worker.crosskhrome1.workers.dev</code></p>
  </div>
</body>
</html>"""
        self.wfile.write(html.encode('utf-8'))

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 7860))
    server = HTTPServer(('0.0.0.0', port), StatusHandler)
    server.serve_forever()
