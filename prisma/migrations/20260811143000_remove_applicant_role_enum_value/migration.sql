-- Recreate enum without legacy APPLICANT value
ALTER TYPE "UserRole" RENAME TO "UserRole_old";

CREATE TYPE "UserRole" AS ENUM ('RECRUITMENT_ADMIN', 'USER');

ALTER TABLE "User" ALTER COLUMN "role" DROP DEFAULT;

ALTER TABLE "User"
ALTER COLUMN "role" TYPE "UserRole"
USING (
	CASE
		WHEN "role"::text = 'APPLICANT' THEN 'USER'
		ELSE "role"::text
	END
)::"UserRole";

ALTER TABLE "User" ALTER COLUMN "role" SET DEFAULT 'USER';

DROP TYPE "UserRole_old";
