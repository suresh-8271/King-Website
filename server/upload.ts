import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { Request, Response, NextFunction } from 'express';

const UPLOAD_DIR = path.join(process.cwd(), 'uploads');

if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Allowed MIME types and extensions
const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/svg+xml',
]);

const ALLOWED_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg']);

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const safeName = `${uuidv4()}${ext}`;
    cb(null, safeName);
  },
});

const fileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (!ALLOWED_MIME_TYPES.has(file.mimetype) || !ALLOWED_EXTENSIONS.has(ext)) {
    return cb(new Error('Only safe image files (JPEG, PNG, WebP, GIF, SVG) are permitted.'));
  }
  cb(null, true);
};

export const uploadMiddleware = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 8 * 1024 * 1024, // 8MB max
    files: 1,
  },
});

// Create default assets if not present (such as logo and signature placeholder)
export function ensureDefaultAssets(): void {
  const assetsDir = path.join(process.cwd(), 'public', 'default-assets');
  if (!fs.existsSync(assetsDir)) {
    fs.mkdirSync(assetsDir, { recursive: true });
  }

  const logoPath = path.join(assetsDir, 'logo.svg');
  if (!fs.existsSync(logoPath)) {
    const logoSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
      <defs>
        <radialGradient id="grad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#1e3a8a"/>
          <stop offset="100%" stop-color="#0f172a"/>
        </radialGradient>
        <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#f59e0b"/>
          <stop offset="50%" stop-color="#fbbf24"/>
          <stop offset="100%" stop-color="#d97706"/>
        </linearGradient>
      </defs>
      <circle cx="100" cy="100" r="94" fill="url(#grad)" stroke="url(#goldGrad)" stroke-width="6"/>
      <circle cx="100" cy="100" r="82" fill="none" stroke="#fbbf24" stroke-width="1.5" stroke-dasharray="4,3"/>
      <!-- Sun rays / Chakra rays -->
      <g stroke="#f59e0b" stroke-width="2" opacity="0.6">
        <line x1="100" y1="22" x2="100" y2="35"/>
        <line x1="100" y1="165" x2="100" y2="178"/>
        <line x1="22" y1="100" x2="35" y2="100"/>
        <line x1="165" y1="100" x2="178" y2="100"/>
        <line x1="45" y1="45" x2="54" y2="54"/>
        <line x1="146" y1="146" x2="155" y2="155"/>
        <line x1="45" y1="155" x2="54" y2="146"/>
        <line x1="146" y1="54" x2="155" y2="45"/>
      </g>
      <!-- Central Emblem: Torch and Hands / Unity -->
      <path d="M100 48 L108 72 L92 72 Z" fill="url(#goldGrad)"/>
      <path d="M96 72 L96 95 L104 95 L104 72 Z" fill="#ffffff"/>
      <!-- Unity rings -->
      <circle cx="100" cy="115" r="24" fill="none" stroke="#ffffff" stroke-width="4"/>
      <path d="M80 140 C80 120, 120 120, 120 140" fill="none" stroke="url(#goldGrad)" stroke-width="5" stroke-linecap="round"/>
      <!-- Emblem Text -->
      <text x="100" y="158" font-family="'Plus Jakarta Sans', sans-serif" font-size="11" font-weight="bold" fill="#fef08a" text-anchor="middle" letter-spacing="1">PASWAN EKTA</text>
      <text x="100" y="172" font-family="'Plus Jakarta Sans', sans-serif" font-size="10" font-weight="bold" fill="#ffffff" text-anchor="middle" letter-spacing="2">MANCH</text>
    </svg>`;
    fs.writeFileSync(logoPath, logoSvg, 'utf-8');
  }

  const sigPath = path.join(assetsDir, 'signature.svg');
  if (!fs.existsSync(sigPath)) {
    const sigSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 70" width="240" height="70">
      <path d="M15 48 C35 25, 45 60, 65 30 C80 10, 90 55, 110 38 C135 20, 140 50, 160 32 C175 22, 195 45, 225 35" 
            fill="none" stroke="#1e3a8a" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M50 55 L210 52" fill="none" stroke="#1e3a8a" stroke-width="1.5" stroke-dasharray="2,2"/>
    </svg>`;
    fs.writeFileSync(sigPath, sigSvg, 'utf-8');
  }
}
