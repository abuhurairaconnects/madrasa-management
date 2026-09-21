import { prisma } from "./prisma";

export const DEFAULT_INSTITUTION_ID = "inst-jamia-01";

/**
 * Get current institution ID from request or fallback to default
 */
export async function getCurrentInstitutionId(
  request?: Request | null
): Promise<string> {
  if (request) {
    // 1. Direct header
    const headerId = request.headers.get("x-institution-id");
    if (headerId && headerId.trim()) return headerId.trim();

    // 2. Cookie header (madrasa_institution_id)
    const cookieHeader = request.headers.get("cookie");
    if (cookieHeader) {
      const match = cookieHeader.match(/(?:^|;\s*)madrasa_institution_id=([^;]+)/);
      if (match && match[1]) {
        const cookieVal = decodeURIComponent(match[1].trim());
        if (cookieVal) {
          // Check if valid institution in DB
          try {
            const found = await prisma.institution.findUnique({
              where: { id: cookieVal },
              select: { id: true },
            });
            if (found) return found.id;
          } catch {
            // Ignore DB check error, proceed
          }
        }
      }
    }

    // 3. Query string
    try {
      const url = new URL(request.url);
      const queryId = url.searchParams.get("institutionId");
      if (queryId && queryId.trim()) return queryId.trim();
    } catch {
      // Ignore URL parse errors
    }
  }

  // Find first active institution in database, or fallback to default constant
  try {
    const institution = await prisma.institution.findFirst({
      select: { id: true },
      orderBy: { createdAt: "asc" },
    });
    return institution?.id || DEFAULT_INSTITUTION_ID;
  } catch {
    return DEFAULT_INSTITUTION_ID;
  }
}

/**
 * Helper to inject institutionId filter to Prisma query
 */
export function withTenant<T extends Record<string, any>>(
  institutionId: string,
  filter?: T
): T & { institutionId: string } {
  return {
    ...(filter || {}),
    institutionId,
  } as T & { institutionId: string };
}
