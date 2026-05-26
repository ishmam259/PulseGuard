/**
 * PII Scrubber — strips patient identifiers before external API calls
 */

const PII_PATTERNS = [
  // Names (common Bengali/South Asian name patterns)
  /\b[A-Z][a-z]+ [A-Z][a-z]+\b/g,
  // Phone numbers
  /\+?\d{1,3}[-.\s]?\(?\d{1,4}\)?[-.\s]?\d{1,4}[-.\s]?\d{1,9}/g,
  // Email addresses
  /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
  // UUID patterns (patient IDs)
  /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi,
  // PG-XXXX patient IDs
  /PG-\d{4}/g,
]

const LOCATION_KEYWORDS = [
  'Kurigram', 'Rangpur', 'Dinajpur', 'Lalmonirhat', 'Nilphamari',
  'Village A', 'Village B', 'Village C', 'Village D',
]

function scrubPII(input) {
  if (typeof input !== 'string') {
    return input
  }

  let scrubbed = input

  // Remove PII patterns
  for (const pattern of PII_PATTERNS) {
    scrubbed = scrubbed.replace(pattern, '[REDACTED]')
  }

  // Remove location keywords
  for (const location of LOCATION_KEYWORDS) {
    scrubbed = scrubbed.replace(new RegExp(location, 'gi'), '[LOCATION]')
  }

  return scrubbed
}

function scrubObject(obj) {
  if (typeof obj === 'string') return scrubPII(obj)
  if (Array.isArray(obj)) return obj.map(scrubObject)
  if (typeof obj !== 'object' || obj === null) return obj

  const scrubbed = {}
  const sensitiveKeys = ['name', 'phone', 'email', 'village', 'patient_name', 'worker_name']

  for (const [key, value] of Object.entries(obj)) {
    if (sensitiveKeys.includes(key)) {
      scrubbed[key] = '[REDACTED]'
    } else {
      scrubbed[key] = scrubObject(value)
    }
  }

  return scrubbed
}

module.exports = { scrubPII, scrubObject }
