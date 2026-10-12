/** Authentication boundary: no identity is trusted without a verified token. */
export interface AuthenticatedUser {
  subject: string;
  email: string | null;
  role: "owner" | "editor" | "viewer";
}
export interface IdentityVerifier {
  verify(request: Request): Promise<AuthenticatedUser | null>;
}
export function mayRead(user: AuthenticatedUser | null): boolean {
  return user !== null;
}
export function mayWrite(user: AuthenticatedUser | null): boolean {
  return user !== null && (user.role === "owner" || user.role === "editor");
}
/** Until identity verification and membership lookup are implemented, reject every request. */
export class DenyAllIdentityVerifier implements IdentityVerifier {
  async verify(_request: Request): Promise<null> { return null; }
}
