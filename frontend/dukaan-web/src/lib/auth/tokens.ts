export interface JwtPayload {
  userId: string;
  email: string;
  tenantId: string;
  userType: number;
}

export function decodeToken(token: string): JwtPayload | null {
  try {
    const payload = token.split(".")[1];
    const decoded = JSON.parse(atob(payload));
    return {
      userId: decoded.nameid ?? decoded.sub ?? "",
      email: decoded.email ?? "",
      tenantId: decoded.tenant_id ?? "",
      userType: Number(decoded.user_type ?? 0),
    };
  } catch {
    return null;
  }
}
