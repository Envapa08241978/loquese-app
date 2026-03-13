import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';
import { SYSTEM_PROMPT } from '@/lib/ai';

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: 'API Key de Gemini no configurada. Agrega GEMINI_API_KEY en .env.local' },
        { status: 500 }
      );
    }

    const { pregunta, contextData } = await req.json();

    if (!pregunta) {
      return NextResponse.json(
        { error: 'La pregunta es requerida' },
        { status: 400 }
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash-latest' });

    const fullPrompt = `${SYSTEM_PROMPT}

--- BASE DE CONOCIMIENTOS DEL USUARIO ---
${contextData || 'El usuario aún no ha agregado conocimientos a su base de datos.'}
--- FIN DE BASE DE CONOCIMIENTOS ---

CONSULTA DEL USUARIO:
${pregunta}`;

    const result = await model.generateContent(fullPrompt);
    const response = result.response;
    const text = response.text();

    return NextResponse.json({ respuesta: text });
  } catch (error: unknown) {
    console.error('Gemini API error:', error);
    const message = error instanceof Error ? error.message : 'Error desconocido';
    return NextResponse.json(
      { error: `Error al consultar Gemini: ${message}` },
      { status: 500 }
    );
  }
}
