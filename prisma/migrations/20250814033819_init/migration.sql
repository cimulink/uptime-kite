-- CreateEnum
CREATE TYPE "public"."MonitorType" AS ENUM ('http', 'cron');

-- CreateEnum
CREATE TYPE "public"."MonitorStatus" AS ENUM ('up', 'down', 'pending', 'paused');

-- CreateEnum
CREATE TYPE "public"."AlertType" AS ENUM ('sms', 'slack');

-- CreateTable
CREATE TABLE "public"."User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "stripe_customer_id" TEXT,
    "plan" TEXT NOT NULL DEFAULT 'free',

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Monitor" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "public"."MonitorType" NOT NULL,
    "target" TEXT NOT NULL,
    "interval_seconds" INTEGER NOT NULL,
    "status" "public"."MonitorStatus" NOT NULL,
    "last_checked_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Monitor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CheckResult" (
    "id" BIGSERIAL NOT NULL,
    "monitor_id" TEXT NOT NULL,
    "status_code" INTEGER,
    "response_time_ms" INTEGER,
    "was_successful" BOOLEAN NOT NULL,
    "error_message" TEXT,
    "checked_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CheckResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."AlertIntegration" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "type" "public"."AlertType" NOT NULL,
    "target" TEXT NOT NULL,
    "is_verified" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "AlertIntegration_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");

-- AddForeignKey
ALTER TABLE "public"."Monitor" ADD CONSTRAINT "Monitor_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CheckResult" ADD CONSTRAINT "CheckResult_monitor_id_fkey" FOREIGN KEY ("monitor_id") REFERENCES "public"."Monitor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AlertIntegration" ADD CONSTRAINT "AlertIntegration_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
