-- CreateTable
CREATE TABLE "solicitacoes_patrimonio" (
    "id" SERIAL NOT NULL,
    "tipo" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDENTE',
    "gestorId" INTEGER NOT NULL,
    "administradorId" INTEGER,
    "patrimonioId" INTEGER,
    "dadosSolicitados" JSONB,
    "justificativaSolicitante" TEXT,
    "justificativaAdmin" TEXT,
    "dataSolicitacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dataDecisao" TIMESTAMP(3),

    CONSTRAINT "solicitacoes_patrimonio_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "solicitacoes_patrimonio" ADD CONSTRAINT "solicitacoes_patrimonio_gestorId_fkey" FOREIGN KEY ("gestorId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "solicitacoes_patrimonio" ADD CONSTRAINT "solicitacoes_patrimonio_administradorId_fkey" FOREIGN KEY ("administradorId") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "solicitacoes_patrimonio" ADD CONSTRAINT "solicitacoes_patrimonio_patrimonioId_fkey" FOREIGN KEY ("patrimonioId") REFERENCES "Patrimonio"("id") ON DELETE SET NULL ON UPDATE CASCADE;
