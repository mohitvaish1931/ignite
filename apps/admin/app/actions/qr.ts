"use server";

import { db } from "@project-organizer/sdk";
import { Prisma } from "@prisma/client";

export async function getCheckinLogs(params: {
  page?: number;
  pageSize?: number;
  search?: string;
}) {
  try {
    const page = params.page || 1;
    const pageSize = params.pageSize || 10;
    const skip = (page - 1) * pageSize;

    const where: Prisma.ScanLogWhereInput = {};

    if (params.search) {
      where.OR = [
        { qrCode: { publicId: { contains: params.search, mode: "insensitive" } } },
        { scanner: { name: { contains: params.search, mode: "insensitive" } } },
      ];
    }

    const [logs, total, successCount, failedCount] = await Promise.all([
      db.scanLog.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: "desc" },
        include: {
          scanner: true,
          event: true,
          qrCode: true,
        }
      }),
      db.scanLog.count({ where }),
      db.scanLog.count({ where: { result: "SUCCESS" } }),
      db.scanLog.count({ where: { result: { not: "SUCCESS" } } })
    ]);

    return {
      success: true,
      data: {
        logs: logs.map((log) => ({
          id: log.id,
          scannerName: log.scanner.name,
          eventName: log.event.name,
          qrType: log.qrCode.type,
          scanType: log.scanType,
          result: log.result,
          failureReason: log.failureReason || "-",
          createdAt: log.createdAt.toISOString(),
        })),
        total,
        pageCount: Math.ceil(total / pageSize),
        stats: {
          totalScans: total,
          successCount,
          failedCount
        }
      },
    };
  } catch (error: any) {
    console.error("Failed to fetch check-in logs:", error);
    return {
      success: false,
      error: "Failed to load check-in logs",
    };
  }
}

export async function provisionScanner(name: string) {
  try {
    const org = await db.organization.findFirst();
    if (!org) throw new Error("No organization found to link the scanner");

    const scanner = await db.scannerDevice.create({
      data: {
        organizationId: org.id,
        name,
        status: "ACTIVE"
      }
    });

    return { success: true, scanner };
  } catch (error: any) {
    console.error("Failed to provision scanner:", error);
    return { success: false, error: "Failed to provision scanner" };
  }
}
