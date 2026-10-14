import { defineConfig } from "vite";
import { cloudflare } from "@cloudflare/vite-plugin";
const cloudflareCommit=process.env.WORKERS_CI_COMMIT_SHA;
const checkoutCommit=process.env.GITHUB_SHA;
const commit=cloudflareCommit&&/^[a-f0-9]{40}$/i.test(cloudflareCommit)?cloudflareCommit:checkoutCommit&&/^[a-f0-9]{40}$/i.test(checkoutCommit)?checkoutCommit:null;
const information={commit,branch:process.env.WORKERS_CI_BRANCH??process.env.GITHUB_HEAD_REF??process.env.GITHUB_REF_NAME??null,source:commit===cloudflareCommit?"cloudflare-workers-builds":commit?"github-actions":"unknown",buildNode:process.version,builtAt:new Date().toISOString()};
export default defineConfig({ plugins: [cloudflare()],define:{__CC_BUILD_INFORMATION__:JSON.stringify(information)} });
