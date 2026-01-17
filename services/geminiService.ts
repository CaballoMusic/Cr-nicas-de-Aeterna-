import { GoogleGenAI, Type } from "@google/genai";
import { MODEL_TEXT, MODEL_IMAGE, SYSTEM_PROMPT, HINT_SYSTEM_PROMPT } from "../constants";
import { ChatMessage, GameResponse, PlayerStats } from "../types";

// Initialize API
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Define the response schema for strict JSON output
const gameSchema = {
  type: Type.OBJECT,
  properties: {
    narrative: { type: Type.STRING, description: "El texto narrativo de la historia para este turno." },
    sceneDescription: { type: Type.STRING, description: "Una descripción visual detallada de la escena para la generación de imágenes." },
    suggestedActions: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          label: { type: Type.STRING, description: "El texto de la acción que verá el jugador." },
          type: { type: Type.STRING, enum: ['combat', 'exploration', 'diplomacy', 'neutral'] }
        },
        required: ['label', 'type']
      }
    },
    statUpdates: {
      type: Type.OBJECT,
      properties: {
        healthChange: { type: Type.INTEGER, description: "Negativo para daño, positivo para curación." },
        stabilityChange: { type: Type.INTEGER, description: "Negativo para pérdida de cordura, positivo para recuperación." },
        fragmentsChange: { type: Type.INTEGER, description: "Cambio en la cantidad de fragmentos." },
        levelChange: { type: Type.INTEGER, description: "Cambio en el nivel." }
      },
      nullable: true
    },
    inventoryUpdates: {
      type: Type.OBJECT,
      properties: {
        add: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Objetos para añadir al inventario." },
        remove: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Objetos para eliminar del inventario." }
      },
      nullable: true
    },
    gameOver: { type: Type.BOOLEAN }
  },
  required: ['narrative', 'sceneDescription', 'suggestedActions']
};

/**
 * Generates the next game state.
 */
export const generateGameTurn = async (
  history: ChatMessage[], 
  currentStats: PlayerStats, 
  inventory: string[],
  action: string
): Promise<GameResponse> => {
  try {
    // Construct context string to inform the GM of current status
    const statsContext = `
      ESTADO ACTUAL DEL JUGADOR:
      Salud: ${currentStats.health}/${currentStats.maxHealth}
      Estabilidad: ${currentStats.stability}/${currentStats.maxStability}
      Nivel: ${currentStats.level}
      Fragmentos: ${currentStats.fragments}
      Inventario: ${inventory.join(', ') || 'Vacío'}
    `;

    // Filter narrative history
    let historyText = "";
    history.slice(-6).forEach(msg => { // Last 6 turns to keep context tight
      if (!msg.isSystem && !msg.image) {
        historyText += `${msg.role === 'user' ? 'Jugador' : 'GM'}: ${msg.content}\n`;
      }
    });

    const userPrompt = `
      ${statsContext}
      
      Historia Reciente:
      ${historyText}
      
      ACCIÓN DEL JUGADOR: "${action}"
      
      Genera el siguiente turno del juego en JSON.
    `;

    const response = await ai.models.generateContent({
      model: MODEL_TEXT,
      contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
      config: {
        systemInstruction: SYSTEM_PROMPT,
        responseMimeType: "application/json",
        responseSchema: gameSchema,
        temperature: 0.7, // Slightly lower temperature for consistent game logic
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as GameResponse;
    }
    throw new Error("Respuesta vacía del modelo");
  } catch (error) {
    console.error("Error generando el turno de juego:", error);
    // Fallback response to prevent crash
    return {
      narrative: "El tejido del tiempo se ondula... (Error de conexión)",
      sceneDescription: "Static void",
      suggestedActions: [],
      statUpdates: {},
      inventoryUpdates: {},
      gameOver: false
    };
  }
};

/**
 * Generates a contextual hint.
 */
export const generateHint = async (history: ChatMessage[]): Promise<string> => {
  try {
    let historyText = "";
    history.slice(-4).forEach(msg => {
       if (!msg.isSystem && !msg.image) {
         historyText += `${msg.role === 'user' ? 'Jugador' : 'GM'}: ${msg.content}\n`;
       }
    });

    const response = await ai.models.generateContent({
      model: MODEL_TEXT,
      contents: [{ role: 'user', parts: [{ text: `Historia:\n${historyText}\n\nEl jugador pide ayuda. Dame una pista.` }] }],
      config: {
        systemInstruction: HINT_SYSTEM_PROMPT,
        maxOutputTokens: 100,
        temperature: 1.0
      }
    });

    return response.text || "El vacío guarda silencio...";
  } catch (error) {
    console.error("Error obteniendo pista:", error);
    return "Tu mente está demasiado nublada para recibir consejos.";
  }
};

/**
 * Generates a visual representation of the current scene.
 */
export const generateSceneImage = async (sceneDescription: string): Promise<string | null> => {
  try {
    // UPDATED PROMPT FOR FIRST PERSON PERSPECTIVE
    // We keep the prompt instructions in English for better image generation results, but the sceneDescription input is in Spanish (handled well by the model).
    const prompt = `First person perspective view (POV), immersive shot looking at ${sceneDescription}, dark fantasy rpg style, Aeterna world, highly detailed, photorealistic textures, cinematic lighting, depth of field, 8k resolution, unreal engine 5 render, atmospheric.`;

    const response = await ai.models.generateContent({
      model: MODEL_IMAGE,
      contents: {
        parts: [{ text: prompt }]
      },
    });

    const candidates = response.candidates;
    if (candidates && candidates[0] && candidates[0].content && candidates[0].content.parts) {
      for (const part of candidates[0].content.parts) {
        if (part.inlineData && part.inlineData.data) {
          return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        }
      }
    }
    return null;
  } catch (error) {
    console.error("Error generando imagen:", error);
    return null;
  }
};

export const startNewGame = async (): Promise<GameResponse> => {
    try {
        const response = await ai.models.generateContent({
            model: MODEL_TEXT,
            contents: [{ role: 'user', parts: [{ text: "Inicia el juego. Crea un personaje nivel 1 despertando en el Desgarro. Describe la escena y da opciones." }] }],
            config: {
                systemInstruction: SYSTEM_PROMPT,
                responseMimeType: "application/json",
                responseSchema: gameSchema,
            }
        });
        if (response.text) {
            return JSON.parse(response.text);
        }
        throw new Error("Fallo al iniciar el juego");
    } catch (error) {
        console.error("Error iniciando el juego", error);
        throw error;
    }
}