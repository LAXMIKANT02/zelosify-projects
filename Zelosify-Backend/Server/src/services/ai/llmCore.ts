// [AI MODULE]
// [SAFE]
// [NO NEW DEPENDENCIES]

import axios from "axios";

const provider = process.env.LLM_PROVIDER || "openai";
const LLM_API_KEY = process.env.LLM_API_KEY || "";

export class LLMCore {
  static async callWithTools(messages: any[], tools: any[], model = "gpt-4-turbo"): Promise<any> {
    if (provider.toLowerCase() === "openai" || provider.toLowerCase() === "groq") {
      try {
        const response = await axios.post(
          "https://api.openai.com/v1/chat/completions",
          {
            model,
            messages,
            tools: tools.length > 0 ? tools : undefined,
            tool_choice: tools.length > 0 ? "auto" : undefined,
          },
          {
            headers: {
              "Authorization": `Bearer ${LLM_API_KEY}`,
              "Content-Type": "application/json"
            },
            timeout: 1500
          }
        );

        const choice = response.data.choices[0].message;
        
        if (choice.tool_calls && choice.tool_calls.length > 0) {
          return { type: "tool_calls", calls: choice.tool_calls };
        }
        return { type: "text", content: choice.content };
      } catch (error: any) {
        throw new Error(`LLM API Error: ${error.response?.data?.error?.message || error.message}`);
      }
    } else {
      throw new Error(`LLM Provider ${provider} is not supported.`);
    }
  }
}
