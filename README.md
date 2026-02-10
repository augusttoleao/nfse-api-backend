# NFSe Nacional API Backend

Backend Node.js estruturado para integração com a API NFSe Nacional, utilizando certificado digital para autenticação.

## Características

- **Autenticação via Certificado Digital**: Suporte completo para certificados PFX
- **Arquitetura em Camadas**: Separação clara entre controllers, services e configuração
- **Segurança**: Implementação de CORS, Helmet e validação de entrada
- **Logging**: Rastreamento de requisições e respostas
- **Tratamento de Erros**: Middleware centralizado para tratamento de exceções
- **Variáveis de Ambiente**: Configuração via arquivo .env

## Estrutura do Projeto

```
nfse-api-backend/
├── src/
│   ├── config/
│   │   ├── certificate.js      # Gerenciador de certificado digital
│   │   └── httpClient.js       # Cliente HTTP com certificado
│   ├── controllers/
│   │   └── notasController.js  # Controller de notas fiscais
│   ├── services/
│   │   └── notasService.js     # Lógica de negócio
│   ├── routes/
│   │   └── notasRoutes.js      # Definição de rotas
│   ├── middleware/
│   │   └── errorHandler.js     # Tratamento de erros
│   └── app.js                  # Configuração da aplicação
├── certs/
│   └── COOPERCLIM_00766728000129.pfx  # Certificado digital
├── .env                        # Variáveis de ambiente
├── index.js                    # Ponto de entrada
├── package.json                # Dependências
└── README.md                   # Este arquivo
```

## Instalação

### Pré-requisitos

- Node.js 14+
- npm ou yarn
- Certificado digital em formato PFX

### Passos

1. **Instalar dependências**:
   ```bash
   npm install
   ```

2. **Configurar variáveis de ambiente**:
   Edite o arquivo `.env` com suas credenciais:
   ```env
   PORT=3000
   NODE_ENV=development
   
   NFSE_API_BASE_URL=https://www.nfse.gov.br/EmissorNacional
   NFSE_CERT_PATH=./certs/COOPERCLIM_00766728000129.pfx
   NFSE_CERT_PASSWORD=sua_senha_aqui
   
   EMITTER_CNPJ=00766728000129
   EMITTER_INSCRICAO_MUNICIPAL=7165801
   ```

3. **Garantir que o certificado está no diretório correto**:
   ```bash
   ls -la certs/
   ```

## Uso

### Iniciar o servidor

```bash
npm start
```

O servidor iniciará na porta configurada (padrão: 3000).

### Endpoints Disponíveis

#### Health Check
```
GET /health
```

Retorna o status do servidor.

**Resposta**:
```json
{
  "status": "ok",
  "timestamp": "2026-02-09T19:30:00.000Z",
  "environment": "development"
}
```

#### Consultar Notas Emitidas
```
GET /api/notas/emitidas?dataInicio=2026-01-01&dataFim=2026-01-31&pagina=1&itensPorPagina=50
```

**Parâmetros de Query**:
- `dataInicio` (opcional): Data inicial no formato YYYY-MM-DD
- `dataFim` (opcional): Data final no formato YYYY-MM-DD
- `pagina` (opcional): Número da página (padrão: 1)
- `itensPorPagina` (opcional): Itens por página (padrão: 50)

**Resposta**:
```json
{
  "success": true,
  "data": {
    "notas": [...],
    "total": 10,
    "pagina": 1
  },
  "message": "Notas emitidas consultadas com sucesso"
}
```

#### Consultar Notas Recebidas
```
GET /api/notas/recebidas?dataInicio=2026-01-01&dataFim=2026-01-31&pagina=1&itensPorPagina=50
```

**Parâmetros de Query**:
- `dataInicio` (opcional): Data inicial no formato YYYY-MM-DD
- `dataFim` (opcional): Data final no formato YYYY-MM-DD
- `pagina` (opcional): Número da página (padrão: 1)
- `itensPorPagina` (opcional): Itens por página (padrão: 50)

**Resposta**:
```json
{
  "success": true,
  "data": {
    "notas": [...],
    "total": 5,
    "pagina": 1
  },
  "message": "Notas recebidas consultadas com sucesso"
}
```

#### Consultar Detalhes de uma Nota
```
GET /api/notas/123456
```

**Parâmetros de Path**:
- `numeroNota`: Número da nota fiscal

**Resposta**:
```json
{
  "success": true,
  "data": {
    "numero": 123456,
    "data_emissao": "2026-01-15",
    "valor": 1000.00,
    ...
  },
  "message": "Detalhes da nota consultados com sucesso"
}
```

## Tratamento de Erros

Todos os erros retornam um objeto JSON padronizado:

```json
{
  "success": false,
  "message": "Descrição do erro",
  "error": "Detalhes técnicos (apenas em desenvolvimento)"
}
```

**Códigos de Status HTTP**:
- `200`: Sucesso
- `400`: Requisição inválida
- `404`: Recurso não encontrado
- `500`: Erro interno do servidor

## Configuração de Segurança

### Certificado Digital

O certificado digital é carregado automaticamente na inicialização. O arquivo deve estar em formato PFX e a senha deve ser configurada no arquivo `.env`.

**Segurança**:
- Nunca compartilhe a senha do certificado
- Mantenha o arquivo PFX seguro
- Use variáveis de ambiente para credenciais sensíveis

### CORS

Configure o CORS editando a variável `CORS_ORIGIN` no `.env`:

```env
CORS_ORIGIN=http://localhost:3000,https://seu-dominio.com
```

## Desenvolvimento

### Variáveis de Ambiente para Desenvolvimento

```env
NODE_ENV=development
PORT=3000
```

### Logging

O servidor registra todas as requisições e respostas no console:

```
[2026-02-09T19:30:00.000Z] GET /api/notas/emitidas
[2026-02-09T19:30:00.000Z] Status: 200
```

## Troubleshooting

### Erro: "Certificado não encontrado"

Verifique se o arquivo PFX está no diretório `certs/` e se o caminho em `.env` está correto.

### Erro: "Senha do certificado incorreta"

Verifique se a senha configurada em `NFSE_CERT_PASSWORD` está correta.

### Erro: "Nenhuma resposta recebida"

Verifique a conectividade com a API NFSe Nacional e se o certificado está válido.

## Próximos Passos

- Implementar emissão de notas fiscais
- Adicionar cancelamento de notas
- Implementar autenticação de usuários
- Adicionar testes unitários
- Implementar cache de respostas
- Adicionar documentação Swagger/OpenAPI

## Licença

ISC

## Suporte

Para dúvidas ou problemas, entre em contato com a equipe de desenvolvimento.
