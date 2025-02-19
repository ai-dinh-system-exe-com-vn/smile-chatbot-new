
import * as followRedirects from "follow-redirects";
import { HttpProxyAgent } from "http-proxy-agent";
import { HttpsProxyAgent } from "https-proxy-agent";
import fetch, { RequestInit, Response } from "node-fetch";
import { ClientCertificateOptions } from "../types";

const { http, https } = (followRedirects as any).default;

export interface RequestOptions {
  timeout?: number;
  verifySsl?: boolean;
  caBundlePath?: string | string[];
  proxy?: string;
  headers?: { [key: string]: string };
  extraBodyProperties?: { [key: string]: any };
  noProxy?: string[];
  clientCertificate?: ClientCertificateOptions;
}

export function fetchwithRequestOptions(
  url_: URL | string,
  init?: RequestInit,
  requestOptions?: RequestOptions
): Promise<Response> {
  let url = url_;
  if (typeof url === "string") {
    url = new URL(url);
  }

  const TIMEOUT = 7200; // 7200 seconds = 2 hours

  const timeout = (requestOptions?.timeout ?? TIMEOUT) * 1000; // measured in ms

  const agentOptions: { [key: string]: any } = {
    rejectUnauthorized: requestOptions?.verifySsl,
    timeout,
    sessionTimeout: timeout,
    keepAlive: true,
    keepAliveMsecs: timeout,
  };

  const proxy = requestOptions?.proxy;

  // Create agent
  const protocol = url.protocol === "https:" ? https : http;
  const agent =
    proxy && !requestOptions?.noProxy?.includes(url.hostname)
      ? protocol === https
        ? new HttpsProxyAgent(proxy, agentOptions)
        : new HttpProxyAgent(proxy, agentOptions)
      : new protocol.Agent(agentOptions);

  let headers: { [key: string]: string } = {};
  for (const [key, value] of Object.entries(init?.headers || {})) {
    headers[key] = value as string;
  }
  headers = {
    ...headers,
    ...requestOptions?.headers,
  };

  // Replace localhost with 127.0.0.1
  if (url.hostname === "localhost") {
    url.hostname = "127.0.0.1";
  }

  // add extra body properties if provided
  let updatedBody: string | undefined = undefined;
  try {
    if (requestOptions?.extraBodyProperties && typeof init?.body === "string") {
      const parsedBody = JSON.parse(init.body);
      updatedBody = JSON.stringify({
        ...parsedBody,
        ...requestOptions.extraBodyProperties,
      });
    }
  } catch (e) {
    console.log("Unable to parse HTTP request body: ", e);
  }

  // fetch the request with the provided options
  const resp = fetch(url, {
    ...init,
    body: updatedBody ?? init?.body,
    headers: headers,
    agent: agent,
  });

  return resp;
}
