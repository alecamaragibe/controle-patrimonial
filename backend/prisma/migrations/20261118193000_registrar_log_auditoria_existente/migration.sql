
-- Registrar a estrutura da tabela de auditoria já existente.
-- Esta migração será marcada como aplicada, sem executar este SQL
-- sobre o banco que já possui a tabela.

CREATE TABLE "log_auditoria" (
    "id" SERIAL NOT NULL,
    "usuario_id" INTEGER,
    "usuario_nome" TEXT NOT NULL,
    "data_hora" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "acao" TEXT NOT NULL,
    "detalhes" TEXT NOT NULL,

    CONSTRAINT "log_auditoria_pkey" PRIMARY KEY ("id")
);
