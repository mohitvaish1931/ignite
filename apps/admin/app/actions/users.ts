"use server";

import { db } from "@project-organizer/sdk";
import { Prisma } from "@prisma/client";

export async function getUsers(params: {
  page?: number;
  pageSize?: number;
  search?: string;
}) {
  try {
    const page = params.page || 1;
    const pageSize = params.pageSize || 10;
    const skip = (page - 1) * pageSize;

    const where: Prisma.UserWhereInput = {
      isDeleted: false,
    };

    if (params.search) {
      where.OR = [
        { firstName: { contains: params.search, mode: "insensitive" } },
        { lastName: { contains: params.search, mode: "insensitive" } },
        { email: { contains: params.search, mode: "insensitive" } },
      ];
    }

    const [users, total] = await Promise.all([
      db.user.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: "desc" },
        include: {
          organization: true,
          userRoles: {
            include: {
              role: true
            }
          },
          _count: {
            select: {
              eventRegistrations: true,
              teamMembers: true
            }
          }
        },
      }),
      db.user.count({ where }),
    ]);

    return {
      success: true,
      data: {
        users: users.map((user) => ({
          id: user.id,
          name: [user.firstName, user.lastName].filter(Boolean).join(" ") || "Unknown",
          email: user.email,
          organization: user.organization.name,
          role: user.userRoles?.[0]?.role?.name || "Member",
          eventsJoined: user._count.eventRegistrations,
          hackathons: user._count.teamMembers,
          createdAt: user.createdAt.toISOString(),
          joined: user.createdAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          status: user.isDeleted ? "Inactive" : "Active"
        })),
        total,
        pageCount: Math.ceil(total / pageSize),
      },
    };
  } catch (error: any) {
    console.error("Failed to fetch users:", error);
    return {
      success: false,
      error: "Failed to load users",
    };
  }
}
