import OpenAI from "openai";

const openai = new OpenAI({
  baseURL: "http://127.0.0.1:5000/v1",
  apiKey: "dummy-key", // Required by the client but not used with custom baseURL
});

export const runtime = 'edge';

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    console.log('Received messages:', messages);

    if (!messages || !Array.isArray(messages)) {
      console.error('Invalid messages format:', messages);
      return new Response(
        JSON.stringify({ error: 'Invalid messages format' }), 
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: 'system',
          content: `You are a professional storyteller who has been hired to write a series of short stories for a new anthology. The stories should be captivating, imaginative, and thought-provoking. They should explore a variety of themes and genres, from science fiction and fantasy to mystery and romance. Each story should be unique and memorable, with compelling characters and unexpected plot twists.`,
        },
        ...messages,
      ],
    });

    console.log('Received completion:', completion);

    // Return the response in the format the frontend expects
    return new Response(
      JSON.stringify({
        choices: [{
          message: {
            content: completion.choices[0].message.content
          }
        }]
      }), 
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Detailed error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to generate story',
        details: error instanceof Error ? error.message : 'Unknown error'
      }), 
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
}
