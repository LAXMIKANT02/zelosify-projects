// [AI MODULE]
// [SAFE]
// [NO NEW DEPENDENCIES]

export class ScoringEngine {
  static calculateScore(skillMatchScore: number, experienceMatchScore: number, locationMatchScore: number) {
    const finalScore = 
      (0.5 * skillMatchScore) + 
      (0.3 * experienceMatchScore) + 
      (0.2 * locationMatchScore);
    
    return {
      skillMatchScore,
      experienceMatchScore,
      locationMatchScore,
      finalScore
    };
  }

  static getDecision(finalScore: number): { decision: "Recommended" | "Borderline" | "Not Recommended", confidence: number } {
    if (finalScore >= 0.75) {
      return { decision: "Recommended", confidence: finalScore };
    } else if (finalScore >= 0.5 && finalScore < 0.75) {
      return { decision: "Borderline", confidence: finalScore };
    } else {
      return { decision: "Not Recommended", confidence: finalScore };
    }
  }
}
