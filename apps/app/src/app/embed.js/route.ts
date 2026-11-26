import { env } from "@/server/env";
import { scriptResponse } from "@/server/static-script";

export const dynamic = "force-dynamic";

/** <leadxmedia-dashboard program="slug" token="..."></leadxmedia-dashboard> */
const js = (base: string) => `/*! LeadXMedia embed | MIT */
(function(){if(customElements.get("leadxmedia-dashboard"))return;
customElements.define("leadxmedia-dashboard",class extends HTMLElement{connectedCallback(){var f=document.createElement("iframe");
f.src=${JSON.stringify(base)}+"/embed/"+encodeURIComponent(this.getAttribute("program")||"")+"?token="+encodeURIComponent(this.getAttribute("token")||"");
f.title="Referral program";f.loading="lazy";f.style.cssText="width:100%;border:0;min-height:"+(this.getAttribute("height")||"230")+"px";this.appendChild(f);}});})();`;

const body = js(env.APP_URL);

export function GET(req: Request) {
  return scriptResponse(req, body);
}
