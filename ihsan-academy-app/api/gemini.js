const DEFAULT_ENDPOINT = "https://generativelanguage.googleapis.com";
const DEFAULT_MODEL = "gemini-2.5-flash-lite";

function toSsePayload(text) {
  try {
    return JSON.stringify(JSON.parse(text));
  } catch {
    return JSON.stringify({ error: text || "Empty response from Gemini" });
  }
}

async function postToGemini(url, body) {
  let lastError;
  for (let attempt = 1; attempt <= 2; attempt += 1) {
    try {
      return await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
      });
    } catch (error) {
      lastError = error;
      if (attempt < 2) {
        await new Promise((resolve) => setTimeout(resolve, 700));
      }
    }
  }
  throw lastError;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "GEMINI_API_KEY is not configured" });
  }

  const { contents, generationConfig, model } = req.body ?? {};
  if (!Array.isArray(contents)) {
    return res.status(400).json({ error: "contents must be an array" });
  }

  const selectedModel = model || process.env.GEMINI_MODEL || DEFAULT_MODEL;
  const baseEndpoint = process.env.GEMINI_ENDPOINT || DEFAULT_ENDPOINT;
  const models = Array.from(new Set([selectedModel, "gemini-2.5-flash-lite", "gemini-2.0-flash"]));
  let upstream;
  let text = "";
  let usedModel = selectedModel;
  let lastNetworkError = "";

  for (const candidateModel of models) {
    usedModel = candidateModel;
    const url = `${String(baseEndpoint).replace(/\/$/, "")}/v1beta/models/${candidateModel}:generateContent?key=${apiKey}`;
    try {
      upstream = await postToGemini(url, JSON.stringify({ contents, generationConfig }));
      text = await upstream.text();
    } catch (error) {
      lastNetworkError = error instanceof Error ? error.message : String(error);
      upstream = undefined;
      text = "";
      continue;
    }
    if (upstream.ok || ![400, 404, 429, 503].includes(upstream.status)) break;
  }

  res.statusCode = upstream?.status ?? 502;
  res.setHeader("Content-Type", "text/event-stream; charset=utf-8");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("X-Gemini-Model", usedModel);

  if (!upstream) {
    return res.end(`data: ${JSON.stringify({ error: `Gemini network error: ${lastNetworkError || "unknown"}` })}\n\n`);
  }

  if (!upstream?.ok) {
    return res.end(`data: ${JSON.stringify({ error: text })}\n\n`);
  }

  return res.end(`data: ${toSsePayload(text)}\n\n`);
}
