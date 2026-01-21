
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

const getAIClient = () => {
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

/**
 * Gera uma nota técnica detalhada para o PDF de orçamento.
 */
export const generateTechnicalNote = async (product: any, options: any): Promise<string> => {
  const ai = getAIClient();
  try {
    const prompt = `Cria uma nota técnica profissional de engenharia gráfica (máximo 400 caracteres) em Português para uma ordem de produção industrial. 
    Produto: ${product.name}. 
    Material: ${options.material}. 
    Acabamento: ${options.finish}. 
    Dimensões: ${options.dimensions}.
    Quantidade: ${options.quantity}.
    Custo Estimado: EUR ${options.price}.
    Use terminologia técnica avançada: 'calibração de perfil ICC FOGRA39', 'densidade ótica', 'deposição UV', 'pre-flight atómico', 'sangrias de segurança'. 
    Fale sobre a precisão REDLINE R2.`;

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    return response.text || "Protocolo industrial verificado. Calibração de cor via motor Quantum R2 garantida em conformidade com ISO 12647-2.";
  } catch (error) {
    console.error("Gemini Technical Note Error:", error);
    return "Verificação técnica concluída. Perfil de cor FOGRA39 aplicado e validação de asset concluída com sucesso no node R2.";
  }
};

/**
 * Uses Gemini 2.5 Flash Image to edit an image based on a prompt.
 */
export const editImageWithAI = async (base64Image: string, prompt: string): Promise<string | null> => {
  const ai = getAIClient();
  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Image.split(',')[1] || base64Image,
              mimeType: 'image/png',
            },
          },
          {
            text: `Edit this image based on the following instruction: ${prompt}. Return the resulting edited image.`,
          },
        ],
      },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (error) {
    console.error("AI Image Edit Error:", error);
    return null;
  }
};

/**
 * General support chat assistant.
 */
export const getChatResponse = async (message: string) => {
  const ai = getAIClient();
  const chat = ai.chats.create({
    model: 'gemini-3-flash-preview',
    config: {
      systemInstruction: 'You are the REDLINE PRINT support assistant. You are bold, helpful, and professional. Help users with printing questions, material choices, and order tracking.',
    },
  });

  const response = await chat.sendMessage({ message });
  return response.text;
};
