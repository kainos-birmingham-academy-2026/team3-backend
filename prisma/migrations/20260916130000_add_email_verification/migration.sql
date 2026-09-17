ALTER TABLE "User"
ADD COLUMN "emailVerified" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN "verificationCodeHash" TEXT,
ADD COLUMN "verificationCodeExpiresAt" TIMESTAMP(3);

ALTER TABLE "User" ALTER COLUMN "emailVerified" SET DEFAULT false;
