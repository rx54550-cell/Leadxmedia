import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { LeadXMedia } from "leadxmedia";
import { registerTools } from "./tools";

if (process.argv.includes("--version")) {
  console.log("0.1.3");
  process.exit(0);
}
if (process.argv.includes("--help")) {
  console.log(`leadxmedia-mcp: MCP server for LeadXMedia over stdio.

Run it from your MCP client with: npx -y leadxmedia-mcp
Environment:
  LEADXMEDIA_API_KEY    required, from Settings > API & webhooks
  LEADXMEDIA_URL        your LeadXMedia URL (default https://app.leadxmedia.com)
  LEADXMEDIA_MCP_WRITE  true registers the write tools (off by default)
Docs: https://leadxmedia.com/docs/mcp/`);
  process.exit(0);
}
const apiKey = process.env.LEADXMEDIA_API_KEY;
if (!apiKey) {
  console.error(
    "Set LEADXMEDIA_API_KEY (Settings > API & webhooks in LeadXMedia). Run with --help for details.",
  );
  process.exit(1);
}
const op = new LeadXMedia({
  apiKey,
  baseUrl: process.env.LEADXMEDIA_URL ?? "https://app.leadxmedia.com",
});
const allowWrite = process.env.LEADXMEDIA_MCP_WRITE === "true";

const server = new McpServer({ name: "leadxmedia", version: "0.1.3" });

registerTools(server, op, allowWrite);

await server.connect(new StdioServerTransport());
