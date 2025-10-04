import type { ProductPreview } from '@/types'

// Store-specific URL patterns and parsers
const storePatterns = {
  amazon: /amazon\.(com|ca|co\.uk|de|fr|it|es|jp)/i,
  target: /target\.com/i,
  walmart: /walmart\.com/i,
  bestbuy: /bestbuy\.(com|ca)/i,
  ebay: /ebay\.(com|ca|co\.uk|de|fr|it|es)/i,
  etsy: /etsy\.com/i,
  wayfair: /wayfair\.(com|ca)/i,
  homedepot: /homedepot\.(com|ca)/i,
  lowes: /lowes\.(com|ca)/i
}

// Extract store name from URL
export function getStoreName(url: string): string {
  try {
    const hostname = new URL(url).hostname.toLowerCase()
    
    for (const [store, pattern] of Object.entries(storePatterns)) {
      if (pattern.test(hostname)) {
        return store.charAt(0).toUpperCase() + store.slice(1)
      }
    }
    
    // Extract domain name as fallback
    const domain = hostname.replace('www.', '').split('.')[0]
    return domain.charAt(0).toUpperCase() + domain.slice(1)
  } catch {
    return 'Unknown Store'
  }
}

// Extract product information from URL - simplified to name and store only
export async function parseProductUrl(url: string): Promise<ProductPreview> {
  try {
    // Small delay to simulate parsing (for better UX)
    await new Promise(resolve => setTimeout(resolve, 300))
    
    const name = extractProductName(url)
    const store = getStoreName(url)
    
    return {
      title: name,
      store,
      // No image extraction - keep it simple
      imageUrl: undefined,
      price: undefined,
      currency: undefined,
      description: undefined
    }
  } catch (error) {
    console.error('Failed to parse URL:', error)
    throw new Error('Could not extract product information from URL')
  }
}


// Extract product name from URL with store-specific logic
function extractProductName(url: string): string {
  try {
    const urlObj = new URL(url)
    const pathParts = urlObj.pathname.split('/').filter(part => part.length > 0)
    
    // Store-specific parsing
    if (url.includes('amazon')) {
      // Amazon: look for descriptive parts, avoid dp/ and product IDs
      const productPart = pathParts.find(part => 
        part.includes('-') && part.length > 10 && !part.startsWith('dp') && !part.startsWith('B0')
      )
      if (productPart) {
        return formatProductName(productPart, 60)
      }
    } else if (url.includes('target')) {
      // Target: product name is usually before the ID
      const productPart = pathParts.find(part => 
        part.includes('-') && part.length > 8 && part !== 'p'
      )
      if (productPart) {
        return formatProductName(productPart, 50)
      }
    } else if (url.includes('bestbuy')) {
      // Best Buy: descriptive names in site/ path
      const productPart = pathParts.find(part => 
        part.includes('-') && part.length > 10
      )
      if (productPart) {
        return formatProductName(productPart, 50)
      }
    } else if (url.includes('etsy')) {
      // Etsy: product name after /listing/number/
      const listingIndex = pathParts.indexOf('listing')
      if (listingIndex >= 0 && listingIndex + 2 < pathParts.length) {
        return formatProductName(pathParts[listingIndex + 2], 45)
      }
    } else if (url.includes('walmart')) {
      // Walmart: product name in ip/ path
      const productPart = pathParts.find(part => 
        part.includes('-') && part.length > 8 && part !== 'ip'
      )
      if (productPart) {
        return formatProductName(productPart, 50)
      }
    }
    
    // Generic fallback: find the longest descriptive part
    const productParts = pathParts.filter(part => 
      part.includes('-') && part.length > 5 && !part.match(/^\d+$/) && !part.match(/^[A-Z0-9]{10,}$/)
    )
    
    if (productParts.length > 0) {
      const bestPart = productParts.reduce((a, b) => a.length > b.length ? a : b)
      return formatProductName(bestPart, 50)
    }
    
    // Last resort: use last path segment if reasonable
    const lastPart = pathParts[pathParts.length - 1]
    if (lastPart && lastPart.length > 3) {
      return formatProductName(lastPart, 30)
    }
    
    return 'Product from URL'
  } catch {
    return 'Product from URL'
  }
}

// Helper function to format product names consistently
function formatProductName(rawName: string, maxLength: number): string {
  return rawName
    .replace(/[-_]/g, ' ')
    .replace(/\+/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase())
    .replace(/\s+/g, ' ')
    .trim()
    .substring(0, maxLength)
}

// URL parsing implementation notes
export const urlParsingStrategies = {
  // Current implementation: Extract from URL structure
  urlStructure: 'Parse product names from URL paths and slugs',
  
  // Future enhancements could include:
  // - Open Graph meta tag extraction
  // - Store-specific API integration  
  // - Third-party scraping services
  // - Browser extension approach
}

// Validate URL format
export function isValidProductUrl(url: string): boolean {
  try {
    const urlObj = new URL(url)
    return ['http:', 'https:'].includes(urlObj.protocol)
  } catch {
    return false
  }
}