-- Migration: 001_init
-- Created: 2024-01-01

-- Create enums
DO $$ BEGIN
    CREATE TYPE "LicenseType" AS ENUM ('ONE_TIME', 'SUBSCRIPTION');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "LicenseStatus" AS ENUM ('ACTIVE', 'REVOKED', 'EXPIRED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create tables
CREATE TABLE IF NOT EXISTS "License" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "key" TEXT NOT NULL,
    "type" "LicenseType" NOT NULL DEFAULT 'ONE_TIME',
    "status" "LicenseStatus" NOT NULL DEFAULT 'ACTIVE',
    "maxActivations" INTEGER NOT NULL DEFAULT 2,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),
    "note" TEXT,
    CONSTRAINT "License_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "Activation" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "licenseId" UUID NOT NULL,
    "hwid" TEXT NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "osInfo" TEXT,
    "appVersion" TEXT,
    "activatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Activation_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "Admin" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "username" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "lastLoginAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Admin_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "AuditLog" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "action" TEXT NOT NULL,
    "details" JSONB NOT NULL,
    "ip" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- Create indexes
CREATE UNIQUE INDEX IF NOT EXISTS "License_key_key" ON "License"("key");
CREATE INDEX IF NOT EXISTS "License_status_idx" ON "License"("status");
CREATE INDEX IF NOT EXISTS "License_key_idx" ON "License"("key");

CREATE UNIQUE INDEX IF NOT EXISTS "Activation_licenseId_hwid_key" ON "Activation"("licenseId", "hwid");
CREATE INDEX IF NOT EXISTS "Activation_licenseId_idx" ON "Activation"("licenseId");
CREATE INDEX IF NOT EXISTS "Activation_hwid_idx" ON "Activation"("hwid");

CREATE UNIQUE INDEX IF NOT EXISTS "Admin_username_key" ON "Admin"("username");
CREATE INDEX IF NOT EXISTS "Admin_username_idx" ON "Admin"("username");

CREATE INDEX IF NOT EXISTS "AuditLog_action_idx" ON "AuditLog"("action");
CREATE INDEX IF NOT EXISTS "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");

-- Add foreign keys
ALTER TABLE "Activation" ADD CONSTRAINT "Activation_licenseId_fkey" 
    FOREIGN KEY ("licenseId") REFERENCES "License"("id") ON DELETE CASCADE ON UPDATE CASCADE;
