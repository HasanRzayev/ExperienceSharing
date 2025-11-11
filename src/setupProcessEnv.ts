import lamejs from 'lamejs';

const globalScope = globalThis as typeof globalThis & {
  process?: { env?: Record<string, string> };
  Lame?: unknown;
};

if (!globalScope.process) {
  globalScope.process = { env: {} };
} else if (!globalScope.process.env) {
  globalScope.process.env = {};
}

const processEnv = globalScope.process.env!;
const viteEnv = import.meta.env as Record<string, unknown>;

for (const [key, value] of Object.entries(viteEnv)) {
  if (key.startsWith('VITE_') || key.startsWith('REACT_APP_')) {
    processEnv[key] = String(value);
  }
}

if (typeof import.meta.env.MODE !== 'undefined') {
  processEnv.NODE_ENV = String(import.meta.env.MODE);
}

if (!processEnv.REACT_APP_API_BASE_URL) {
  processEnv.REACT_APP_API_BASE_URL =
    'https://experiencesharingbackend.runasp.net/api';
}

if (!globalScope.Lame) {
  globalScope.Lame = lamejs;
}

export const env = processEnv;

