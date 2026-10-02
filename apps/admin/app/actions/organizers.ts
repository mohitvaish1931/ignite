"use server";

import { db } from "@project-organizer/sdk";

export async function getAdminOrganizers() {
  try {
    const organizers = await db.user.findMany({
      where: {
        isDeleted: false,
        // Find users who have an ORGANIZER role or belong to an organization with a specific membership
        OR: [
          {
            userRoles: {
              some: {
                role: {
                  name: {
                    in: ["ORGANIZER", "ADMIN", "SUPERADMIN"]
                  }
                }
              }
            }
          },
          {
            memberships: {
              some: {}
            }
          }
        ]
      },
      include: {
        organization: true,
        userRoles: {
          include: {
            role: true
          }
        },
        _count: {
          select: {
            eventRegistrations: true, // We'll just proxy this for now
          }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    return {
      success: true,
      data: organizers.map(user => ({
        id: user.id,
        name: [user.firstName, user.lastName].filter(Boolean).join(" ") || "Unknown",
        email: user.email,
        organization: user.organization?.name || "IGNITE Team",
        role: user.userRoles?.[0]?.role?.name || "Organizer",
        events: user._count.eventRegistrations || 0,
        hackathons: 0, // Mocked for now since not easily available on user without deeper include
        joined: user.createdAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        status: user.isDeleted ? "Inactive" : "Active"
      }))
    };
  } catch (error) {
    console.error("Failed to fetch organizers:", error);
    return {
      success: false,
      error: "Failed to load organizers",
    };
  }
}

import bcrypt from "bcrypt";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { getAdminJwtSecret } from "../../lib/auth-secret";

async function verifySuperAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value;
  if (!token) return false;
  try {
    const { payload } = await jwtVerify(token, getAdminJwtSecret());
    return payload.role === "SUPER_ADMIN";
  } catch {
    return false;
  }
}

export async function createOrganizer(formData: FormData) {
  try {
    const isSuperAdmin = await verifySuperAdmin();
    if (!isSuperAdmin) return { success: false, error: "Unauthorized. Super Admin only." };

    const email = formData.get("email") as string;
    const firstName = formData.get("name") as string;
    const password = formData.get("password") as string;

    const org = await db.organization.findFirst();
    if (!org) return { success: false, error: "No organization found" };

    let user = await db.user.findUnique({ where: { email } });
    if (user) {
      return { success: false, error: "User already exists with this email" };
    }

    const passwordHash = await bcrypt.hash(password || "ieee@2026", 10);
    user = await db.user.create({
      data: {
        email,
        firstName,
        passwordHash,
        organizationId: org.id
      }
    });

    // Make them an organizer in the EventAssignment table (globally, or we can just give them the generic role)
    // Actually, Organizers should be able to manage events they are assigned to, OR if they are general organizers, 
    // maybe we just insert them into the `UserRole` table as an "ORGANIZER". Let's do that for general organizers.
    
    let role = await db.role.findFirst({ where: { name: "ORGANIZER", organizationId: org.id } });
    if (!role) {
      role = await db.role.create({ data: { name: "ORGANIZER", description: "Organizer Role", organizationId: org.id } });
    }

    await db.userRole.create({
      data: {
        userId: user.id,
        roleId: role.id
      }
    });

    return { success: true, data: user.id };
  } catch (error: any) {
    console.error("Failed to create organizer:", error);
    return { success: false, error: error.message || "Failed to create organizer" };
  }
}
