export const resolveEnvValue = (...keys) => {
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    for (const key of keys) {
      const value = import.meta.env[key];
      if (value !== undefined) {
        return value;
      }
    }
  }

  if (typeof process !== 'undefined' && process.env) {
    for (const key of keys) {
      const value = process.env[key];
      if (value !== undefined) {
        return value;
      }
    }
  }

  return undefined;
};

export const getCloudinaryBaseEndpoint = () => {
  const raw = resolveEnvValue('VITE_CLOUDINARY_ENDPOINT', 'REACT_APP_CLOUDINARY_ENDPOINT');
  if (!raw) return null;
  const trimmed = String(raw).trim();
  if (!trimmed) return null;
  return trimmed.endsWith('/') ? trimmed : `${trimmed}/`;
};

export const getApiBaseUrl = () => {
  const raw = resolveEnvValue('VITE_API_BASE_URL', 'REACT_APP_API_BASE_URL');
  const fallback = 'https://experiencesharingbackend.runasp.net/api';
  const trimmed = raw ? String(raw).trim() : '';
  return trimmed || fallback;
};

export const getSignalRHubUrl = () => {
  const raw = resolveEnvValue('VITE_SIGNALR_HUB_URL', 'REACT_APP_SIGNALR_HUB_URL');
  const fallback = 'https://experiencesharingbackend.runasp.net/api/hubs/message';
  const trimmed = raw ? String(raw).trim() : '';
  return trimmed || fallback;
};

