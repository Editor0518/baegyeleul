#!/usr/bin/env python3
import http.server
import socketserver
import webbrowser
import os

# 현재 디렉토리로 변경
os.chdir(os.path.dirname(os.path.abspath(__file__)))

PORT = 8001
Handler = http.server.SimpleHTTPRequestHandler

# 브라우저 자동 실행
webbrowser.open(f'http://localhost:{PORT}/visual-novel/visual-novel.html')

print(f"🎮 웹비주얼노벨 게임 실행 중...")
print(f"📍 주소: http://localhost:{PORT}/visual-novel/visual-novel.html")
print(f"🔧 변환기: http://localhost:{PORT}/converter/index.html")
print(f"⌨️  종료하려면 Ctrl+C를 누르세요")

with socketserver.TCPServer(("", PORT), Handler) as httpd:
    httpd.serve_forever()
