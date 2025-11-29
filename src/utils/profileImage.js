/**
 * Get default profile image URL based on user name
 * @param {string} name - User's name (firstName, lastName, or userName)
 * @returns {string} Default profile image URL
 */
export const getDefaultProfileImage = (name = 'User') => {
  // Clean the name for URL encoding
  const cleanName = name.trim() || 'User';
  // Use UI Avatars API to generate a profile image with initials
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(cleanName)}&background=667eea&color=fff&size=200&bold=true`;
};

/**
 * Get profile image with fallback to default
 * @param {string|null|undefined} profileImage - User's profile image URL
 * @param {string} userName - User's name for fallback
 * @returns {string} Profile image URL or default
 */
export const getProfileImage = (profileImage, userName = 'User') => {
  if (profileImage && profileImage.trim() && profileImage !== 'null' && profileImage !== 'undefined') {
    return profileImage;
  }
  return getDefaultProfileImage(userName);
};

