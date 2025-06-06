# Mastra AI Weather Agent

Este projeto é um exemplo de aplicação utilizando o framework Mastra AI para criar agentes e workflows de previsão do tempo e sugestões de atividades baseadas no clima.

## Sumário

- [Visão Geral](#visão-geral)
- [Requisitos](#requisitos)
- [Instalação](#instalação)
- [Configuração](#configuração)
- [Como Usar](#como-usar)
- [APIs Disponíveis](#apis-disponíveis)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Personalidade de IA](#personalidade-da-ia)
- [Licença](#licença)

---

## Visão Geral

O projeto implementa um agente chamado **Agente do Tempo** que responde a perguntas sobre o clima e sugere atividades personalizadas para o local e condições meteorológicas informadas. Utiliza modelos da Google e integra ferramentas para buscar dados meteorológicos em tempo real.

## Requisitos

- Node.js >= 20.9.0
- pnpm >= 9.7.1
- Banco de dados SQLite (ou LibSQL)

## Instalação

Clone o repositório e instale as dependências:
```sh
pnpm install
```

## Configuração

1. Copie o arquivo de exemplo de variáveis de ambiente:
   ```sh
   cp .env.exemple .env
   ```
2. Edite o arquivo `.env` conforme necessário para configurar chaves de API, banco de dados, etc.

## Como Usar

### Ambiente de Desenvolvimento

Para iniciar o servidor em modo desenvolvimento:
```sh
pnpm dev
```

### Build e Produção

Para gerar o build:
```sh
pnpm build
```

Para iniciar em desenvolvimento:
```sh
pnpm dev
```

O servidor estará disponível em `http://localhost:4111`.

## APIs Disponíveis

A aplicação expõe endpoints RESTful para interação com agentes, workflows e ferramentas. Alguns exemplos:

- `POST /api/agents/:agentId` — Executa o agente com uma mensagem do usuário.
- `POST /api/workflows/weather-workflow` — Executa o workflow de previsão do tempo.
- `GET /openapi.json` — Documentação OpenAPI da API.
- `GET /swagger-ui` — Interface Swagger para testar a API.

### Exemplo de Requisição

```http
POST /api/workflows/weather-workflow
Content-Type: application/json

{
  "city": "São Paulo"
}
```

#### Resposta Esperada

```json
{
  "activities": "📅 Segunda-feira, 10 Junho, 2024\n═══════════════════════════\n🌡️ RESUMO DO CLIMA\n..."
}
```

## Estrutura do Projeto

```
src/
  mastra/
    agents/
      weather-agent.ts      # Definição do agente de clima
    tools/
      weather-tool.ts       # Ferramenta para buscar dados meteorológicos
    workflows/
      weather-workflow.ts   # Workflow de previsão e sugestão de atividades
    providers/
      models.ts             # Configuração dos modelos de IA
```

## Personalidade da IA

- **Agente:** Edite [`src/mastra/agents/weather-agent.ts`](src/mastra/agents/weather-agent.ts) para alterar o comportamento ou instruções do agente.
- **Workflow:** Modifique [`src/mastra/workflows/weather-workflow.ts`](src/mastra/workflows/weather-workflow.ts) para mudar o fluxo de execução ou o formato das respostas.
- **Ferramentas:** Adicione ou altere ferramentas em [`src/mastra/tools/`](src/mastra/tools/).

