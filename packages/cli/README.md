# leadxmedia-cli

Command line for [LeadXMedia](https://leadxmedia.com), the open-source affiliate and referral platform for SaaS. Check stats and manage partners, commissions and payouts from your terminal.

```bash
npx leadxmedia-cli login --url https://app.leadxmedia.com --key op_live_...   # op_sk_... on a self-hosted URL
npx leadxmedia-cli programs
npx leadxmedia-cli stats --program prg_...
npx leadxmedia-cli partners list --program prg_...
npx leadxmedia-cli payouts prepare --program prg_...   # approval happens in the dashboard
npx leadxmedia-cli ask --program prg_... "which partners brought paying customers last month?"
npx leadxmedia-cli skill   # installs the agent skill for Claude Code, Codex and Cursor
```

`LEADXMEDIA_URL` and `LEADXMEDIA_API_KEY` env vars override the saved login. Full reference: [leadxmedia.com/docs/cli](https://leadxmedia.com/docs/cli/).

License: [MIT](LICENSE)
