import { spawn } from 'node:child_process';

const env = Object.fromEntries(
  Object.entries(process.env).filter(
    ([key, value]) => key && !key.startsWith('=') && typeof value === 'string' && !value.includes('\0')
  )
);

const processes = [
  {
    name: 'api',
    command: process.execPath,
    args: ['server/server.js'],
    cwd: process.cwd(),
  },
  {
    name: 'web',
    command: process.execPath,
    args: ['../node_modules/vite/bin/vite.js'],
    cwd: 'frontend',
  },
];

const children = processes.map(({ name, command, args, cwd }) => {
  let child;

  try {
    child = spawn(command, args, {
      cwd,
      stdio: 'inherit',
      env,
    });
  } catch (err) {
    console.error(`[${name}] failed to start ${command}: ${err.message}`);
    process.exit(1);
  }

  child.on('error', (err) => {
    console.error(`[${name}] failed to start: ${err.message}`);
    shutdown(1);
  });

  child.on('exit', (code, signal) => {
    if (signal) return;
    if (code && code !== 0) {
      console.error(`[${name}] exited with code ${code}`);
      shutdown(code);
    }
  });

  return child;
});

function shutdown(code = 0) {
  for (const child of children) {
    if (!child.killed) {
      child.kill();
    }
  }
  process.exit(code);
}

process.on('SIGINT', () => shutdown(0));
process.on('SIGTERM', () => shutdown(0));
