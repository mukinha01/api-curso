-- CreateTable
CREATE TABLE "instrutor" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "curso" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "titulo" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "instrutor_id" INTEGER NOT NULL,
    CONSTRAINT "curso_instrutor_id_fkey" FOREIGN KEY ("instrutor_id") REFERENCES "instrutor" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "instrutor_email_key" ON "instrutor"("email");

-- CreateIndex
CREATE INDEX "curso_instrutor_id_idx" ON "curso"("instrutor_id");
