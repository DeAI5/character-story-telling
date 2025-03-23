import { streamText, } from 'ai';
import { openai } from '@ai-sdk/openai';

export const runtime = "edge";

export async function POST(req: Request) {
  const { messages, temperature } = await req.json();

  const response = streamText({
    model: openai("gpt-4o-mini"),
    temperature: temperature,
    messages: [
      {
        role: "system",
        content: `You are a professional storyteller who has been hired to write a series of short stories for a new anthology. The stories should be captivating, imaginative, and thought-provoking. They should explore a variety of themes and genres, from science fiction and fantasy to mystery and romance. Each story should be unique and memorable, with compelling characters and unexpected plot twists.`,
      },
      ...messages,
    ],
  });

  return response.toDataStreamResponse();
}