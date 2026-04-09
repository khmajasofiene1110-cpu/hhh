/** Only this username may open the master admin panel (case-insensitive). */
export const MASTER_ADMIN_USERNAME = "admin";

export function isMasterAdminUsername(username: string): boolean {
  return username.trim().toLowerCase() === MASTER_ADMIN_USERNAME.toLowerCase();
}
