import { app, shell, BrowserWindow } from 'electron';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync, existsSync } from 'fs';
import { createServer } from 'http';
import http from 'http';
import { spawn } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const isDev = process.env.NODE_ENV === 'development';

const API_PORT = 8000;
const API_HOST = '127.0.0.1';

let backendProcess = null;

function startBackend() {
  const backendExe = app.isPackaged
    ? join(process.resourcesPath, 'app.asar.unpacked', 'backend', 'GestaoIgreja.exe')
    : join(__dirname, '..', 'build', 'orquestra', 'GestaoIgreja.exe');
  
  if (!existsSync(backendExe)) {
    console.log('Backend exe not found at:', backendExe);
    return;
  }
  
  backendProcess = spawn(backendExe, [], {
    stdio: 'pipe',
    shell: true,
    detached: false,
  });

  backendProcess.stdout.on('data', (data) => console.log('[Backend]', data.toString()));
  backendProcess.stderr.on('data', (data) => console.error('[Backend Error]', data.toString()));
  
  console.log('Backend started at', backendExe);
}

function getPort() {
  return 8765;
}

function createProxyHandler(req, res) {
  const options = {
    hostname: API_HOST,
    port: API_PORT,
    path: req.url,
    method: req.method,
    headers: { ...req.headers },
  };

  const proxyReq = http.request(options, (proxyRes) => {
    res.writeHead(proxyRes.statusCode, proxyRes.headers);
    proxyRes.pipe(res, { end: true });
  });

  proxyReq.on('error', (err) => {
    console.error('Erro ao conectar na API:', err.message);
    res.writeHead(502, { 'Content-Type': 'text/plain' });
    res.end('Backend API indisponível');
  });

  req.pipe(proxyReq, { end: true });
}

function startServer(distPath, port) {
  const server = createServer((req, res) => {
    if (req.url.startsWith('/api/')) {
      createProxyHandler(req, res);
      return;
    }
    
    let filePath = join(distPath, req.url === '/' ? 'index.html' : req.url);
    
    if (!existsSync(filePath)) {
      filePath = join(distPath, 'index.html');
    }
    
    const ext = filePath.split('.').pop();
    const contentTypes = {
      'html': 'text/html',
      'js': 'application/javascript',
      'css': 'text/css',
      'json': 'application/json',
      'png': 'image/png',
      'svg': 'image/svg+xml'
    };
    
    if (existsSync(filePath)) {
      const content = readFileSync(filePath);
      res.writeHead(200, { 'Content-Type': contentTypes[ext] || 'text/plain' });
      res.end(content);
    } else {
      res.writeHead(404);
      res.end('Not Found');
    }
  });
  
  server.listen(port, () => {
    console.log(`App running at http://localhost:${port}`);
    console.log(`API proxy pointing to http://${API_HOST}:${API_PORT}`);
  });
  
  return server;
}

app.whenReady().then(() => {
  if (isDev) {
    const mainWindow = new BrowserWindow({
      width: 1280,
      height: 800,
      webPreferences: {
        preload: join(__dirname, 'preload.js'),
        contextIsolation: true,
        nodeIntegration: false,
      },
    });
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    startBackend();
    
    const distPath = app.isPackaged
      ? join(process.resourcesPath, 'app.asar.unpacked', 'dist')
      : join(__dirname, '..', 'dist');
    
    const port = getPort();
    startServer(distPath, port);
    
    setTimeout(() => {
      shell.openExternal(`http://localhost:${port}`);
    }, 1500);
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});