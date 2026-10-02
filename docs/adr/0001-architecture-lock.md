# 1. Architecture Lock & Monorepo Setup

Date: 2026-07-26

## Status
Approved

## Context
We are building an enterprise-grade SaaS event management platform (IITR Tech Fest / SIH level). The platform must support multi-tenancy, dynamic forms, advanced rule engines, and separate IAM policies.

## Decision
1. **Monorepo:** Adopt Turborepo with Next.js (frontend/admin/landing) and NestJS (API/Worker).
2. **Database:** PostgreSQL via Prisma, supporting soft deletes (`deletedAt`) and multi-tenancy (`organizationId`).
3. **Queue & Background Jobs:** BullMQ + Redis for a separated worker service (Notifications, QR Generation, Ranking).
4. **IAM:** A dedicated package for Identity & Access Management supporting roles, fine-grained permissions, and future SSO integrations.
5. **Form Engine:** A dynamic form builder architecture leveraging generic field tables.

## Consequences
- Requires strict adherence to the monorepo structure.
- All backend business logic is centralized in NestJS APIs and Workers.
- Types and validation logic (Zod) must be shared via internal packages (`@repo/types`, `@repo/validation`).
