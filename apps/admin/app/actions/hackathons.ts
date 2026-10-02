"use server";

import { db } from "@project-organizer/sdk";
import { Prisma } from "@prisma/client";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase Client for Storage
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function getHackathons(params: {
  page?: number;
  pageSize?: number;
  search?: string;
}) {
  try {
    const page = params.page || 1;
    const pageSize = params.pageSize || 10;
    const skip = (page - 1) * pageSize;

    // Same rule as the public site: a hackathon has tracks or is filed under a "Hackathon" category
    const where: Prisma.EventWhereInput = {
      isDeleted: false,
      AND: [
        {
          OR: [
            { hackathonTracks: { some: {} } },
            { category: { name: { contains: "Hackathon", mode: "insensitive" } } },
          ],
        },
        ...(params.search
          ? [{
              OR: [
                { name: { contains: params.search, mode: "insensitive" as const } },
                { slug: { contains: params.search, mode: "insensitive" as const } },
              ],
            }]
          : []),
      ],
    };

    const [events, total] = await Promise.all([
      db.event.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: "desc" },
        include: {
          organization: true,
          _count: {
            select: { hackathonTracks: true, teams: true, registrations: true }
          }
        }
      }),
      db.event.count({ where }),
    ]);

    return {
      success: true,
      data: {
        hackathons: events.map((evt) => ({
          id: evt.id,
          name: evt.name,
          organization: evt.organization.name,
          state: evt.state,
          tracksCount: evt._count.hackathonTracks,
          teamsCount: evt._count.teams,
          registrationsCount: evt._count.registrations,
          startAt: evt.startAt.toISOString(),
        })),
        total,
        pageCount: Math.ceil(total / pageSize),
      },
    };
  } catch (error: any) {
    console.error("Failed to fetch hackathons:", error);
    return {
      success: false,
      error: "Failed to load hackathons",
    };
  }
}

export async function createHackathon(formData: FormData) {
  try {
    const data = {
      name: formData.get("name") as string,
      slug: formData.get("slug") as string,
      startAt: formData.get("startAt") as string,
      endAt: formData.get("endAt") as string,
      summary: formData.get("summary") as string,
    };
    const imageFile = formData.get("imageFile") as File | null;
    let imageUrl = formData.get("imageUrl") as string | null;
    
    // New fields
    const prizePool = formData.get("prizePool") as string;
    const hackersCount = formData.get("hackersCount") as string;
    const codingHours = formData.get("codingHours") as string;
    const innerImageFile = formData.get("innerImageFile") as File | null;
    let innerImageUrl: string | null = null;

    async function uploadFile(file: File | null, prefix: string) {
      if (!file || file.size === 0) return null;
      const fileExt = file.name.split('.').pop();
      const fileName = `${data.slug}-${prefix}-${Date.now()}.${fileExt}`;
      const { error } = await supabase.storage.from('event').upload(fileName, file, { cacheControl: '3600', upsert: false });
      if (error) throw new Error(`Failed to upload ${prefix}: ` + error.message);
      return supabase.storage.from('event').getPublicUrl(fileName).data.publicUrl;
    }

    if (imageFile && imageFile.size > 0) {
      imageUrl = await uploadFile(imageFile, 'poster');
    }

    const aboutFileUrl = await uploadFile(formData.get("aboutFile") as File | null, 'about');
    const scheduleFileUrl = await uploadFile(formData.get("scheduleFile") as File | null, 'schedule');
    const markingSchemeFileUrl = await uploadFile(formData.get("markingSchemeFile") as File | null, 'markingScheme');
    const aboutText = formData.get("aboutText") as string;

    // Handle Inner Image Upload
    if (innerImageFile && innerImageFile.size > 0) {
      const fileExt = innerImageFile.name.split('.').pop();
      const fileName = `${data.slug}-inner-${Date.now()}.${fileExt}`;
      
      const { data: uploadData, error: uploadError } = await supabase
        .storage
        .from('event')
        .upload(fileName, innerImageFile, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        throw new Error("Failed to upload inner image: " + uploadError.message);
      }

      const { data: publicUrlData } = supabase.storage.from('event').getPublicUrl(fileName);
      innerImageUrl = publicUrlData.publicUrl;
    }

    const org = await db.organization.findFirst();
    if (!org) throw new Error("No organization found");
    const admin = await db.user.findFirst();
    
    // Find or Create Hackathon Category specifically
    let category = await db.eventCategory.findFirst({
      where: { name: { equals: "Hackathon", mode: "insensitive" } }
    });

    if (!category) {
      category = await db.eventCategory.create({
        data: {
          name: "Hackathon",
          slug: "hackathon",
          organizationId: org.id,
        }
      });
    }

    const event = await db.event.create({
      data: {
        name: data.name,
        slug: data.slug,
        categoryId: category.id,
        imageUrl: imageUrl,
        startAt: new Date(data.startAt).toISOString(),
        endAt: new Date(data.endAt).toISOString(),
        summary: data.summary,
        state: "PUBLISHED",
        visibility: "PUBLIC",
        organizationId: org.id,
        createdBy: admin?.id || undefined,
        settings: { 
          create: { 
            allowTeams: true,
            metadata: {
              prizePool,
              hackersCount,
              codingHours,
              innerImageUrl,
              ...(aboutFileUrl && { aboutFileUrl }),
              ...(scheduleFileUrl && { scheduleFileUrl }),
              ...(markingSchemeFileUrl && { markingSchemeFileUrl }),
              ...(aboutText && { aboutText })
            }
          } 
        },
      },
    });
    
    await db.eventTimeline.create({
      data: {
        eventId: event.id,
        action: "HACKATHON_CREATED",
        message: "Hackathon was created in Draft state",
        actorId: admin?.id || undefined,
      }
    });

    return { success: true, data: event.id };
  } catch (error: any) {
    console.error("Failed to create hackathon:", error);
    if (error.code === 'P2002') {
      return { success: false, error: "A Hackathon with this Slug already exists." };
    }
    return { success: false, error: error.message || "Failed to create hackathon" };
  }
}

export async function updateHackathon(id: string, formData: FormData) {
  try {
    const data = {
      name: formData.get("name") as string,
      slug: formData.get("slug") as string,
      startAt: formData.get("startAt") as string,
      endAt: formData.get("endAt") as string,
      summary: formData.get("summary") as string,
    };
    const imageFile = formData.get("imageFile") as File | null;
    let imageUrl = formData.get("imageUrl") as string | null;
    
    // New fields
    const prizePool = formData.get("prizePool") as string;
    const hackersCount = formData.get("hackersCount") as string;
    const codingHours = formData.get("codingHours") as string;
    const innerImageFile = formData.get("innerImageFile") as File | null;
    let innerImageUrl: string | null = null;

    async function uploadFile(file: File | null, prefix: string) {
      if (!file || file.size === 0) return null;
      const fileExt = file.name.split('.').pop();
      const fileName = `${data.slug}-${prefix}-edit-${Date.now()}.${fileExt}`;
      const { error } = await supabase.storage.from('event').upload(fileName, file, { cacheControl: '3600', upsert: false });
      if (error) throw new Error(`Failed to upload ${prefix}: ` + error.message);
      return supabase.storage.from('event').getPublicUrl(fileName).data.publicUrl;
    }

    if (imageFile && imageFile.size > 0) {
      imageUrl = await uploadFile(imageFile, 'poster');
    }

    const aboutFileUrl = await uploadFile(formData.get("aboutFile") as File | null, 'about');
    const scheduleFileUrl = await uploadFile(formData.get("scheduleFile") as File | null, 'schedule');
    const markingSchemeFileUrl = await uploadFile(formData.get("markingSchemeFile") as File | null, 'markingScheme');
    const aboutText = formData.get("aboutText") as string;

    // Handle Inner Image Upload
    if (innerImageFile && innerImageFile.size > 0) {
      const fileExt = innerImageFile.name.split('.').pop();
      const fileName = `${data.slug}-inner-edit-${Date.now()}.${fileExt}`;
      
      const { data: uploadData, error: uploadError } = await supabase
        .storage
        .from('event')
        .upload(fileName, innerImageFile, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        throw new Error("Failed to upload inner image: " + uploadError.message);
      }

      const { data: publicUrlData } = supabase.storage.from('event').getPublicUrl(fileName);
      innerImageUrl = publicUrlData.publicUrl;
    }

    const eventToUpdate = await db.event.findUnique({
      where: { id },
      include: { settings: true }
    });
    
    if (!eventToUpdate) throw new Error("Hackathon not found");

    const updateData: any = {
      name: data.name,
      slug: data.slug,
      startAt: new Date(data.startAt).toISOString(),
      endAt: new Date(data.endAt).toISOString(),
      summary: data.summary,
    };

    if (imageUrl) {
      updateData.imageUrl = imageUrl;
    }

    const currentMetadata = (eventToUpdate.settings?.metadata as any) || {};
    const newMetadata = {
      ...currentMetadata,
      prizePool,
      hackersCount,
      codingHours,
      ...(innerImageUrl && { innerImageUrl }),
      ...(aboutFileUrl && { aboutFileUrl }),
      ...(scheduleFileUrl && { scheduleFileUrl }),
      ...(markingSchemeFileUrl && { markingSchemeFileUrl }),
      ...(aboutText && { aboutText })
    };

    const event = await db.event.update({
      where: { id },
      data: {
        ...updateData,
        settings: {
          update: {
            metadata: newMetadata
          }
        }
      }
    });

    return { success: true, data: event.id };
  } catch (error: any) {
    console.error("Failed to update hackathon:", error);
    if (error.code === 'P2002') {
      return { success: false, error: "A Hackathon with this Slug already exists." };
    }
    return { success: false, error: error.message || "Failed to update hackathon" };
  }
}

