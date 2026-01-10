import { execSync } from 'child_process';
import { existsSync } from 'fs';
import os from 'os';
import { dirname, join, resolve } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, '..');
const outDir = join(projectRoot, 'out');
const zipPath = join(projectRoot, 'visual-novel-out.zip');

if (!existsSync(outDir)) {
  console.error('Build output not found. Run "npm run build" first.');
  process.exit(1);
}

const isWindows = os.platform() === 'win32';

const command = isWindows
  ? `powershell -NoLogo -NonInteractive -Command "if (Test-Path '${zipPath}') { Remove-Item -Force '${zipPath}' } ; Compress-Archive -Path '${outDir}\\*' -DestinationPath '${zipPath}'"`
  : `bash -lc "rm -f '${zipPath}' && cd '${outDir}' && zip -r '${zipPath}' ."`;

try {
  console.log(`Packing static export to ${zipPath}`);
  execSync(command, { stdio: 'inherit', shell: true });
  console.log('Packaging complete.');
} catch (error) {
  console.error('Failed to create archive. Make sure zip (macOS/Linux) or PowerShell Compress-Archive (Windows) is available.');
  process.exit(error.status || 1);
}
