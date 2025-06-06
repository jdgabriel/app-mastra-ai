import { google } from '@ai-sdk/google'
import { openai } from '@ai-sdk/openai'

export const MODELS = {
  google: google('gemini-2.0-flash'),
  openai: openai('gpt-4o-mini')
}