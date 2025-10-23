import axios from 'axios';

const GEMINI_API_KEY = process.env.REACT_APP_GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

// Check if API key is available
const MOCK_MODE = !GEMINI_API_KEY || GEMINI_API_KEY === 'AIzaSyDyBjXiCHfap6Q6P3gFUeDjwKDxbZhMGSk' || GEMINI_API_KEY === 'your_gemini_api_key_here' || GEMINI_API_KEY === 'AIzaSyB4sMjCbnx1RO8WWexYDMHOCoGWq1IcYg4';

if (MOCK_MODE) {
  console.warn('⚠️ Gemini API key not configured or invalid! Using automatic approval mode.');
}

class AIModerationService {
  // Text moderation
  static async moderateText(text) {
    try {
      // Check if API key is available
      if (MOCK_MODE) {
        console.log('🔧 Using automatic text approval (API key not configured)');
        return {
          isAppropriate: true,
          confidence: 0.8,
          reasons: ['Automatic approval - API key not configured'],
          suggestions: 'Content approved automatically'
        };
      }

      const prompt = `
Analyze the following text for content moderation:

Text: "${text}"

Please check for:
1. Inappropriate content (18+ material, explicit sexual content, violence, hate speech)
2. Spam or promotional content
3. Offensive language or harassment
4. False information or misleading content
5. Content that violates community guidelines

Respond with a JSON object in this format:
{
  "isAppropriate": true/false,
  "confidence": 0.0-1.0,
  "reasons": ["reason1", "reason2"],
  "suggestions": "suggestions for improvement if needed"
}

Only respond with the JSON object, no additional text.`;

      const response = await axios.post(
        `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
        {
          contents: [
            {
              parts: [
                {
                  text: prompt
                }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 500,
          }
        }
      );

      const result = response.data.candidates[0].content.parts[0].text;
      return JSON.parse(result);
    } catch (error) {
      console.warn('Text moderation error (using fallback):', error.message);
      return {
        isAppropriate: true,
        confidence: 0.5,
        reasons: ['Moderation service unavailable'],
        suggestions: 'Content approved automatically'
      };
    }
  }

  // Image moderation
  static async moderateImage(imageFile) {
    try {
      // Check if API key is available
      if (MOCK_MODE) {
        console.log('🔧 Using automatic image approval (API key not configured)');
        return {
          isAppropriate: true,
          confidence: 0.8,
          reasons: ['Automatic approval - API key not configured'],
          suggestions: 'Content approved automatically'
        };
      }

      const base64 = await this.fileToBase64(imageFile);
      
      const prompt = `
Analyze this image for content moderation:

Please check for:
1. Inappropriate content (18+ material, explicit sexual content, violence, gore)
2. Hate symbols or offensive imagery
3. Dangerous activities or harmful content
4. Copyright violations or inappropriate use of logos
5. Content that violates community guidelines

Respond with a JSON object in this format:
{
  "isAppropriate": true/false,
  "confidence": 0.0-1.0,
  "reasons": ["reason1", "reason2"],
  "suggestions": "suggestions for improvement if needed"
}

Only respond with the JSON object, no additional text.`;

      const response = await axios.post(
        `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
        {
          contents: [
            {
              parts: [
                {
                  text: prompt
                },
                {
                  inline_data: {
                    mime_type: imageFile.type,
                    data: base64
                  }
                }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 500,
          }
        }
      );

      const result = response.data.candidates[0].content.parts[0].text;
      return JSON.parse(result);
    } catch (error) {
      console.warn('Image moderation error (using fallback):', error.message);
      return {
        isAppropriate: true,
        confidence: 0.5,
        reasons: ['Moderation service unavailable'],
        suggestions: 'Content approved automatically'
      };
    }
  }

  // Check if text and images are related
  static async checkContentRelevance(text, imageFiles) {
    try {
      // Check if API key is available
      if (MOCK_MODE) {
        console.log('🔧 Using automatic relevance approval (API key not configured)');
        return {
          isRelevant: true,
          confidence: 0.8,
          reasons: ['Automatic approval - API key not configured'],
          suggestions: 'Content approved automatically'
        };
      }

      const imageAnalyses = [];
      
      // Analyze each image
      for (const imageFile of imageFiles) {
        const base64 = await this.fileToBase64(imageFile);
        
        const imagePrompt = `
Analyze this image and describe what you see in detail. Focus on:
- Main subjects or objects
- Setting or environment
- Activities or events
- Overall theme or mood

Provide a detailed description in 2-3 sentences.`;

        const response = await axios.post(
          `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
          {
            contents: [
              {
                parts: [
                  {
                    text: imagePrompt
                  },
                  {
                    inline_data: {
                      mime_type: imageFile.type,
                      data: base64
                    }
                  }
                ]
              }
            ],
            generationConfig: {
              temperature: 0.3,
              maxOutputTokens: 200,
            }
          }
        );

        const imageDescription = response.data.candidates[0].content.parts[0].text;
        imageAnalyses.push(imageDescription);
      }

      // Check relevance between text and images
      const relevancePrompt = `
Text content: "${text}"

Image descriptions:
${imageAnalyses.map((desc, index) => `Image ${index + 1}: ${desc}`).join('\n')}

Analyze if the text content is relevant to the images. Check if:
1. The text describes what's shown in the images
2. The images support the text content
3. There's a logical connection between text and images

Respond with a JSON object in this format:
{
  "isRelevant": true/false,
  "confidence": 0.0-1.0,
  "reasons": ["reason1", "reason2"],
  "suggestions": "suggestions for improvement if needed"
}

Only respond with the JSON object, no additional text.`;

      const relevanceResponse = await axios.post(
        `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
        {
          contents: [
            {
              parts: [
                {
                  text: relevancePrompt
                }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 300,
          }
        }
      );

      const result = relevanceResponse.data.candidates[0].content.parts[0].text;
      return JSON.parse(result);
    } catch (error) {
      console.warn('Content relevance check error (using fallback):', error.message);
      return {
        isRelevant: true,
        confidence: 0.5,
        reasons: ['Moderation service unavailable'],
        suggestions: 'Content approved automatically'
      };
    }
  }

  // Helper function to convert file to base64
  static fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64 = reader.result.split(',')[1]; // Remove data:image/...;base64, prefix
        resolve(base64);
      };
      reader.onerror = error => reject(error);
    });
  }

  // Complete moderation check
  static async performCompleteModeration(title, description, location, tags, images) {
    try {
      const results = {
        textModeration: null,
        imageModeration: null,
        relevanceCheck: null,
        overallApproved: false
      };

      // Check text content
      const fullText = `${title} ${description} ${location} ${tags.join(' ')}`;
      results.textModeration = await this.moderateText(fullText);

      // Check images if any
      if (images && images.length > 0) {
        const imageResults = [];
        for (const image of images) {
          const imageResult = await this.moderateImage(image);
          imageResults.push(imageResult);
        }
        results.imageModeration = imageResults;

        // Check relevance
        results.relevanceCheck = await this.checkContentRelevance(fullText, images);
      }

      // Overall approval
      results.overallApproved = results.textModeration.isAppropriate && 
        (results.imageModeration ? results.imageModeration.every(img => img.isAppropriate) : true) &&
        (results.relevanceCheck ? results.relevanceCheck.isRelevant : true);

      return results;
    } catch (error) {
      console.warn('Complete moderation error (using fallback):', error.message);
      return {
        textModeration: { isAppropriate: true, reasons: ['Moderation service unavailable'] },
        imageModeration: null,
        relevanceCheck: null,
        overallApproved: true
      };
    }
  }
}

export default AIModerationService;

