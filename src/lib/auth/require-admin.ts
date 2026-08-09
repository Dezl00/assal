import { auth } from "@/lib/auth"

/**
 * Require an authenticated admin or manager session.
 * Throws an error if the user is not authenticated or not an admin/manager.
 * Use this in every server action that modifies admin-only data.
 */
export async function requireAdmin() {
  const session = await auth()
  if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "MANAGER")) {
    throw new Error("Unauthorized")
  }
  return session
}

/**
 * Require an authenticated admin or manager session with a specific permission.
 * Falls through if the user is ADMIN (admins have all permissions).
 * For MANAGER, checks if the user has the specified permission.
 */
export async function requirePermission(permission: string) {
  const session = await auth()
  if (!session?.user) {
    throw new Error("Unauthorized")
  }
  
  if (session.user.role === "ADMIN") return session
  
  if (session.user.role !== "MANAGER") {
    throw new Error("Unauthorized")
  }
  
  const permissions = session.user.permissions || []
  if (!permissions.includes(permission) && !permissions.some((p: string) => p.startsWith(`${permission}.`))) {
    throw new Error("Insufficient permissions")
  }
  
  return session
}
