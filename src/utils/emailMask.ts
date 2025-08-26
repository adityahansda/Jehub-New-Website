/**
 * Masks an email address for privacy protection
 * Examples:
 * - john.doe@example.com -> j***@example.com
 * - alice.smith123@gmail.com -> a***@gmail.com
 * - short@test.co -> s***@test.co
 */
export function maskEmail(email: string): string {
  if (!email || typeof email !== 'string') {
    return email;
  }

  const [localPart, domain] = email.split('@');
  
  if (!localPart || !domain) {
    return email; // Return original if invalid format
  }

  // For very short local parts, show first character + ***
  if (localPart.length <= 1) {
    return `${localPart}***@${domain}`;
  }

  // For longer local parts, show first character + *** + last character (if length > 3)
  if (localPart.length <= 3) {
    return `${localPart[0]}***@${domain}`;
  }

  return `${localPart[0]}***${localPart[localPart.length - 1]}@${domain}`;
}

/**
 * Masks an email address with custom masking character and pattern
 */
export function maskEmailCustom(
  email: string, 
  maskChar: string = '*', 
  showFirstChars: number = 1,
  showLastChars: number = 0
): string {
  if (!email || typeof email !== 'string') {
    return email;
  }

  const [localPart, domain] = email.split('@');
  
  if (!localPart || !domain) {
    return email;
  }

  if (localPart.length <= showFirstChars + showLastChars) {
    return `${localPart[0]}${maskChar.repeat(3)}@${domain}`;
  }

  const firstPart = localPart.substring(0, showFirstChars);
  const lastPart = showLastChars > 0 ? localPart.substring(localPart.length - showLastChars) : '';
  const maskedLength = Math.max(3, localPart.length - showFirstChars - showLastChars);
  
  return `${firstPart}${maskChar.repeat(maskedLength)}${lastPart}@${domain}`;
}
