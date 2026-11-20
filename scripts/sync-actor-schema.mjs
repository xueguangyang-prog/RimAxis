#!/usr/bin/env node
/**
 * Fetch and pin the official input schema for the selected discovery provider.
 * Requires APIFY_API_TOKEN in the environment. Never prints the token.
 */
import { mkdir, writeFile } from "node:fs/promises";

const actorId = "compass~crawler-google-places";
const base = "https://api.apify.com/v2";
const token = process.env.APIFY_API_TOKEN;
if (!token) {
  console.error("Missing APIFY_API_TOKEN. Set it in the secure runtime environment.");
  process.exit(2);
}
const headers = { Authorization: `Bearer ${token}` };
async function get(path) {
  const response = await fetch(`${base}${path}`, { headers });
  if (!response.ok) throw new Error(`Schema request failed: HTTP ${response.status}`);
  return response.json();
}
const actor = await get(`/acts/${actorId}`);
const buildId = actor?.defaultBuildId ?? actor?.defaultRunOptions?.buildId;
if (!buildId) throw new Error("The actor response did not expose a default build ID.");
const build = await get(`/actor-builds/${encodeURIComponent(buildId)}`);
const definition = build?.data?.actorDefinition ?? build?.actorDefinition;
const schema = definition?.input ?? definition?.inputSchema ?? build?.data?.inputSchema;
if (!schema || schema.type !== "object" || !schema.properties) {
  throw new Error("Official build response did not contain a valid input schema.");
}
const outDir = new URL("../src/discovery/actor-schema/", import.meta.url);
await mkdir(outDir, { recursive: true });
await writeFile(new URL("input.schema.json", outDir), JSON.stringify(schema, null, 2) + "\n");
await writeFile(new URL("schema.meta.json", outDir), JSON.stringify({
  actorId: "compass/crawler-google-places",
  buildId,
  fetchedAt: new Date().toISOString(),
  source: "https://apify.com/compass/crawler-google-places/input-schema"
}, null, 2) + "\n");
console.log(`Saved official input schema for build ${buildId}`);
