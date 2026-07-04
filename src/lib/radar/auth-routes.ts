/** ログイン必須の Sneaker Radar ルート（ゲストは localStorage で利用可） */
export const RADAR_PROTECTED_PATHS = [] as const;

export function isRadarProtectedPath(pathname: string): boolean {
  return RADAR_PROTECTED_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );
}

export function sanitizeRedirectPath(path: string | null | undefined): string {
  if (!path || !path.startsWith("/") || path.startsWith("//")) {
    return "/dashboard";
  }
  return path;
}
