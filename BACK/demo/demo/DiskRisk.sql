-- 1. Cria��o do Banco de Dados (opcional, caso voc� j� n�o tenha um)
CREATE DATABASE DiskRisk;
GO

USE DiskRisk;
GO

---

-- 2. Cria��o da Tabela de Usu�rios
CREATE TABLE Usuarios (
    Id INT IDENTITY(1,1) NOT NULL, -- Incremento autom�tico para o ID
    Nome VARCHAR(100) NOT NULL,
    Email VARCHAR(150) NOT NULL,
    Senha VARCHAR(255) NOT NULL,    -- Tamanho maior pensando em armazenamento de senhas criptografadas (Hash)
    CEP CHAR(8) NOT NULL,           -- CHAR(8) � ideal para armazenar apenas os 8 n�meros do CEP
    CPF CHAR(11) NULL,              -- Permitindo valor NULL conforme solicitado
    FotoPerfil NVARCHAR(MAX) NULL,   -- Armazena a URL da foto ou Base64

    -- Defini��o das Restri��es (Constraints)
    CONSTRAINT PK_Usuarios PRIMARY KEY (Id),
    CONSTRAINT UQ_Usuarios_Email UNIQUE (Email), -- Evita e-mails duplicados
    CONSTRAINT UQ_Usuarios_CPF UNIQUE (CPF)      -- Evita CPFs duplicados (quando preenchido)
);
GO


-- 3. Cria��o da Tabela de Den�ncias
CREATE TABLE Denuncias (
    Id INT IDENTITY(1,1) NOT NULL,
    UsuarioId INT NOT NULL,                     -- Vincula a den�ncia ao usu�rio que a criou
    CEP CHAR(8) NOT NULL,                       -- CHAR(8) � ideal para armazenar apenas os 8 n�meros do CEP
    StatusDenuncia VARCHAR(20) NOT NULL,
    TipoDenuncia VARCHAR(50) NOT NULL,          -- Ex: Assalto, Vandalismo, Ilumina��o p�blica
    NivelRisco VARCHAR(20) NOT NULL,            -- Ex: Baixo, M�dio, Alto
    DataCriacao DATETIME DEFAULT GETDATE(),     -- Registra automaticamente a data/hora da den�ncia
    Descricao VARCHAR (200) NOT NULL,
    FotoDenuncia NVARCHAR(MAX) NULL,

    -- Defini��o das Restri��es (Constraints)
    CONSTRAINT PK_Denuncias PRIMARY KEY (Id),
    CONSTRAINT FK_Denuncias_Usuarios FOREIGN KEY (UsuarioId) REFERENCES Usuarios(Id) ON DELETE CASCADE
    -- ON DELETE CASCADE garante que se um usu�rio for deletado, as den�ncias dele tamb�m ser�o apagadas.
);
GO

-- 2. Cria��o da Tabela de Governos
CREATE TABLE Instituicao (
    Id INT IDENTITY(1,1) NOT NULL, -- Incremento autom�tico para o ID
    Nome VARCHAR(100) NOT NULL,
    Email VARCHAR(150) NOT NULL,
    Senha VARCHAR(255) NOT NULL,    -- Tamanho maior pensando em armazenamento de senhas criptografadas (Hash)
    CEP CHAR(8) NOT NULL,           -- CHAR(8) � ideal para armazenar apenas os 8 n�meros do CEP
    CPF CHAR(11) NULL,              -- Permitindo valor NULL conforme solicitado
    FotoPerfil NVARCHAR(MAX) NULL,   -- Armazena a URL da foto ou Base64

    -- Defini��o das Restri��es (Constraints)
    CONSTRAINT PK_Instituicao PRIMARY KEY (Id),
    CONSTRAINT UQ_Instituicao_Email UNIQUE (Email), -- Evita e-mails duplicados
    CONSTRAINT UQ_Instituicao_CPF UNIQUE (CPF)      -- Evita CPFs duplicados (quando preenchido)
);