#!/usr/bin/env python3
"""
Servidor HTTP simple para desarrollo local de LifePlants
Uso: python server.py [puerto]
Por defecto usa el puerto 8000
"""

import http.server
import socketserver
import sys
import os

# Puerto por defecto
PORT = 8000

# Obtener puerto de argumentos si se proporciona
if len(sys.argv) > 1:
    try:
        PORT = int(sys.argv[1])
    except ValueError:
        print(f"Puerto inválido: {sys.argv[1]}")
        print("Usando puerto por defecto: 8000")

# Cambiar al directorio del script
os.chdir(os.path.dirname(os.path.abspath(__file__)))

# Configurar el handler
Handler = http.server.SimpleHTTPRequestHandler

# Agregar soporte para tipos MIME adicionales
Handler.extensions_map.update({
    '.js': 'application/javascript',
    '.css': 'text/css',
    '.html': 'text/html',
    '.svg': 'image/svg+xml',
})

# Crear y ejecutar el servidor
with socketserver.TCPServer(("", PORT), Handler) as httpd:
    print(f"""
╔════════════════════════════════════════════════╗
║          🌱 LifePlants Dev Server 🌱          ║
╠════════════════════════════════════════════════╣
║                                                ║
║  Servidor ejecutándose en:                    ║
║  http://localhost:{PORT:<4}                           ║
║                                                ║
║  Presiona Ctrl+C para detener el servidor     ║
║                                                ║
╚════════════════════════════════════════════════╝
    """)
    
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n\n✓ Servidor detenido correctamente")
        sys.exit(0)
