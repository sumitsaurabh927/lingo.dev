import fs from "fs";
import { ChildProcess, spawn, execSync } from "child_process";

export const readJsonFile = (path: string) =>
  JSON.parse(fs.readFileSync(path, "utf8"));
export const readJavaScriptFile = (path: string) => {
  const content = fs.readFileSync(path, "utf8");
  const normalized = content
    .replace(/^export\s+default\s+/, "")
    .replace(/;?\s*$/, "")
    .trim();
  return eval(`(${normalized})`);
};

export const startProcess = async (
  cmd: string,
  args: string[],
  env: Record<string, string> = {},
) => {
  // Start the app and wait for it to be ready
  const proc = spawn(cmd, args, {
    stdio: "inherit",
    env: { ...process.env, ...env },
  });
  return proc;
};

export const stopProcess = async (proc: ChildProcess, port: number) => {
  if (!proc || proc.killed) return;

  console.log("Stopping server...");

  try {
    if (proc.pid) {
      // Kill all child processes first
      execSync(`pkill -P ${proc.pid}`, { stdio: "inherit" });
      // Kill the main process
      execSync(`kill -9 ${proc.pid}`, { stdio: "inherit" });
    }
  } catch (error) {
    console.log("Error killing process:", error);
  }

  // Force cleanup any remaining processes on the port, but be more selective
  try {
    const pids = execSync(`lsof -ti:${port}`, { encoding: "utf8" })
      .trim()
      .split("\n")
      .filter(Boolean);
    for (const pid of pids) {
      // Only kill if it's not our own process
      if (pid !== process.pid.toString()) {
        execSync(`kill -9 ${pid} 2>/dev/null || true`);
      }
    }
  } catch (error) {
    // Ignore errors in cleanup
  }

  console.log("Server stopped");
};

export const waitForServerAtPort = async (port: number, timeoutMs = 30000) => {
  // Wait for the server to start
  await new Promise<void>((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error("Server startup timeout"));
    }, timeoutMs);

    const checkServer = () => {
      fetch(`http://localhost:${port}`)
        .then(() => {
          clearTimeout(timeout);
          resolve();
        })
        .catch((e) => {
          setTimeout(checkServer, 1000);
        });
    };

    checkServer();
  });
};
