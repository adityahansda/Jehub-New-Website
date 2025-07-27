// Generate SEO-friendly slug from title
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
    .substring(0, 60) // Limit length for better SEO
}

// Generate a combined slug with ID for uniqueness
export function generateNoteSlug(id: string, title: string): string {
  const titleSlug = generateSlug(title)
  return `${titleSlug}--${id}` // Using double dash as separator
}

// Extract ID from slug
export function extractIdFromSlug(slug: string): string {
  const parts = slug.split('--')
  return parts[parts.length - 1] // Return the last part after double dash
}

// Extract title slug from full slug
export function extractTitleFromSlug(slug: string): string {
  const parts = slug.split('--')
  return parts.slice(0, -1).join('--') // Return everything except the last part
}

// Generate breadcrumb-friendly title from slug
export function slugToTitle(slug: string): string {
  return slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

// Validate if slug contains ID
export function isValidNoteSlug(slug: string): boolean {
  const parts = slug.split('--')
  return parts.length >= 2 && parts[parts.length - 1].length > 0
}
