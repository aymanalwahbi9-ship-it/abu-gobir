const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ROOT = __dirname;
const PORT = Number(process.env.PORT || 8000);
const ADMIN_CODE = process.env.ADMIN_CODE;
const sessions = new Map();
const manifestPath = path.join(ROOT, 'project-image-manifest.json');
const assetDir = path.join(ROOT, 'assets', 'projects');
const mimeTypes = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp', '.svg': 'image/svg+xml' };

function readManifest() { return JSON.parse(fs.readFileSync(manifestPath, 'utf8')); }
function writeManifest(data) { data.count = data.projects.length; fs.writeFileSync(manifestPath, JSON.stringify(data, null, 2) + '\n'); }
function normalizeCode(value) { return String(value || '').trim().normalize('NFC'); }
function parseCookies(req) { return Object.fromEntries((req.headers.cookie || '').split(';').filter(Boolean).map(item => { const [key, ...value] = item.trim().split('='); return [key, decodeURIComponent(value.join('='))]; })); }
function authenticated(req) { const sid = parseCookies(req).abu_jabir_session; return sid && sessions.has(sid); }
function sessionCookie(req, maxAge) {
  const forwardedProto = String(req.headers['x-forwarded-proto'] || '').split(',')[0].trim();
  const secure = forwardedProto === 'https' || Boolean(req.socket.encrypted);
  return `abu_jabir_session=${maxAge ? '' : ''}; HttpOnly; SameSite=${secure ? 'None' : 'Lax'}; Path=/; Max-Age=${maxAge}${secure ? '; Secure' : ''}`;
}
function send(res, status, body, headers = {}) { res.writeHead(status, { 'Cache-Control': 'no-store', ...headers }); res.end(body); }
function json(res, status, value, headers = {}) { send(res, status, JSON.stringify(value), { 'Content-Type': 'application/json; charset=utf-8', ...headers }); }
function body(req) { return new Promise((resolve, reject) => { let data = ''; req.on('data', chunk => { data += chunk; if (data.length > 12 * 1024 * 1024) req.destroy(); }); req.on('end', () => { try { resolve(JSON.parse(data || '{}')); } catch { reject(new Error('invalid-json')); } }); req.on('error', reject); }); }
function safeName(value) { return String(value || '').replace(/[^a-zA-Z0-9_-]/g, '-').slice(0, 60) || 'project'; }

async function api(req, res, url) {
  if (url.pathname === '/api/login' && req.method === 'POST') {
    if (!ADMIN_CODE) return json(res, 503, { error: 'admin-not-configured' });
    const data = await body(req);
    if (!data.code || normalizeCode(data.code) !== normalizeCode(ADMIN_CODE)) return json(res, 401, { error: 'invalid-credentials' });
    const sid = crypto.randomBytes(32).toString('hex');
    sessions.set(sid, Date.now());
    return json(res, 200, { ok: true }, { 'Set-Cookie': sessionCookie(req, 86400).replace('abu_jabir_session=', `abu_jabir_session=${sid}`) });
  }
  if (url.pathname === '/api/session' && req.method === 'GET') return json(res, 200, { authenticated: Boolean(authenticated(req)) });
  if (url.pathname === '/api/logout' && req.method === 'POST') {
    const sid = parseCookies(req).abu_jabir_session; if (sid) sessions.delete(sid);
    return json(res, 200, { ok: true }, { 'Set-Cookie': sessionCookie(req, 0) });
  }
  if (url.pathname === '/api/projects' && req.method === 'GET') return json(res, 200, readManifest());
  if (!authenticated(req)) return json(res, 401, { error: 'unauthorized' });
  if (url.pathname === '/api/projects' && req.method === 'POST') {
    const data = await body(req);
    if (!data.imageData || !String(data.imageData).startsWith('data:image/')) return json(res, 400, { error: 'image-required' });
    const match = String(data.imageData).match(/^data:image\/(jpeg|jpg|png|webp);base64,(.+)$/);
    if (!match) return json(res, 400, { error: 'unsupported-image' });
    const id = `PROJECT-${Date.now()}`;
    const extension = match[1] === 'jpeg' || match[1] === 'jpg' ? 'jpg' : match[1];
    const filename = `${safeName(id)}-${safeName(data.title)}.${extension}`;
    fs.writeFileSync(path.join(assetDir, filename), Buffer.from(match[2], 'base64'));
    const manifest = readManifest();
    manifest.projects.unshift({ id, image: `assets/projects/${filename}`, original_filename: data.originalFilename || filename, title: String(data.title || 'عمل جديد').slice(0, 120), category: String(data.category || 'أعمال متنوعة').slice(0, 80), description: String(data.description || '').slice(0, 500), published: Boolean(data.publish) });
    writeManifest(manifest);
    return json(res, 201, { ok: true, project: manifest.projects[0] });
  }
  const toggle = url.pathname.match(/^\/api\/projects\/([^/]+)\/toggle$/);
  if (toggle && req.method === 'POST') {
    const manifest = readManifest(); const project = manifest.projects.find(item => item.id === decodeURIComponent(toggle[1]));
    if (!project) return json(res, 404, { error: 'not-found' });
    project.published = !project.published; writeManifest(manifest);
    return json(res, 200, { ok: true, project });
  }
  return json(res, 404, { error: 'not-found' });
}

function serve(req, res) {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  if (url.pathname.startsWith('/api/')) return api(req, res, url).catch(error => json(res, 500, { error: error.message || 'server-error' }));
  let pathname = decodeURIComponent(url.pathname); if (pathname === '/') pathname = '/index.html';
  const file = path.resolve(ROOT, `.${pathname}`);
  if (!file.startsWith(ROOT) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) return send(res, 404, 'Not found');
  const ext = path.extname(file).toLowerCase();
  send(res, 200, fs.readFileSync(file), { 'Content-Type': mimeTypes[ext] || 'application/octet-stream', 'Cache-Control': ext === '.html' ? 'no-store' : 'public, max-age=0' });
}

if (!ADMIN_CODE) console.error('ADMIN_CODE is not configured; login will be disabled.');
http.createServer(serve).listen(PORT, '0.0.0.0', () => console.log(`Abu Jabir server listening on http://0.0.0.0:${PORT}`));
