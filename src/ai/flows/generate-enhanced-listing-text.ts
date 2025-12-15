'use server';

/**
 * @fileOverview A flow that uses AI to refine the listing text of a product listing.
 *
 * - generateEnhancedListingText - A function that handles the listing text refinement process.
 * - GenerateEnhancedListingTextInput - The input type for the generateEnhancedListingText function.
 * - GenerateEnhancedListingTextOutput - The return type for the generateEnhancedListingText function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateEnhancedListingTextInputSchema = z.object({
  bookTitle: z.string().describe('The title of the book.'),
  bookDescription: z.string().describe('The current description of the book.'),
  targetAudience: z.string().optional().describe('The target audience for the book.'),
});

export type GenerateEnhancedListingTextInput = z.infer<
  typeof GenerateEnhancedListingTextInputSchema
>;

const GenerateEnhancedListingTextOutputSchema = z.object({
  enhancedListingText: z.string().describe('The refined listing text for the book.'),
});

export type GenerateEnhancedListingTextOutput = z.infer<
  typeof GenerateEnhancedListingTextOutputSchema
>;

export async function generateEnhancedListingText(
  input: GenerateEnhancedListingTextInput
): Promise<GenerateEnhancedListingTextOutput> {
  return generateEnhancedListingTextFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateEnhancedListingTextPrompt',
  input: {schema: GenerateEnhancedListingTextInputSchema},
  output: {schema: GenerateEnhancedListingTextOutputSchema},
  prompt: `You are an expert copywriter specializing in writing compelling product listings for books. Given the following information about a book, refine the book description to make it more appealing to potential buyers.

Book Title: {{{bookTitle}}}
Current Description: {{{bookDescription}}}
Target Audience (if available): {{{targetAudience}}}

Refined Listing Text:`, // Handlebars syntax
});

const generateEnhancedListingTextFlow = ai.defineFlow(
  {
    name: 'generateEnhancedListingTextFlow',
    inputSchema: GenerateEnhancedListingTextInputSchema,
    outputSchema: GenerateEnhancedListingTextOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
