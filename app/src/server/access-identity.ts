import { createRemoteJWKSet, jwtVerify, type JWTVerifyGetKey } from "jose";

/** Identity is accepted only after signature and registered-claim verification. */
export interface AuthenticatedUser {
  subject: string;
  email: string | null;
  role: "owner" | "editor" | "viewer";
}
export interface IdentityVerifier {
  verify(request: Request): Promise<AuthenticatedUser | null>;
}
export function mayRead(user: AuthenticatedUser | null): boolean { return user !== null && ["owner","editor","viewer"].includes(user.role); }
export function mayWrite(user: AuthenticatedUser | null): boolean {
  return user !== null && (user.role === "owner" || user.role === "editor");
}
export class DenyAllIdentityVerifier implements IdentityVerifier {
  async verify(_request: Request): Promise<null> { return null; }
}

export interface AccessConfiguration {
  ACCESS_TEAM_DOMAIN?: string;
  ACCESS_AUD?: string;
  OWNER_EMAIL?: string;
}
/** Trusted server-side membership adapter; never resolve roles from JWT custom claims. */
export interface MembershipResolver {
  resolve(subject: string, verifiedEmail: string): Promise<"editor" | "viewer" | null>;
}
const remoteKeys = new Map<string, JWTVerifyGetKey>();
export function accessIsConfigured(config: AccessConfiguration): boolean {
  return /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.cloudflareaccess\.com$/.test(config.ACCESS_TEAM_DOMAIN ?? "")
    && /^[a-f0-9]{64}$/.test(config.ACCESS_AUD ?? "")
    && /^[^\s@]+@[^\s@]+$/.test(config.OWNER_EMAIL ?? "");
}

/** Owner bootstrap remains the only wired runtime path. Optional membership is preparation only. */
export class AccessIdentityVerifier implements IdentityVerifier {
  constructor(private readonly config: AccessConfiguration, private readonly keys?: JWTVerifyGetKey, private readonly membership?: MembershipResolver) {}

  async verify(request: Request): Promise<AuthenticatedUser | null> {
    if (!accessIsConfigured(this.config)) return null;
    const token = request.headers.get("Cf-Access-Jwt-Assertion");
    if (!token || token.length > 16384) return null;
    const issuer = `https://${this.config.ACCESS_TEAM_DOMAIN}`;
    try {
      let keys = this.keys ?? remoteKeys.get(issuer);
      if (!keys) {
        keys = createRemoteJWKSet(new URL(`${issuer}/cdn-cgi/access/certs`), {
          timeoutDuration: 5000, cooldownDuration: 30000, cacheMaxAge: 600000
        });
        remoteKeys.set(issuer, keys);
      }
      const { payload } = await jwtVerify(token, keys, {
        issuer, audience: this.config.ACCESS_AUD, algorithms: ["RS256"],
        requiredClaims: ["iss", "aud", "sub", "exp", "iat"],
        clockTolerance: 5
      });
      // Reject service tokens; role assignment follows signature/claims verification.
      if (payload.type !== "app" || typeof payload.sub !== "string" || !payload.sub.trim()
          || typeof payload.email !== "string" || !payload.email.trim()
          || typeof payload.iat !== "number" || payload.iat > Math.floor(Date.now() / 1000) + 5) return null;
      const email = payload.email.trim().toLowerCase();
      if (email === this.config.OWNER_EMAIL!.trim().toLowerCase()) return { subject: payload.sub, email, role: "owner" };
      const role=await this.membership?.resolve(payload.sub,email);
      if(role!=="editor" && role!=="viewer")return null;
      return {subject:payload.sub,email,role};
    } catch {
      // Invalid JWTs, unknown keys and key-service outages all fail closed; never log tokens.
      return null;
    }
  }
}
