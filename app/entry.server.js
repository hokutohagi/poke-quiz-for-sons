import { RemixServer } from "@remix-run/react";
import { handleRequest } from "@vercel/remix";

export default function handler(
  request,
  responseStatusCode,
  responseHeaders,
  remixContext
) {
  let remixServer = <RemixServer context={remixContext} url={request.url} />;
  return handleRequest(
    request,
    responseStatusCode,
    responseHeaders,
    remixServer
  );
}
