import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import os from "os";

export interface ShellOptions {
  stdio?: "inherit" | "pipe";
  encoding?: "utf8" | "ascii" | "base64" | "hex";
  cwd?: string;
}

export function removeFile(filePath: string): void {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (error) {
  }
}

export function listDirectory(dirPath: string = ".", options: ShellOptions = {}): string {
  try {
    const files = fs.readdirSync(dirPath, { withFileTypes: true });
    return files
      .map(file => {
        const stats = fs.statSync(path.join(dirPath, file.name));
        const permissions = stats.mode.toString(8).slice(-3);
        const size = stats.size;
        const modified = stats.mtime.toISOString().slice(0, 19).replace('T', ' ');
        return `${file.isDirectory() ? 'd' : '-'}${permissions} ${size.toString().padStart(8)} ${modified} ${file.name}`;
      })
      .join('\n');
  } catch (error) {
    return execSync(os.platform() === 'win32' ? 'dir' : 'ls -la', { 
      encoding: 'utf8',
      cwd: dirPath,
      ...options 
    });
  }
}

export function getCurrentDirectory(): string {
  return process.cwd();
}

export function executeCommand(command: string, options: ShellOptions = {}): string {
  return execSync(command, {
    encoding: 'utf8',
    ...options
  });
}

export function escapeShellArg(arg: string): string {
  if (os.platform() === 'win32') {
    return `"${arg.replace(/"/g, '""')}"`;
  }
  return `'${arg.replace(/'/g, "'\\''")}'`;
}
