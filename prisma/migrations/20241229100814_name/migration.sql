/*
  Warnings:

  - You are about to drop the column `title` on the `UserCreateRecipe` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_UserCreateRecipe" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL DEFAULT 'Untitled Recipe',
    "thumbnail" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "ingredients" TEXT NOT NULL,
    "instructions" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdById" TEXT NOT NULL,
    CONSTRAINT "UserCreateRecipe_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_UserCreateRecipe" ("createdAt", "createdById", "description", "id", "ingredients", "instructions", "thumbnail") SELECT "createdAt", "createdById", "description", "id", "ingredients", "instructions", "thumbnail" FROM "UserCreateRecipe";
DROP TABLE "UserCreateRecipe";
ALTER TABLE "new_UserCreateRecipe" RENAME TO "UserCreateRecipe";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
