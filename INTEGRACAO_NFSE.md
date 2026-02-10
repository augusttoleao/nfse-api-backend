# Guia de Integração com API NFSe Nacional

## Status Atual

O backend Node.js foi criado com sucesso e consegue se conectar à API NFSe Nacional usando o certificado digital. Porém, a API requer autenticação adicional além do certificado.

## Problemas Identificados

A API NFSe Nacional retorna uma página HTML de login quando acessada, indicando que é necessário:

1. **Autenticação via Formulário**: A API pode exigir um login com usuário e senha
2. **Cookies de Sessão**: Manter cookies de sessão entre requisições
3. **CSRF Token**: Validação de token CSRF para requisições POST

## Próximas Etapas

### 1. Investigar o Fluxo de Autenticação

Você mencionou que usa a **API FocusNFe** para emissão. A API NFSe Nacional pode ter um fluxo diferente:

- **Acesso via Certificado Digital**: Pode ser necessário acessar `/EmissorNacional/Certificado` primeiro
- **Acesso via Usuário/Senha**: Pode exigir login em `/EmissorNacional/Acesso`
- **Acesso via GovBR**: Integração com o portal GovBR

### 2. Implementar Gerenciamento de Sessão

O backend precisa:

```javascript
// Adicionar suporte a cookies
const cookieJar = new CookieJar();

// Manter sessão entre requisições
const sessionToken = await authenticateWithCertificate();

// Usar token em requisições subsequentes
const headers = {
  'Authorization': `Bearer ${sessionToken}`,
  'Cookie': cookieJar.getCookies()
};
```

### 3. Implementar Autenticação

Opções de autenticação:

**Opção A: Certificado Digital (Recomendado)**
```javascript
// Acessar endpoint de autenticação com certificado
POST /EmissorNacional/Certificado
Headers: {
  'X-Client-Cert': certificateData
}
```

**Opção B: Usuário e Senha**
```javascript
// Fazer login com credenciais
POST /EmissorNacional/Acesso/Login
Body: {
  usuario: 'seu_usuario',
  senha: 'sua_senha'
}
```

**Opção C: GovBR**
```javascript
// Integrar com portal GovBR para autenticação
```

## Estrutura Atual do Backend

### Arquivos Principais

| Arquivo | Descrição |
|---------|-----------|
| `src/config/certificate.js` | Gerenciador de certificado digital (PEM) |
| `src/config/httpClient.js` | Cliente HTTP com suporte a certificado |
| `src/services/notasService.js` | Lógica de negócio para notas fiscais |
| `src/controllers/notasController.js` | Controllers das rotas HTTP |
| `src/routes/notasRoutes.js` | Definição de rotas |
| `certs/cert.pem` | Certificado em formato PEM |
| `certs/key.pem` | Chave privada em formato PEM |

### Endpoints Disponíveis

```
GET  /health                    - Verifica saúde do servidor
GET  /api/notas/emitidas        - Consulta notas emitidas
GET  /api/notas/recebidas       - Consulta notas recebidas
GET  /api/notas/:numeroNota     - Detalhes de uma nota específica
```

## Configuração Necessária

### Variáveis de Ambiente (.env)

```env
PORT=3000
NODE_ENV=development

# NFSe API Configuration
NFSE_API_BASE_URL=https://www.nfse.gov.br/EmissorNacional
NFSE_CERT_PATH=./certs/COOPERCLIM_00766728000129.pfx
NFSE_CERT_PASSWORD=Coop08081995

# Emitter Data
EMITTER_CNPJ=00766728000129
EMITTER_INSCRICAO_MUNICIPAL=7165801

# Authentication (se necessário)
NFSE_USERNAME=seu_usuario
NFSE_PASSWORD=sua_senha

# CORS
CORS_ORIGIN=*
```

## Teste de Conectividade

### Health Check

```bash
curl http://localhost:3000/health
```

**Resposta esperada:**
```json
{
  "status": "ok",
  "timestamp": "2026-02-10T00:19:01.137Z",
  "environment": "development"
}
```

### Consultar Notas Emitidas

```bash
curl "http://localhost:3000/api/notas/emitidas?dataInicio=2026-01-01&dataFim=2026-01-31"
```

## Próximos Passos Recomendados

1. **Confirmar Fluxo de Autenticação**: Qual é o método de autenticação esperado pela API NFSe Nacional?
   - Certificado digital apenas?
   - Usuário e senha?
   - Token de acesso?

2. **Implementar Autenticação**: Uma vez confirmado, implementar o fluxo de autenticação

3. **Testar com Dados Reais**: Validar se as consultas retornam dados corretos

4. **Implementar Emissão**: Adicionar endpoints para emissão de notas fiscais

5. **Adicionar Cancelamento**: Implementar cancelamento de notas

6. **Documentação Swagger**: Gerar documentação interativa da API

## Referências

- [Portal NFSe Nacional](https://www.nfse.gov.br/)
- [Documentação da API](https://www.nfse.gov.br/EmissorNacional)
- [Certificados Digitais - RFB](http://idg.receita.fazenda.gov.br/orientacao/tributaria/senhas-e-procuracoes/senhas/certificados-digitais)

## Suporte

Para dúvidas sobre a integração, consulte:
- Documentação oficial da API NFSe Nacional
- Equipe de suporte da Receita Federal
- Documentação do seu certificado digital
