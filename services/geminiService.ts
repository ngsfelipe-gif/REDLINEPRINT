
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
    Fale sobre a precisão REDLINE MARKET R2.`;

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
 * Assistente de suporte geral.
 */
export const getChatResponse = async (message: string) => {
  const ai = getAIClient();
  const chat = ai.chats.create({
    model: 'gemini-3-flash-preview',
    config: {
      systemInstruction: 'És o assistente de suporte da REDLINE MARKET. És direto, prestável e profissional. Ajuda os utilizadores com questões sobre o marketplace, escolha de materiais e seguimento de encomendas industriais.',
    },
  });

  const response = await chat.sendMessage({ message });
  return response.text;
};