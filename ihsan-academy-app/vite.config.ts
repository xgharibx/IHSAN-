import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

const DEFAULT_GEMINI_ENDPOINT = "https://generativelanguage.googleapis.com";
const DEFAULT_GEMINI_MODEL = "gemini-2.5-flash-lite";

function toSsePayload(text: string): string {
  try {
    return JSON.stringify(JSON.parse(text));
  } catch {
    return JSON.stringify({ error: text || "Empty response from Gemini" });
  }
}

function getGeminiApiKey(env: Record<string, string>): string | undefined {
  return (
    env.GEMINI_API_KEY ||
    env.VITEGEMINIAPI_KEY ||
    env.VITE_GEMINIAPI_KEY ||
    env.VITE_GEMINI_API_KEY ||
    env.GOOGLE_API_KEY ||
    env.GOOGLE_GENERATIVE_AI_API_KEY
  );
}

async function postToGemini(url: string, body: string): Promise<Response> {
  let lastError: unknown;
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

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const geminiApiKey = getGeminiApiKey(env);
  const geminiEndpoint = env.GEMINI_ENDPOINT || DEFAULT_GEMINI_ENDPOINT;
  const geminiModel = env.GEMINI_MODEL || DEFAULT_GEMINI_MODEL;

  return {
    plugins: [
      react(),
      {
        name: "local-gemini-api",
        configureServer(server) {
          server.middlewares.use("/api/gemini", async (req, res) => {
            if (req.method !== "POST") {
              res.statusCode = 405;
              res.setHeader("Allow", "POST");
              res.end(JSON.stringify({ error: "Method not allowed" }));
              return;
            }

            if (!geminiApiKey) {
              res.statusCode = 500;
              res.end(JSON.stringify({ error: "GEMINI_API_KEY is not configured" }));
              return;
            }

            const chunks: Buffer[] = [];
            for await (const chunk of req) {
              chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
            }

            const body = JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}");
            const selectedModel = body.model || geminiModel;
            const models = Array.from(new Set([selectedModel, "gemini-2.5-flash-lite", "gemini-2.0-flash"]));
            let upstream: Response | undefined;
            let text = "";
            let usedModel = selectedModel;
            let lastNetworkError = "";

            for (const candidateModel of models) {
              usedModel = candidateModel;
              const url = `${geminiEndpoint.replace(/\/$/, "")}/v1beta/models/${candidateModel}:generateContent?key=${geminiApiKey}`;
              try {
                upstream = await postToGemini(
                  url,
                  JSON.stringify({
                    contents: body.contents,
                    generationConfig: body.generationConfig,
                  }),
                );
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
              res.end(`data: ${JSON.stringify({ error: `Gemini network error: ${lastNetworkError || "unknown"}` })}\n\n`);
              return;
            }
            res.end(upstream.ok ? `data: ${toSsePayload(text)}\n\n` : `data: ${JSON.stringify({ error: text })}\n\n`);
          });
        },
      },
    ],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    server: {
      port: 5173,
      open: true,
    },
  };
});
