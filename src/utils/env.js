const sanitizeEnvString = (value) => {
  if (value === undefined || value === null) {
    return undefined;
  }

  let str = String(value).trim();

  const quotePairs = [
    ['"', '"'],
    ["'", "'"],
    ['`', '`'],
  ];

  for (const [start, end] of quotePairs) {
    if (str.startsWith(start) && str.endsWith(end)) {
      str = str.slice(start.length, str.length - end.length).trim();
      break;
    }
  }

  if (!str) {
    return undefined;
  }

  return str;
};

const normalizeUrlLikeValue = (value) => {
  if (!value) return value;

  let result = value.replace(/^(https?:)\/(?!\/)/i, '$1//');

  const protocolMatch = result.match(/^(https?:\/\/)/i);
  if (!protocolMatch) {
    return result.replace(/\/{2,}/g, '/');
  }

  const protocol = protocolMatch[1];
  const rest = result.slice(protocol.length).replace(/\/{2,}/g, '/');
  return `${protocol}${rest}`;
};

export const resolveEnvValue = (...keys) => {
  if (typeof process !== 'undefined' && process.env) {
    for (const key of keys) {
      const value = process.env[key];
      const sanitized = sanitizeEnvString(value);
      if (sanitized !== undefined) {
        return sanitized;
      }
    }
  }

  if (typeof import.meta !== 'undefined' && import.meta.env) {
    for (const key of keys) {
      const value = import.meta.env[key];
      const sanitized = sanitizeEnvString(value);
      if (sanitized !== undefined) {
        return sanitized;
      }
    }
  }

  return undefined;
};

export const getCloudinaryBaseEndpoint = () => {
  const raw = resolveEnvValue('REACT_APP_CLOUDINARY_ENDPOINT');
  const fallback = 'https://api.cloudinary.com/v1_1/dj997ctyw/';
  if (!raw) return fallback;

  const normalized = normalizeUrlLikeValue(raw);
  if (!normalized) return fallback;

  return normalized.endsWith('/') ? normalized : `${normalized}/`;
};

export const getApiBaseUrl = () => {
  const fallback = 'https://experiencesharingbackend.runasp.net/api';
  const raw = resolveEnvValue('REACT_APP_API_BASE_URL');
  if (!raw) return fallback;

  const normalized = normalizeUrlLikeValue(raw);
  return normalized || fallback;
};

export const getSignalRHubUrl = () => {
  const fallback = 'https://experiencesharingbackend.runasp.net/api/hubs/message';
  const raw = resolveEnvValue('REACT_APP_SIGNALR_HUB_URL');
  if (!raw) return fallback;

  const normalized = normalizeUrlLikeValue(raw);
  return normalized || fallback;
};

