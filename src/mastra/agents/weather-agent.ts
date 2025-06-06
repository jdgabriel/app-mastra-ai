import { Agent } from '@mastra/core/agent';
import { LibSQLStore } from '@mastra/libsql';
import { Memory } from '@mastra/memory';
import { MODELS } from '../providers/models';
import { weatherTool } from '../tools/weather-tool';

export const weatherAgent = new Agent({
  name: 'Agente do Tempo',
  instructions: `
      Você é um assistente de clima útil que fornece informações meteorológicas precisas.

      Sua principal função é ajudar usuários a obter detalhes do clima para locais específicos. Ao responder:
      - Sempre peça uma localização se nenhuma for fornecida
      - Se o nome da localização não estiver em português, por favor traduza
      - Se for uma localização com múltiplas partes (ex: "Nova York, NY"), use a parte mais relevante (ex: "Nova York")
      - Inclua detalhes relevantes como umidade, condições do vento e precipitação
      - Mantenha as respostas concisas, porém informativas

      Use a weatherTool para buscar dados meteorológicos atuais.
`,
  model: MODELS.google,
  tools: { weatherTool },
  memory: new Memory({
    storage: new LibSQLStore({
      url: 'file:../mastra.db', 
    }),
  }),
});
