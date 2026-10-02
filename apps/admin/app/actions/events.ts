"use server";

import { db } from "@project-organizer/sdk";
import { Prisma } from "@prisma/client";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase Client for Storage
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function getEvents(params: {
  page?: number;
  pageSize?: number;
  search?: string;
  state?: string;
  category?: string;
}) {
  try {
    const page = params.page || 1;
    const pageSize = params.pageSize || 10;
    const skip = (page - 1) * pageSize;

    const where: Prisma.EventWhereInput = {
      isDeleted: false,
    };

    if (params.search) {
      where.OR = [
        { name: { contains: params.search, mode: "insensitive" } },
        { summary: { contains: params.search, mode: "insensitive" } },
      ];
    }

    if (params.state) {
      where.state = params.state as any;
    }

    if (params.category) {
      where.category = {
        name: { contains: params.category, mode: "insensitive" }
      };
    }

    const [events, total] = await Promise.all([
      db.event.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: "desc" },
        include: {
          category: true,
          organization: true,
          _count: {
            select: { registrations: true }
          }
        },
      }),
      db.event.count({ where }),
    ]);

    return {
      success: true,
      data: {
        events: events.map((event) => {
          const now = new Date();
          let computedStatus = "Upcoming";
          if (now > event.endAt) computedStatus = "Completed";
          else if (now >= event.startAt && now <= event.endAt) computedStatus = "Live";
          
          return {
            id: event.id,
            name: event.name,
            state: event.state,
            visibility: event.visibility,
            startAt: event.startAt.toISOString(),
            endAt: event.endAt.toISOString(),
            date: `${event.startAt.toLocaleDateString('en-US', { month: 'short', day: '2-digit' })} - ${event.endAt.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}`,
            category: event.category?.name || "Event",
            organizer: event.organization?.name || "System",
            participants: event._count?.registrations || 0,
            status: computedStatus
          };
        }),
        total,
        pageCount: Math.ceil(total / pageSize),
      },
    };
  } catch (error) {
    console.error("Failed to fetch events:", error);
    return {
      success: false,
      error: "Failed to load events",
    };
  }
}

export async function createEvent(formData: FormData) {
  try {
    const data = {
      name: formData.get("name") as string,
      slug: formData.get("slug") as string,
      categoryName: formData.get("categoryName") as string,
      startAt: formData.get("startAt") as string,
      endAt: formData.get("endAt") as string,
      summary: formData.get("summary") as string,
      capacity: Number(formData.get("capacity")) || 0,
    };
    const imageFile = formData.get("imageFile") as File | null;
    let imageUrl = formData.get("imageUrl") as string | null;

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

    const newMetadata = {
      ...(aboutFileUrl && { aboutFileUrl }),
      ...(scheduleFileUrl && { scheduleFileUrl }),
      ...(markingSchemeFileUrl && { markingSchemeFileUrl }),
      ...(aboutText && { aboutText }),
    };

    const org = await db.organization.findFirst();
    if (!org) throw new Error("No organization found");
    const admin = await db.user.findFirst();
    
    // Find or Create Category
    let category = await db.eventCategory.findFirst({
      where: { name: { equals: data.categoryName, mode: "insensitive" } }
    });

    if (!category) {
      category = await db.eventCategory.create({
        data: {
          name: data.categoryName,
          slug: data.categoryName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
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
        capacity: data.capacity,
        state: "DRAFT",
        organizationId: org.id,
        createdBy: admin?.id || undefined,
        settings: { 
          create: {
            metadata: newMetadata
          } 
        },
      },
    });
    
    // Add timeline entry to mimic domain logic
    await db.eventTimeline.create({
      data: {
        eventId: event.id,
        action: "EVENT_CREATED",
        message: "Event was created in Draft state",
        actorId: admin?.id || undefined,
      }
    });

    return { success: true, data: event.id };
  } catch (error: any) {
    console.error("Failed to create event:", error);
    if (error.code === 'P2002') {
      return { success: false, error: "An event with this Slug already exists." };
    }
    return { success: false, error: error.message || "Failed to create event" };
  }
}

export async function toggleEventVisibility(eventId: string, currentVisibility: string) {
  try {
    const newVisibility = currentVisibility === "PUBLIC" ? "PRIVATE" : "PUBLIC";
    
    await db.event.update({
      where: { id: eventId },
      data: { visibility: newVisibility as any }
    });

    return { success: true, visibility: newVisibility };
  } catch (error) {
    console.error("Failed to toggle visibility:", error);
    return { success: false, error: "Failed to update visibility" };
  }
}

export async function toggleEventState(eventId: string, currentState: string) {
  try {
    const newState = currentState === "PUBLISHED" ? "DRAFT" : "PUBLISHED";
    
    await db.event.update({
      where: { id: eventId },
      data: { state: newState as any }
    });

    return { success: true, state: newState };
  } catch (error) {
    console.error("Failed to toggle state:", error);
    return { success: false, error: "Failed to update state" };
  }
}

export async function getEventById(id: string) {
  try {
    const event = await db.event.findUnique({
      where: { id },
      include: {
        category: true,
        settings: true
      }
    });
    
    if (!event) return { success: false, error: "Event not found" };
    
    return { success: true, data: event };
  } catch (error) {
    console.error("Failed to fetch event:", error);
    return { success: false, error: "Failed to load event" };
  }
}

export async function updateEvent(id: string, formData: FormData) {
  try {
    const data = {
      name: formData.get("name") as string,
      slug: formData.get("slug") as string,
      categoryName: formData.get("categoryName") as string,
      startAt: formData.get("startAt") as string,
      endAt: formData.get("endAt") as string,
      summary: formData.get("summary") as string,
      capacity: Number(formData.get("capacity")) || 0,
    };
    const imageFile = formData.get("imageFile") as File | null;
    let imageUrl = formData.get("imageUrl") as string | null;

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

    let category = await db.eventCategory.findFirst({
      where: { name: { equals: data.categoryName, mode: "insensitive" } }
    });

    if (!category) {
      const org = await db.organization.findFirst();
      if (!org) throw new Error("No organization found");
      category = await db.eventCategory.create({
        data: {
          name: data.categoryName,
          slug: data.categoryName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          organizationId: org.id,
        }
      });
    }

    const updateData: any = {
      name: data.name,
      slug: data.slug,
      categoryId: category.id,
      startAt: new Date(data.startAt).toISOString(),
      endAt: new Date(data.endAt).toISOString(),
      summary: data.summary,
      capacity: data.capacity,
    };

    if (imageUrl) {
      updateData.imageUrl = imageUrl;
    }

    // We need to fetch existing settings to merge metadata
    const existingEvent = await db.event.findUnique({
      where: { id },
      include: { settings: true }
    });

    const existingMetadata = existingEvent?.settings?.metadata ? (existingEvent.settings.metadata as any) : {};

    const mergedMetadata = {
      ...existingMetadata,
      ...(aboutFileUrl && { aboutFileUrl }),
      ...(scheduleFileUrl && { scheduleFileUrl }),
      ...(markingSchemeFileUrl && { markingSchemeFileUrl }),
      ...(aboutText && { aboutText }),
    };

    const event = await db.event.update({
      where: { id },
      data: {
        ...updateData,
        settings: {
          upsert: {
            create: { metadata: mergedMetadata },
            update: { metadata: mergedMetadata }
          }
        }
      }
    });

    return { success: true, data: event.id };
  } catch (error: any) {
    console.error("Failed to update event:", error);
    if (error.code === 'P2002') {
      return { success: false, error: "An event with this Slug already exists." };
    }
    return { success: false, error: error.message || "Failed to update event" };
  }
}

