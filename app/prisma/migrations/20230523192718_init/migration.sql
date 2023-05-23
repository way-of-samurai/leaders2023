-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "postgis";

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE');

-- CreateEnum
CREATE TYPE "LocationType" AS ENUM ('DISTRICT', 'AREA', 'METRO');

-- CreateEnum
CREATE TYPE "GroupType" AS ENUM ('ONLINE', 'OFFLINE');

-- CreateEnum
CREATE TYPE "PeriodType" AS ENUM ('ACTIVE', 'CLOSED', 'PLANNED');

-- CreateEnum
CREATE TYPE "DayOfWeek" AS ENUM ('MONDAY', 'TUESDAY', 'WENDSDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY');

-- CreateTable
CREATE TABLE "Location" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "type" "LocationType" NOT NULL,
    "name" TEXT NOT NULL,
    "point" geometry(Point, 4326) NOT NULL,

    CONSTRAINT "Location_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "externalId" INTEGER,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "middleName" TEXT,
    "gender" "Gender",
    "birthdate" DATE NOT NULL,
    "address" TEXT,
    "address_point" geometry(Point, 4326),
    "quizPassed" BOOLEAN NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Category" (
    "id" SERIAL NOT NULL,
    "externalId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "level" SMALLINT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "parentId" INTEGER,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Group" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "externalId" INTEGER NOT NULL,
    "type" "GroupType" NOT NULL,
    "address" TEXT NOT NULL,
    "district" TEXT,
    "areaId" INTEGER,
    "address_point" geometry(Point, 4326) NOT NULL,

    CONSTRAINT "Group_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Timetable" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "groupId" INTEGER NOT NULL,
    "type" "PeriodType" NOT NULL,
    "dateStart" DATE NOT NULL,
    "dateEnd" DATE NOT NULL,
    "dow" "DayOfWeek" NOT NULL,
    "timeStart" TIME(0) NOT NULL,
    "timeEnd" TIME(0) NOT NULL,

    CONSTRAINT "Timetable_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CategoriesOnGroups" (
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "groupId" INTEGER NOT NULL,
    "categoryId" INTEGER NOT NULL,

    CONSTRAINT "CategoriesOnGroups_pkey" PRIMARY KEY ("groupId","categoryId")
);

-- CreateTable
CREATE TABLE "Question" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "order" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "Question_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuestionOption" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "order" INTEGER NOT NULL,
    "questionId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "QuestionOption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuestionAnswer" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "questionId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "checked" INTEGER[],

    CONSTRAINT "QuestionAnswer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Attend" (
    "id" SERIAL NOT NULL,
    "externalActivityId" INTEGER NOT NULL,
    "externalGroupId" INTEGER NOT NULL,
    "externalUserId" INTEGER NOT NULL,
    "categoryId" INTEGER NOT NULL,
    "type" "GroupType" NOT NULL,
    "date" DATE NOT NULL,
    "timeStart" TIME(0) NOT NULL,
    "timeEnd" TIME(0) NOT NULL,

    CONSTRAINT "Attend_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "location_point_idx" ON "Location" USING GIST ("point");

-- CreateIndex
CREATE INDEX "User_externalId_idx" ON "User"("externalId");

-- CreateIndex
CREATE INDEX "user_address_point_idx" ON "User" USING GIST ("address_point");

-- CreateIndex
CREATE UNIQUE INDEX "User_firstName_lastName_middleName_birthdate_key" ON "User"("firstName", "lastName", "middleName", "birthdate");

-- CreateIndex
CREATE INDEX "Category_externalId_idx" ON "Category"("externalId");

-- CreateIndex
CREATE UNIQUE INDEX "Category_level_name_key" ON "Category"("level", "name");

-- CreateIndex
CREATE INDEX "Group_externalId_idx" ON "Group"("externalId");

-- CreateIndex
CREATE INDEX "group_address_point_idx" ON "Group" USING GIST ("address_point");

-- CreateIndex
CREATE UNIQUE INDEX "Timetable_groupId_type_dateStart_dateEnd_dow_timeStart_time_key" ON "Timetable"("groupId", "type", "dateStart", "dateEnd", "dow", "timeStart", "timeEnd");

-- CreateIndex
CREATE INDEX "Attend_externalActivityId_idx" ON "Attend"("externalActivityId");

-- CreateIndex
CREATE INDEX "Attend_externalGroupId_idx" ON "Attend"("externalGroupId");

-- CreateIndex
CREATE INDEX "Attend_externalUserId_idx" ON "Attend"("externalUserId");

-- CreateIndex
CREATE INDEX "Attend_externalActivityId_externalGroupId_externalUserId_idx" ON "Attend"("externalActivityId", "externalGroupId", "externalUserId");

-- AddForeignKey
ALTER TABLE "Category" ADD CONSTRAINT "Category_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Group" ADD CONSTRAINT "Group_areaId_fkey" FOREIGN KEY ("areaId") REFERENCES "Location"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Timetable" ADD CONSTRAINT "Timetable_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CategoriesOnGroups" ADD CONSTRAINT "CategoriesOnGroups_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CategoriesOnGroups" ADD CONSTRAINT "CategoriesOnGroups_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestionOption" ADD CONSTRAINT "QuestionOption_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestionAnswer" ADD CONSTRAINT "QuestionAnswer_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestionAnswer" ADD CONSTRAINT "QuestionAnswer_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attend" ADD CONSTRAINT "Attend_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
