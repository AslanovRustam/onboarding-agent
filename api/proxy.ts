// api/proxy.ts
import { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const targetUrl = req.query.url as string;

  if (!targetUrl) {
    return res
      .status(400)
      .json({ error: "Missing ?url= parameter" });
  }

  try {
    const response = await fetch(targetUrl, {
      method: req.method || 'GET',
      headers: {
        "Content-Type": "application/json",
        ...req.headers,
      },
      body: ["POST", "PUT", "PATCH"].includes(req.method || 'GET')
        ? JSON.stringify(req.body)
        : undefined,
    });

    const data = await response.text(); // может быть JSON или текст
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader(
      "Content-Type",
      response.headers.get("content-type") || "text/plain",
    );
    return res.status(response.status).send(data);
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    return res
      .status(500)
      .json({ error: "Proxy error", details: errorMessage });
  }
}