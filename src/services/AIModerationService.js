// AI moderation is disabled - always approve content
const MODERATION_DISABLED = true;

if (MODERATION_DISABLED) {
  console.log('🔧 AI Moderation is disabled - all content will be automatically approved');
}

class AIModerationService {
  // Text moderation - always approve
  static async moderateText(text) {
    console.log('🔧 Text moderation disabled - content approved automatically');
    return {
      isAppropriate: true,
      confidence: 1.0,
      reasons: ['Moderation disabled'],
      suggestions: 'Content approved automatically'
    };
  }

  // Image moderation - always approve
  static async moderateImage(imageFile) {
    console.log('🔧 Image moderation disabled - content approved automatically');
    return {
      isAppropriate: true,
      confidence: 1.0,
      reasons: ['Moderation disabled'],
      suggestions: 'Content approved automatically'
    };
  }

  // Check if text and images are related - always approve
  static async checkContentRelevance(text, imageFiles) {
    console.log('🔧 Relevance check disabled - content approved automatically');
    return {
      isRelevant: true,
      confidence: 1.0,
      reasons: ['Moderation disabled'],
      suggestions: 'Content approved automatically'
    };
  }

  // Helper function to convert file to base64 (kept for compatibility)
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

  // Complete moderation check - always approve
  static async performCompleteModeration(title, description, location, tags, images) {
    console.log('🔧 Complete moderation disabled - all content approved automatically');
    return {
      textModeration: { isAppropriate: true, reasons: ['Moderation disabled'] },
      imageModeration: null,
      relevanceCheck: null,
      overallApproved: true
    };
  }
}

export default AIModerationService;

