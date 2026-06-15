import http.server
import os
import socketserver

class Handler(http.server.SimpleHTTPRequestHandler):
    def translate_path(self, path):
        # Try original path first
        translated = super().translate_path(path)
        if os.path.exists(translated) and not os.path.isdir(translated):
            return translated
        # If path has no extension and .html exists, serve that
        if not os.path.splitext(path)[1]:
            html_path = super().translate_path(path + '.html')
            if os.path.exists(html_path) and not os.path.isdir(html_path):
                return html_path
        return translated

    def end_headers(self):
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate')
        super().end_headers()

PORT = 8080
with socketserver.TCPServer(("", PORT), Handler) as httpd:
    print(f"Serving HTTP on port {PORT}")
    httpd.serve_forever()
