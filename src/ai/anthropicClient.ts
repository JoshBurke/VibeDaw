import { buildPrompt, type PromptMode } from './promptTemplates';
import type { Song, Track } from '../types';

const API_URL = import.meta.env.DEV ? '/api/anthropic' : 'https://api.anthropic.com/v1/messages';
const MODEL = 'claude-sonnet-4-20250514';

/**
 * Calls the Anthropic Messages API with the generated prompt.
 */
export async function callAnthropic(
  song: Song,
  mode: PromptMode,
  targetTrack?: Track,
  userPrompt?: string,
): Promise<string> {
  let prompt = buildPrompt(song, mode, targetTrack);
  if (userPrompt) {
    prompt += `\nUSER_REQUEST: ${userPrompt}`;
  }

  const body = {
    model: MODEL,
    max_tokens: 512,
    temperature: 0.7,
    messages: [
      { role: 'user', content: prompt },
    ],
  };

  const res = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ((import.meta as any).env?.ANTHROPIC_API_KEY || (globalThis as any).ANTHROPIC_API_KEY || '') as string,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Anthropic API error ${res.status}: ${text}`);
  }

  const data = await res.json();
  // Data shape: { content: [...], ... }
  const messageContent: string = (data?.content?.[0]?.text) ?? '';
  return messageContent.trim();
}

// ---------------- Response parsing helpers ----------------

export type InstrumentSpecResponse = {
  name: string;
  instrumentType: 'sampler' | 'synthesizer';
  settings: any; // Could narrow further
};

export type SequenceSpecResponse = {
  notes: any[]; // Could map to Note interface
};

export type TrackSpecResponse = {
  name: string;
  instrumentType: 'sampler' | 'synthesizer';
  settings: any;
  sequence: any[];
};

export const parseJSONFromResponse = <T>(raw: string): T => {
  // The model is asked to output raw JSON, but we guard against ```
  const cleaned = raw.trim().replace(/^```[a-z]*\n?|```$/g, '');
  return JSON.parse(cleaned) as T;
}; 