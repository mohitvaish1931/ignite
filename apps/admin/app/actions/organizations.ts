"use server";

import { db } from "@project-organizer/sdk";
import { Prisma } from "@prisma/client";

export async function getOrganizations(params: {
  page?: number;
  pageSize?: number;
  search?: string;
}) {
  try {
    const page = params.page || 1;
    const pageSize = params.pageSize || 10;
    const skip = (page - 1) * pageSize;

    const where: Prisma.OrganizationWhereInput = {
      isDeleted: false,
    };

    if (params.search) {
      where.OR = [
        { name: { contains: params.search, mode: "insensitive" } },
        { slug: { contains: params.search, mode: "insensitive" } },
      ];
    }

    const [organizations, total] = await Promise.all([
      db.organization.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: "desc" },
        include: {
          _count: {
            select: { users: true, events: true }
          }
        }
      }),
      db.organization.count({ where }),
    ]);

    return {
      success: true,
      data: {
        organizations: organizations.map((org) => ({
          id: org.id,
          name: org.name,
          slug: org.slug,
          domain: org.domain || "N/A",
          plan: org.plan,
          usersCount: org._count.users,
          eventsCount: org._count.events,
          createdAt: org.createdAt.toISOString(),
        })),
        total,
        pageCount: Math.ceil(total / pageSize),
      },
    };
  } catch (error: any) {
    console.error("Failed to fetch organizations:", error);
    return {
      success: false,
      error: "Failed to load organizations",
    };
  }
}

export async function createOrganization(name: string, domain: string) {
  try {
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const org = await db.organization.create({
      data: {
        name,
        slug,
        domain: domain || null,
      }
    });
    return { success: true, organization: org };
  } catch (error: any) {
    console.error("Failed to create organization:", error);
    return { success: false, error: "Failed to create organization" };
  }
}

export async function changeOrganizationPlan(orgIds: string[], plan: string) {
  try {
    const updated = await db.organization.updateMany({
      where: { id: { in: orgIds } },
      data: { plan: plan as "STARTER" | "PROFESSIONAL" | "ENTERPRISE" }
    });
    return { success: true, count: updated.count };
  } catch (error: any) {
    console.error("Failed to update organization plan:", error);
    return { success: false, error: "Failed to update plans" };
  }
}

export async function updateOrganizationLogo(orgId: string, formData: FormData) {
  try {
    const imageFile = formData.get("logoFile") as File | null;
    if (!imageFile || imageFile.size === 0) {
      return { success: false, error: "No file provided" };
    }
    
    // Import inside function to avoid top-level issues if not needed elsewhere
    const { createClient } = require("@supabase/supabase-js");
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const fileExt = imageFile.name.split('.').pop();
    const fileName = `logo-${orgId}-${Date.now()}.${fileExt}`;
    
    // Using 'event' bucket as mentioned in plan
    const { data: uploadData, error: uploadError } = await supabase
      .storage
      .from('event')
      .upload(fileName, imageFile, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      throw new Error("Failed to upload image: " + uploadError.message);
    }

    const { data: publicUrlData } = supabase.storage.from('event').getPublicUrl(fileName);
    const logoUrl = publicUrlData.publicUrl;

    await db.organization.update({
      where: { id: orgId },
      data: { logoUrl }
    });

    return { success: true, logoUrl };
  } catch (error: any) {
    console.error("Failed to update logo:", error);
    return { success: false, error: error.message || "Failed to update logo" };
  }
}

