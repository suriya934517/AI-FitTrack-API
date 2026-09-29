const { GoogleGenAI } = require('@google/genai');

const geminiModel = process.env.GEMINI_MODEL || 'gemini-3.8-flash';

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const generateContentWithRetry = async (contents) => {
  const maxAttempts = 3;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      return await ai.models.generateContent({
        model: geminiModel,
        contents,
      });
    } catch (error) {
      const errorText = `${error.status || ''} ${error.message || ''}`;
      const isTransient = /429|500|502|503|504|UNAVAILABLE|RESOURCE_EXHAUSTED/.test(errorText);

      if (!isTransient || attempt === maxAttempts) {
        throw error;
      }

      await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
    }
  }
};

// Generates a personalized workout recommendation using Google Gemini
const generateWorkoutRecommendation = async (age, fitnessGoal, experience) => {
  try {
    const prompt = `Generate a personalized workout recommendation for a person with the following details:
- Age: ${age}
- Fitness Goal: ${fitnessGoal}
- Experience Level: ${experience}

Please keep the recommendation extremely direct, practical, and concise (within 2-3 paragraph). Do not include any greeting, markdown bold stars (*), bullet points, or introductory phrases. Speak directly and provide a clear step-by-step execution plan also.`;

    const response = await generateContentWithRetry(prompt);
    return response.text ? response.text.trim() : 'No recommendation could be generated.';
  } catch (error) {
    console.error('Gemini Recommendation Error:', error.message);
    throw new Error('Failed to generate workout recommendation from Gemini AI');
  }
};

// Generates personalized fitness insights using Google Gemini
const generateFitnessInsights = async (totalWorkouts, averageDuration, totalCaloriesBurned) => {
  try {
    const prompt = `Analyze this user's fitness progress and generate a highly personalized, encouraging fitness insight:
- Total Workouts Logged: ${totalWorkouts}
- Average Workout Duration: ${averageDuration} minutes
- Total Calories Burned: ${totalCaloriesBurned} kcal

Please keep the insight extremely direct, actionable, and concise (within 2-3 sentences). Do not include any greeting, markdown bold stars (*), bullet points, or introductory phrases. Provide guidance on what to adjust or continue.`;

    const response = await generateContentWithRetry(prompt);

    return response.text ? response.text.trim() : 'No insight could be generated.';
  } catch (error) {
    console.error('Gemini Insights Error:', error.message);
    throw new Error('Failed to generate fitness insights from Gemini AI');
  }
};

module.exports = {
  generateWorkoutRecommendation,
  generateFitnessInsights,
};
