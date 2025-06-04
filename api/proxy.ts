// api/proxy.ts

export default async function handler(req, res) {
  const targetUrl = req.query.url;

  if (!targetUrl) {
    return res
      .status(400)
      .json({ error: "Missing ?url= parameter" });
  }

  try {
    const response = await fetch(targetUrl, {
      method: req.method,
      headers: {
        "Content-Type": "application/json",
        ...req.headers,
      },
      body: ["POST", "PUT", "PATCH"].includes(req.method)
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
    return res
      .status(500)
      .json({ error: "Proxy error", details: err.message });
  }
}