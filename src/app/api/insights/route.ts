import { NextResponse } from 'next/server';
import { carbonDataSchema } from '../../../core/validation/validation';
import { groq, buildPredictivePrompt } from '../../../infrastructure/ai/groqClient';

const FALLBACK_INSIGHTS = `### Carbon Footprint Trajectory & Insights

Based on your current logged metrics, here is a localized, predictive footprint assessment:

1. **Current Trajectory Assessment**:
   Your current calculated emissions are low. If you have just initialized the application, fill out the **Impact Check-in Calculator** with your daily commutes, utility bills, dietary habits, and waste categories to calculate your precise impact.

2. **Predictive Carbon Forecast**:
   If you maintain your current metrics, your emissions will stay at approximately the same rate. Entering your personalized details will help project your 12-month trajectory and compare it directly to the global average of **400 kg CO₂** per month.

3. **Personalized Action Plan**:
   - **Commuting**: Prioritize walking, cycling, or using public transit to minimize travel footprint.
   - **Energy Efficiency**: Switch to LED bulbs, power down standby electronics, and purchase energy-efficient home appliances.
   - **Sustainable Diet**: Incorporate more organic, local, and plant-based foods to reduce food-cycle greenhouse gases.

*Note: Verify that your GROQ_API_KEY is configured in your local environment variables to activate dynamic, real-time AI modeling.*`;

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // 1. Zod Validation of Payload
    const validationResult = carbonDataSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid carbon data payload provided.', details: validationResult.error.format() },
        { status: 400 }
      );
    }

    const carbonData = validationResult.data;

    // Check for Groq API key and output diagnostics
    if (!process.env.GROQ_API_KEY) {
      console.warn("\n=================== GROQ API WARNING ===================");
      console.warn("GROQ_API_KEY environment variable is not defined in your environment.");
      console.warn("Please verify that .env.local exists in your root and contains: GROQ_API_KEY=gsk_...");
      console.warn("Next.js will reload environment settings upon changes.");
      console.warn("Falling back to static default actions.");
      console.warn("========================================================\n");
      return NextResponse.json({ insights: FALLBACK_INSIGHTS });
    }

    // 2. Build the System & User prompts
    const promptText = buildPredictivePrompt(carbonData);

    // 3. Implement Circuit Breaker with 5000ms Timeout
    const groqCall = groq.chat.completions.create({
      messages: [
        { role: 'user', content: promptText }
      ],
      model: 'llama-3.1-8b-instant',
      temperature: 0.3,
      max_tokens: 800,
    });

    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Groq request timed out (5000ms)')), 5000)
    );

    // Race the API call against our timeout
    const chatCompletion = await Promise.race([groqCall, timeoutPromise]);

    const content = chatCompletion.choices[0]?.message?.content || FALLBACK_INSIGHTS;

    return NextResponse.json({ insights: content });
  } catch (error) {
    const err = error as Error & { status?: number; headers?: unknown };
    console.error("\n=================== GROQ API DIAGNOSTIC ERROR ===================");
    console.error("Error Message:", err?.message || err);
    console.error("Error Stack:", err?.stack);
    if (err?.status) {
      console.error("HTTP Status Code from Groq:", err.status);
    }
    if (err?.headers) {
      console.error("API Headers:", JSON.stringify(err.headers));
    }
    console.error("GROQ_API_KEY status:", process.env.GROQ_API_KEY ? 'DEFINED (Security Safe)' : 'UNDEFINED');
    console.error("================================================================\n");
    
    // Graceful circuit breaker fallback
    return NextResponse.json({ insights: FALLBACK_INSIGHTS }, { status: 200 });
  }
}
