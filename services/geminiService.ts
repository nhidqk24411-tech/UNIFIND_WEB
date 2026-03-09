
import { GoogleGenAI, Type } from "@google/genai";
import { FoundItem } from "../types";

const ai = new GoogleGenAI({
  apiKey: import.meta.env.VITE_GEMINI_API_KEY
});

// Existing Functions...
export const findMatchingItems = async (query: string, availableItems: FoundItem[]): Promise<string[]> => {
  try {
    const itemsContext = availableItems.map(item => ({
      id: item.id,
      text: `${item.title} ${item.description} ${item.location} ${item.category}`
    }));

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `
        You are a helpful Lost and Found assistant. 
        A user is searching with the query: "${query}".
        
        Here is the database of items:
        ${JSON.stringify(itemsContext)}
        
        Return a JSON object with a list of IDs of items that match the user's description.
        Return ONLY the JSON.
      `,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            matchedIds: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          }
        }
      }
    });

    const result = JSON.parse(response.text || "{}");
    return result.matchedIds || [];
  } catch (error) {
    console.error("Gemini Search Error:", error);
    return [];
  }
};

export const generateItemDescription = async (title: string, location: string): Promise<string> => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: `Generate a short, helpful description for a lost/found item post. 
            Item Info: ${title}. 
            Location: ${location}. 
            Keep it under 30 words.`
        });
        return response.text || "";
    } catch (e) {
        return "";
    }
}

// Updated to return a description for internal use
export const describeImageForSearch = async (base64Image: string): Promise<string> => {
    try {
        const matches = base64Image.match(/^data:(image\/[a-zA-Z+]+);base64,(.+)$/);
        let mimeType = 'image/jpeg';
        let cleanBase64 = base64Image;

        if (matches && matches.length === 3) {
            mimeType = matches[1];
            cleanBase64 = matches[2];
        } else {
             cleanBase64 = base64Image.split(',')[1] || base64Image;
        }

        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: {
                parts: [
                    { inlineData: { mimeType: mimeType, data: cleanBase64 } },
                    { text: "Describe this object in detail (color, type, brand, distinctive features) to find similar items in a lost and found database." }
                ]
            }
        });
        return response.text || "";
    } catch (e) {
        console.error("Describe Image Error:", e);
        return "";
    }
}

export const findVisualMatches = async (imageBase64: string, candidates: FoundItem[]): Promise<string[]> => {
    try {
        const matches = imageBase64.match(/^data:(image\/[a-zA-Z+]+);base64,(.+)$/);
        let mimeType = 'image/jpeg';
        let cleanBase64 = imageBase64;

        if (matches && matches.length === 3) {
            mimeType = matches[1];
            cleanBase64 = matches[2];
        } else {
             cleanBase64 = imageBase64.split(',')[1] || imageBase64;
        }

        // Step 1: Get distinct visual tags/features to search with
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: {
                parts: [
                    { inlineData: { mimeType: mimeType, data: cleanBase64 } },
                    { text: "List the distinct visual features of this item (color, type, brand, condition, text on item) as a comma-separated string. Be specific." }
                ]
            }
        });
        
        const features = response.text || "";
        if (!features) return [];

        // Step 2: Use features to find matches
        return await findMatchingItems(features, candidates);
    } catch (error) {
        console.error("Visual Search Error:", error);
        return [];
    }
}

export const reverseGeocode = async (lat: number, lng: number): Promise<string> => {
    try {
        const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`, 
            {
                headers: {
                    'User-Agent': 'UniFind_LostAndFound_Demo/1.0' 
                }
            }
        );

        if (!response.ok) {
            return `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
        }

        const data = await response.json();
        const addr = data.address || {};
        
        const name = addr.amenity || addr.building || addr.university || addr.college || addr.library || addr.sports_centre;
        const road = addr.road || addr.pedestrian || addr.footway;
        const area = addr.suburb || addr.neighbourhood || addr.city_district;

        const parts = [name, road, area].filter(Boolean);
        
        if (parts.length > 0) {
            return parts.slice(0, 2).join(', ');
        }
        
        if (data.display_name) {
             return data.display_name.split(',').slice(0, 2).join(',');
        }

        return `${lat.toFixed(5)}, ${lng.toFixed(5)}`;

    } catch (error) {
        console.warn("Geocoding failed, falling back to coordinates:", error);
        return `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
    }
};

export const checkItemMatches = async (newItem: FoundItem, candidates: FoundItem[]): Promise<string[]> => {
    try {
        const sameCategoryCandidates = candidates.filter(c => c.category === newItem.category);
        if (sameCategoryCandidates.length === 0) return [];

        const candidateContext = sameCategoryCandidates.map(item => ({
            id: item.id,
            title: item.title,
            desc: item.description,
            loc: item.location,
            date: item.dateFound,
            category: item.category
        }));

        const targetContext = {
            title: newItem.title,
            desc: newItem.description,
            loc: newItem.location,
            date: newItem.dateFound,
            category: newItem.category,
            type: newItem.type
        };

        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: `
                The user just reported a ${targetContext.type} item: ${JSON.stringify(targetContext)}.
                Compare against this list: ${JSON.stringify(candidateContext)}.
                Identify items that are highly likely to be the same physical object.
                CRITERIA: Same Category, Date Logic (Lost <= Found), Visual Similarity.
                Return a JSON object containing 'matchedIds' (array of strings). 
            `,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        matchedIds: {
                            type: Type.ARRAY,
                            items: { type: Type.STRING }
                        }
                    }
                }
            }
        });

        const result = JSON.parse(response.text || "{}");
        return result.matchedIds || [];
    } catch (error) {
        console.error("AI Matching Error:", error);
        return [];
    }
};

export const validateImageContent = async (imageBase64: string, category: string, title: string): Promise<{ isValid: boolean; reason: string }> => {
    try {
        const matches = imageBase64.match(/^data:(image\/[a-zA-Z+]+);base64,(.+)$/);
        let mimeType = 'image/jpeg';
        let cleanBase64 = imageBase64;
        if (matches && matches.length === 3) {
            mimeType = matches[1];
            cleanBase64 = matches[2];
        } else {
             cleanBase64 = imageBase64.split(',')[1] || imageBase64;
        }
        
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: {
                parts: [
                    { inlineData: { mimeType: mimeType, data: cleanBase64 } },
                    { text: "Determine if the image is Safe For Work (SFW). If yes, return isValid: true. If nudity/violence/hate, isValid: false. Return JSON." }
                ]
            },
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        isValid: { type: Type.BOOLEAN },
                        reason: { type: Type.STRING }
                    }
                }
            }
        });

        const text = response.text || "{}";
        const result = JSON.parse(text);
        
        return {
            isValid: result.isValid ?? true,
            reason: result.reason || "Image validation failed."
        };
    } catch (error) {
        return { isValid: true, reason: "Skipped validation." };
    }
}

export const validatePostContent = async (title: string, description: string, category: string, imageBase64: string | null): Promise<{ isValid: boolean; errorField: 'title' | 'description' | null; reason: string }> => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `Analyze: Title "${title}", Desc "${description}". Check for profanity, hate speech, spam. Ensure title is descriptive. Return JSON: {isValid: boolean, errorField: string | null, reason: string}`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        isValid: { type: Type.BOOLEAN },
                        errorField: { type: Type.STRING, nullable: true },
                        reason: { type: Type.STRING }
                    }
                }
            }
        });
        const result = JSON.parse(response.text || "{}");
        return { 
            isValid: result.isValid ?? false, 
            errorField: result.errorField || null,
            reason: result.reason || "Unable to validate content." 
        };
    } catch (error) {
        return { isValid: true, errorField: null, reason: "AI Validation skipped." };
    }
}

export const moderateChatMessage = async (text: string): Promise<string> => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: `Analyze message: "${text}". Replace profanity/hate/sexual content with ***. Return JSON: {sanitizedText: string}`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        sanitizedText: { type: Type.STRING }
                    }
                }
            }
        });
        const result = JSON.parse(response.text || "{}");
        return result.sanitizedText || text;
    } catch (error) {
        return text;
    }
}
