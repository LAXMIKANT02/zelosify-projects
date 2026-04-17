// [AI MODULE]
// [SAFE]
// [NO NEW DEPENDENCIES]

export const ToolRegistry = {
  feature_extraction_tool: {
    type: "function",
    function: {
      name: "extract_features",
      description: "Extracts key features from the resume text.",
      parameters: {
        type: "object",
        properties: {
          experienceYears: { type: "number" },
          skills: { type: "array", items: { type: "string" } },
          location: { type: "string" }
        },
        required: ["experienceYears", "skills", "location"]
      }
    }
  },
  skill_normalization_tool: {
    type: "function",
    function: {
      name: "normalize_skills",
      description: "Compare extracted skills, experience, and location against the required opening parameters, returning scores between 0 and 1 for each.",
      parameters: {
        type: "object",
        properties: {
          skillMatchScore: { type: "number", minimum: 0, maximum: 1 },
          experienceMatchScore: { type: "number", minimum: 0, maximum: 1 },
          locationMatchScore: { type: "number", minimum: 0, maximum: 1 },
          reasoning: { type: "string" }
        },
        required: ["skillMatchScore", "experienceMatchScore", "locationMatchScore", "reasoning"]
      }
    }
  }
};

export const validationSchemas = {
  extract_features: {
    type: "object",
    properties: {
      experienceYears: { type: "number" },
      skills: { type: "array", items: { type: "string" } },
      location: { type: "string" }
    },
    required: ["experienceYears", "skills", "location"]
  },
  normalize_skills: {
    type: "object",
    properties: {
      skillMatchScore: { type: "number", minimum: 0, maximum: 1 },
      experienceMatchScore: { type: "number", minimum: 0, maximum: 1 },
      locationMatchScore: { type: "number", minimum: 0, maximum: 1 },
      reasoning: { type: "string" }
    },
    required: ["skillMatchScore", "experienceMatchScore", "locationMatchScore", "reasoning"]
  }
};
