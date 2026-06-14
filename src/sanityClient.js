const projectId = import.meta.env.VITE_GROQ_PROJECT_ID;
const dataset = import.meta.env.VITE_GROQ_DATASET;
const apiKey = import.meta.env.VITE_GROQ_API_KEY;
const apiVersion = '2024-05-15';

export const hasSanityConfig = Boolean(projectId && dataset && apiKey);

export async function groqFetch(query, params = {}) {
  if (!hasSanityConfig) {
    throw new Error('Sanity GROQ config missing: set VITE_GROQ_PROJECT_ID and VITE_GROQ_DATASET');
  }

  const url = `https://${projectId}.api.sanity.io/v${apiVersion}/data/query/${dataset}?query=${encodeURIComponent(query)}`;
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${apiKey}`,
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    const payload = await response.text();
    throw new Error(`GROQ fetch failed (${response.status}): ${payload}`);
  }

  const body = await response.json();
  return body.result;
}
