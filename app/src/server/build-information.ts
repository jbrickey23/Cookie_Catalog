export interface BuildInformation { version:string|null;commit:string|null;branch:string|null;source:"cloudflare-workers-builds"|"github-actions"|"unknown";buildNode:string|null;builtAt:string|null }
declare const __CC_BUILD_INFORMATION__:BuildInformation;
export function buildInformation():BuildInformation {
  return typeof __CC_BUILD_INFORMATION__==="undefined"
    ? {version:null,commit:null,branch:null,source:"unknown",buildNode:null,builtAt:null}
    : __CC_BUILD_INFORMATION__;
}
