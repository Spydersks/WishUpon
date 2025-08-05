'use server';
/**
 * @fileOverview Suggests messages for a recipient.
 *
 * - suggestMessages - A function that suggests messages.
 * - SuggestMessagesInput - The input type for the suggestMessages function.
 * - SuggestMessagesOutput - The return type for the suggestMessages function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestMessagesInputSchema = z.object({
  recipientName: z.string().describe('The name of the recipient.'),
});
export type SuggestMessagesInput = z.infer<typeof SuggestMessagesInputSchema>;

const SuggestMessagesOutputSchema = z.object({
  suggestions: z.array(z.string()).describe('A list of 20 message suggestions.'),
});
export type SuggestMessagesOutput = z.infer<typeof SuggestMessagesOutputSchema>;

export async function suggestMessages(input: SuggestMessagesInput): Promise<SuggestMessagesOutput> {
  return suggestMessagesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestMessagesPrompt',
  input: {schema: SuggestMessagesInputSchema},
  output: {schema: SuggestMessagesOutputSchema},
  prompt: `You are an expert in writing heartfelt messages.
Generate a list of 20 diverse and creative birthday messages for {{{recipientName}}}.
The messages should be suitable for a variety of relationships (friend, family, partner, colleague).
Include a mix of funny, sweet, and inspiring messages.
Make sure to include relevant emojis in each message.
Keep them concise and ready to be sent via text.`,
});

const suggestMessagesFlow = ai.defineFlow(
  {
    name: 'suggestMessagesFlow',
    inputSchema: SuggestMessagesInputSchema,
    outputSchema: SuggestMessagesOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    return output!;
  }
);
