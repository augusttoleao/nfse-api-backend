# Setup e Execução do Backend NFSe Nacional

## Pré-requisitos

- Node.js 14+
- npm ou yarn
- Certificado digital em formato PFX
- OpenSSL (para extrair certificado)

## Instalação Inicial

### 1. Instalar Dependências

```bash
cd /home/ubuntu/nfse-api-backend
npm install
```

### 2. Preparar Certificado Digital

Se você tiver um certificado PFX, extraia os arquivos PEM:

```bash
# Extrair certificado
openssl pkcs12 -in seu_certificado.pfx -passin pass:SENHA -out cert.pem -nokeys -nodes -legacy

# Extrair chave privada
openssl pkcs12 -in seu_certificado.pfx -passin pass:SENHA -out key.pem -nocerts -nodes -legacy

# Mover para pasta de certificados
mv cert.pem certs/
mv key.pem certs/
```

### 3. Configurar Variáveis de Ambiente

Edite o arquivo `.env`:

```env
PORT=3000
NODE_ENV=development

NFSE_API_BASE_URL=https://www.nfse.gov.br/EmissorNacional
NFSE_CERT_PATH=./certs/COOPERCLIM_00766728000129.pfx
NFSE_CERT_PASSWORD=sua_senha_aqui

EMITTER_CNPJ=seu_cnpj
EMITTER_INSCRICAO_MUNICIPAL=sua_inscricao

CORS_ORIGIN=*
```

## Execução

### Iniciar o Servidor

```bash
npm start
```

O servidor iniciará na porta 3000 (ou a porta configurada em `.env`).

**Saída esperada:**
```
╔════════════════════════════════════════════════════════════╗
║         NFSe Nacional API Backend                          ║
║                                                            ║
║  Servidor iniciado com sucesso!                           ║
║  Porta: 3000                                                ║
║  Ambiente: development                                      ║
║  URL: http://localhost:3000                               ║
║                                                            ║
║  Endpoints disponíveis:                                   ║
║  - GET  /health                                           ║
║  - GET  /api/notas/emitidas                               ║
║  - GET  /api/notas/recebidas                              ║
║  - GET  /api/notas/:numeroNota                            ║
╚════════════════════════════════════════════════════════════╝
```

### Modo Desenvolvimento

Para desenvolvimento com auto-reload, instale nodemon:

```bash
npm install --save-dev nodemon
```

Adicione ao `package.json`:

```json
{
  "scripts": {
    "dev": "nodemon index.js"
  }
}
```

Execute com:

```bash
npm run dev
```

## Teste de Conectividade

### 1. Health Check

```bash
curl http://localhost:3000/health
```

### 2. Consultar Notas Emitidas

```bash
curl "http://localhost:3000/api/notas/emitidas?dataInicio=2026-01-01&dataFim=2026-01-31"
```

### 3. Usando Postman ou Insomnia

Importe os endpoints:

```
GET http://localhost:3000/health
GET http://localhost:3000/api/notas/emitidas?dataInicio=2026-01-01&dataFim=2026-01-31
GET http://localhost:3000/api/notas/recebidas?dataInicio=2026-01-01&dataFim=2026-01-31
GET http://localhost:3000/api/notas/123456
```

## Troubleshooting

### Erro: "Certificado não encontrado"

Verifique se os arquivos `cert.pem` e `key.pem` existem em `certs/`:

```bash
ls -la certs/
```

### Erro: "Porta já em uso"

Altere a porta em `.env`:

```env
PORT=3001
```

### Erro: "Nenhuma resposta recebida"

Verifique:
1. Conectividade com a internet
2. Se a API NFSe Nacional está disponível
3. Se o certificado é válido

### Logs de Debug

Verifique os logs do servidor:

```bash
tail -f server.log
```

## Estrutura do Projeto

```
nfse-api-backend/
├── src/
│   ├── config/
│   │   ├── certificate.js      # Gerenciador de certificado
│   │   └── httpClient.js       # Cliente HTTP
│   ├── controllers/
│   │   └── notasController.js  # Controllers
│   ├── services/
│   │   └── notasService.js     # Lógica de negócio
│   ├── routes/
│   │   └── notasRoutes.js      # Rotas
│   ├── middleware/
│   │   └── errorHandler.js     # Tratamento de erros
│   └── app.js                  # Configuração da app
├── certs/
│   ├── cert.pem                # Certificado (PEM)
│   └── key.pem                 # Chave privada (PEM)
├── .env                        # Variáveis de ambiente
├── .gitignore                  # Arquivos ignorados
├── index.js                    # Ponto de entrada
├── package.json                # Dependências
├── README.md                   # Documentação
├── SETUP.md                    # Este arquivo
└── INTEGRACAO_NFSE.md          # Guia de integração
```

## Próximos Passos

1. Confirmar fluxo de autenticação com API NFSe Nacional
2. Implementar autenticação (se necessário)
3. Testar com dados reais
4. Implementar emissão de notas
5. Adicionar testes automatizados
6. Deploy em produção

## Suporte

Para dúvidas, consulte:
- `README.md` - Documentação geral
- `INTEGRACAO_NFSE.md` - Guia de integração
- Logs do servidor em `server.log`
