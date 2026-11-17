/** Public build-time config (VITE_* values are bundled into the site — never secrets). */
export const env = {
  apiUrl: ((import.meta.env.VITE_API_URL as string | undefined) ?? 'http://localhost:3000').replace(/\/$/, ''),
  stage: (import.meta.env.VITE_STAGE as string | undefined) ?? 'local',
};
