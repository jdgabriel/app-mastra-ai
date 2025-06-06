import { Agent } from '@mastra/core/agent';
import { createStep, createWorkflow } from '@mastra/core/workflows';
import { z } from 'zod';
import { MODELS } from '../providers/models';

const agent = new Agent({
  name: 'Agente do Tempo',
  model: MODELS.google,
  instructions: `
        Você é um especialista local em atividades e viagens que se destaca em planejamento baseado no clima. Analise os dados meteorológicos e forneça recomendações práticas de atividades.

        Para cada dia da previsão, estruture sua resposta exatamente como segue:

        📅 [Dia da semana, Dia Mês, Ano]\n
        ═══════════════════════════

        🌡️ RESUMO DO CLIMA
        • Condições: [breve descrição]
        • Temperatura: [X°C/Y°F até A°C/B°F]
        • Precipitação: [X% de chance]

        🌅 ATIVIDADES PELA MANHÃ
        Ao ar livre:
        • [Nome da Atividade] - [Breve descrição incluindo local específico/rota]
          Melhor horário: [faixa de horário específica]
          Observação: [consideração relevante sobre o clima]

        🌞 ATIVIDADES À TARDE
        Ao ar livre:
        • [Nome da Atividade] - [Breve descrição incluindo local específico/rota]
          Melhor horário: [faixa de horário específica]
          Observação: [consideração relevante sobre o clima]

        🏠 ALTERNATIVAS EM AMBIENTE FECHADO
        • [Nome da Atividade] - [Breve descrição incluindo local/estabelecimento específico]
          Ideal para: [condição climática que indicaria esta alternativa]

        ⚠️ CONSIDERAÇÕES ESPECIAIS
        • [Quaisquer alertas meteorológicos relevantes, índice UV, condições de vento, etc.]

        Diretrizes:
        - Sugira 2-3 atividades ao ar livre com horários específicos por dia
        - Inclua 1-2 opções de backup em ambientes fechados
        - Para precipitação >50%, comece com atividades em ambientes fechados
        - Todas as atividades devem ser específicas para o local
        - Inclua locais, trilhas ou estabelecimentos específicos
        - Considere a intensidade da atividade de acordo com a temperatura
        - Mantenha as descrições concisas, porém informativas

        Mantenha exatamente este formato e a formatação para consistência, usando os emojis e cabeçalhos de seção conforme mostrado.
      `,
});

const forecastSchema = z.object({
  date: z.string(),
  maxTemp: z.number(),
  minTemp: z.number(),
  precipitationChance: z.number(),
  condition: z.string(),
  location: z.string(),
});

function getWeatherCondition(code: number): string {
  const conditions: Record<number, string> = {
    0: 'Clear sky',
    1: 'Mainly clear',
    2: 'Partly cloudy',
    3: 'Overcast',
    45: 'Foggy',
    48: 'Depositing rime fog',
    51: 'Light drizzle',
    53: 'Moderate drizzle',
    55: 'Dense drizzle',
    61: 'Slight rain',
    63: 'Moderate rain',
    65: 'Heavy rain',
    71: 'Slight snow fall',
    73: 'Moderate snow fall',
    75: 'Heavy snow fall',
    95: 'Thunderstorm',
  };
  return conditions[code] || 'Unknown';
}

const fetchWeather = createStep({
  id: 'fetch-weather',
  description: 'Busca a previsão do tempo para uma determinada cidade',
  inputSchema: z.object({
    city: z.string().describe('A cidade para obter a previsão do tempo'),
  }),
  outputSchema: forecastSchema,
  execute: async ({ inputData }) => {
    if (!inputData) {
      throw new Error('Input data not found');
    }

    const geocodingUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(inputData.city)}&count=1`;
    const geocodingResponse = await fetch(geocodingUrl);
    const geocodingData = (await geocodingResponse.json()) as {
      results: { latitude: number; longitude: number; name: string }[];
    };

    if (!geocodingData.results?.[0]) {
      throw new Error(`Location '${inputData.city}' not found`);
    }

    const { latitude, longitude, name } = geocodingData.results[0];

    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=precipitation,weathercode&timezone=auto,&hourly=precipitation_probability,temperature_2m`;
    const response = await fetch(weatherUrl);
    const data = (await response.json()) as {
      current: {
        time: string;
        precipitation: number;
        weathercode: number;
      };
      hourly: {
        precipitation_probability: number[];
        temperature_2m: number[];
      };
    };

    const forecast = {
      date: new Date().toISOString(),
      maxTemp: Math.max(...data.hourly.temperature_2m),
      minTemp: Math.min(...data.hourly.temperature_2m),
      condition: getWeatherCondition(data.current.weathercode),
      precipitationChance: data.hourly.precipitation_probability.reduce(
        (acc, curr) => Math.max(acc, curr),
        0,
      ),
      location: name,
    };

    return forecast;
  },
});

const planActivities = createStep({
  id: 'plan-activities',
  description: 'Sugere atividades com base nas condições meteorológicas',
  inputSchema: forecastSchema,
  outputSchema: z.object({
    activities: z.string(),
  }),
  execute: async ({ inputData }) => {
    const forecast = inputData;

    if (!forecast) {
      throw new Error('Forecast data not found');
    }

    const prompt = `Based on the following weather forecast for ${forecast.location}, suggest appropriate activities:
      ${JSON.stringify(forecast, null, 2)}
      `;

    const response = await agent.stream([
      {
        role: 'user',
        content: prompt,
      },
    ]);

    let activitiesText = '';

    for await (const chunk of response.textStream) {
      process.stdout.write(chunk);
      activitiesText += chunk;
    }

    return {
      activities: activitiesText,
    };
  },
});

const weatherWorkflow = createWorkflow({
  id: 'weather-workflow',
  inputSchema: z.object({
    city: z.string().describe('A cidade para obter a previsão do tempo'),
  }),
  outputSchema: z.object({
    activities: z.string(),
  }),
})
  .then(fetchWeather)
  .then(planActivities);

weatherWorkflow.commit();

export { weatherWorkflow };
