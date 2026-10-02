"use server";

import { db } from "@project-organizer/sdk";
import { Prisma } from "@prisma/client";

export async function getPayments(params: {
  page?: number;
  pageSize?: number;
  search?: string;
}) {
  try {
    const page = params.page || 1;
    const pageSize = params.pageSize || 10;
    const skip = (page - 1) * pageSize;

    const where: Prisma.PaymentWhereInput = {};

    if (params.search) {
      where.OR = [
        { publicId: { contains: params.search, mode: "insensitive" } },
        { providerTransactionId: { contains: params.search, mode: "insensitive" } },
        { user: { email: { contains: params.search, mode: "insensitive" } } },
      ];
    }

    const [payments, total, totalRevenueAgg] = await Promise.all([
      db.payment.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: "desc" },
        include: {
          user: true,
          event: true,
          organization: true,
        },
      }),
      db.payment.count({ where }),
      db.payment.aggregate({
        where: { status: "COMPLETED" },
        _sum: { amount: true },
      })
    ]);

    return {
      success: true,
      data: {
        payments: payments.map((payment) => ({
          id: payment.id,
          publicId: payment.publicId,
          amount: payment.amount,
          currency: payment.currency,
          status: payment.status,
          provider: payment.provider,
          providerTransactionId: payment.providerTransactionId,
          userEmail: payment.user?.email || "Guest Checkout",
          userName: payment.user ? `${payment.user.firstName} ${payment.user.lastName || ''}`.trim() : "Guest",
          eventName: payment.event?.name || "General/Donation",
          organizationName: payment.organization.name,
          createdAt: payment.createdAt.toISOString(),
        })),
        total,
        pageCount: Math.ceil(total / pageSize),
        totalRevenue: totalRevenueAgg._sum.amount || 0,
      },
    };
  } catch (error: any) {
    console.error("Failed to fetch payments:", error);
    return {
      success: false,
      error: "Failed to load payments",
    };
  }
}
