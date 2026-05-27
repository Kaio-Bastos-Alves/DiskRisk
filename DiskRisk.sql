-- 1. Criação do Banco de Dados (opcional, caso você já não tenha um)
CREATE DATABASE DiskRisk;
GO

USE DiskRisk;
GO

---

-- 2. Criação da Tabela de Usuários
CREATE TABLE Usuarios (
    Id INT IDENTITY(1,1) NOT NULL, -- Incremento automático para o ID
    Nome VARCHAR(100) NOT NULL,
    Email VARCHAR(150) NOT NULL,
    Senha VARCHAR(255) NOT NULL,    -- Tamanho maior pensando em armazenamento de senhas criptografadas (Hash)
    CEP CHAR(8) NOT NULL,           -- CHAR(8) é ideal para armazenar apenas os 8 números do CEP
    CPF CHAR(11) NULL,              -- Permitindo valor NULL conforme solicitado
    FotoPerfil NVARCHAR(MAX) NULL,   -- Armazena a URL da foto ou Base64

    -- Definição das Restrições (Constraints)
    CONSTRAINT PK_Usuarios PRIMARY KEY (Id),
    CONSTRAINT UQ_Usuarios_Email UNIQUE (Email), -- Evita e-mails duplicados
    CONSTRAINT UQ_Usuarios_CPF UNIQUE (CPF)      -- Evita CPFs duplicados (quando preenchido)
);
GO


-- 3. Criação da Tabela de Denúncias
CREATE TABLE Denuncias (
    Id INT IDENTITY(1,1) NOT NULL,
    UsuarioId INT NOT NULL,                     -- Vincula a denúncia ao usuário que a criou
    CEP CHAR(8) NOT NULL,                       -- CHAR(8) é ideal para armazenar apenas os 8 números do CEP
    StatusDenuncia VARCHAR(20) NOT NULL,
    TipoDenuncia VARCHAR(50) NOT NULL,          -- Ex: Assalto, Vandalismo, Iluminação pública
    NivelRisco VARCHAR(20) NOT NULL,            -- Ex: Baixo, Médio, Alto
    DataCriacao DATETIME DEFAULT GETDATE(),     -- Registra automaticamente a data/hora da denúncia
    Descricao VARCHAR (200) NOT NULL,
    FotoDenuncia NVARCHAR(MAX) NULL,

    -- Definição das Restrições (Constraints)
    CONSTRAINT PK_Denuncias PRIMARY KEY (Id),
    CONSTRAINT FK_Denuncias_Usuarios FOREIGN KEY (UsuarioId) REFERENCES Usuarios(Id) ON DELETE CASCADE
    -- ON DELETE CASCADE garante que se um usuário for deletado, as denúncias dele também serão apagadas.
);
GO

-- 2. Criação da Tabela de Governos
CREATE TABLE Instituicao (
    Id INT IDENTITY(1,1) NOT NULL, -- Incremento automático para o ID
    Nome VARCHAR(100) NOT NULL,
    Email VARCHAR(150) NOT NULL,
    Senha VARCHAR(255) NOT NULL,    -- Tamanho maior pensando em armazenamento de senhas criptografadas (Hash)
    CEP CHAR(8) NOT NULL,           -- CHAR(8) é ideal para armazenar apenas os 8 números do CEP
    CPF CHAR(11) NULL,              -- Permitindo valor NULL conforme solicitado
    FotoPerfil NVARCHAR(MAX) NULL,   -- Armazena a URL da foto ou Base64

    -- Definição das Restrições (Constraints)
    CONSTRAINT PK_Instituicao PRIMARY KEY (Id),
    CONSTRAINT UQ_Instituicao_Email UNIQUE (Email), -- Evita e-mails duplicados
    CONSTRAINT UQ_Instituicao_CPF UNIQUE (CPF)      -- Evita CPFs duplicados (quando preenchido)
);