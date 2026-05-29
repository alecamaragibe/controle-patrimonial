-- CreateTable
CREATE TABLE "Patrimonio" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "patrimonio" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "localizacao" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Patrimonio_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Patrimonio_patrimonio_key" ON "Patrimonio"("patrimonio");
