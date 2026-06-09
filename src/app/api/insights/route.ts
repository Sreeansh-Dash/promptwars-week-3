import { NextResponse } from 'next/server';
import Groq from 'groq-sdk';
import { CarbonData, GroqResponse } from '../../../types';

export async function POST(request: Request) {
  try {
    const body: CarbonData = await request.json();

    const groq = new Groq({
      apiKey: process.env.GROQ_API_KEY,
    });

    const systemPrompt = `You are an expert environmental consultant. 
Given the user's weekly carbon metrics (Transportation, Energy, Diet, Waste), return a highly personalized and actionable list of 3 steps they can take to reduce their footprint.
You must return ONLY a minified JSON array of objects conforming exactly to this structure:
[
  {
    "title": "Action Title",
    "description": "Why and how to do it.",
    "co2SavedKg": 10
  }
]
No markdown wrapping. No explanations. Only the raw minified JSON array.`;

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: JSON.stringify(body) },
      ],
      model: 'llama3-8b-8192',
      temperature: 0.7,
      max_tokens: 500,
    });

    const content = chatCompletion.choices[0]?.message?.content || "[]";
    let insights;
    try {
      insights = JSON.parse(content);
    } catch (parseError) {
      console.warn("Failed to parse Groq response, falling back.", content);
      insights = [
        { title: "Turn off lights", description: "Save energy when not in the room.", co2SavedKg: 5 }
      ];
    }

    return NextResponse.json({ insights });
  } catch (error) {
    console.error("Failed to generate insights with Groq", error);
    // Graceful fallback if API key is missing or rate limited
    return NextResponse.json({ 
      insights: [
        { title: "Walk or bike short distances", description: "Replace one short car trip.", co2SavedKg: 3 },
        { title: "Reduce meat consumption", description: "Try one meatless meal today.", co2SavedKg: 10 },
        { title: "Unplug idle electronics", description: "Vampire power draws footprint.", co2SavedKg: 2 }
      ] 
    }, { status: 200 }); // Returning 200 so the frontend still gracefully handles the fallback
  }
}
