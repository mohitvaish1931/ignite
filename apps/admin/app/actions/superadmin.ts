"use server";

import { db } from "@project-organizer/sdk";

// Helper to mock or fetch auth. In reality, you'd have a strict auth check here.
// For now, we assume if you can hit this action, you are in the superadmin portal.
async function verifySuperAdmin() {
  // Add robust role checking logic here.
  return true; 
}

export async function getUsersAndRoles() {
  try {
    await verifySuperAdmin();

    let roles = await db.role.findMany();
    
    // Ensure VOLUNTEER exists
    const volunteerRole = roles.find((r: any) => r.name === "VOLUNTEER");
    if (!volunteerRole) {
      const org = await db.organization.findFirst();
      if (org) {
        const newVolunteer = await db.role.create({
          data: {
            name: "VOLUNTEER",
            organizationId: org.id,
            isSystem: true,
            description: "Scanner Volunteer"
          }
        });
        roles.push(newVolunteer);
      }
    }

    const [users] = await Promise.all([
      db.user.findMany({
        include: {
          userRoles: {
            include: {
              role: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      })
    ]);

    // Format data for the UI
    const formattedUsers = users.map(u => ({
      id: u.id,
      name: `${u.firstName} ${u.lastName || ''}`.trim(),
      email: u.email,
      roles: u.userRoles.map(ur => ({ id: ur.role.id, name: ur.role.name }))
    }));

    return { success: true, users: formattedUsers, availableRoles: roles };
  } catch (error) {
    console.error("Failed to fetch superadmin data:", error);
    return { success: false, error: "Failed to load users and roles." };
  }
}

export async function assignRoleToUser(userId: string, roleId: string) {
  try {
    await verifySuperAdmin();

    const existing = await db.userRole.findUnique({
      where: { userId_roleId: { userId, roleId } }
    });

    if (existing) {
      return { success: false, error: "User already has this role." };
    }

    await db.userRole.create({
      data: { userId, roleId }
    });

    return { success: true };
  } catch (error) {
    console.error("Failed to assign role:", error);
    return { success: false, error: "Failed to assign role." };
  }
}

export async function revokeRoleFromUser(userId: string, roleId: string) {
  try {
    await verifySuperAdmin();

    await db.userRole.delete({
      where: { userId_roleId: { userId, roleId } }
    });

    return { success: true };
  } catch (error) {
    console.error("Failed to revoke role:", error);
    return { success: false, error: "Failed to revoke role." };
  }
}
