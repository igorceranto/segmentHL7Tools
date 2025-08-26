/**
 * Valida se uma string é um segmento HL7 válido
 * @param segment - String do segmento HL7
 * @returns true se o segmento for válido, false caso contrário
 */
export function validateHL7Segment(segment: string): boolean {
  if (!segment || typeof segment !== 'string') {
    return false
  }

  // Verifica se tem pelo menos o tipo de segmento
  const parts = segment.split('|')
  return parts.length >= 1 && parts[0] !== undefined && parts[0].length > 0
}
