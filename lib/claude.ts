export const MODEL = 'claude-sonnet-4-6';

export async function getAnthropic() {
  const { default: Anthropic } = await import('@anthropic-ai/sdk');
  return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });
}
