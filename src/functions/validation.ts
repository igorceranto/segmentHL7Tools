const SEGMENT_TYPE_REGEX = /^[A-Z0-9]{3}$/

/**
 * Valida se uma string é um segmento HL7 válido.
 * O tipo do segmento deve ter exatamente 3 caracteres alfanuméricos maiúsculos.
 * @param segment - String do segmento HL7
 * @returns true se o segmento for válido, false caso contrário
 */
export function validateHL7Segment(segment: string): boolean {
  if (!segment || typeof segment !== 'string') {
    return false
  }

  const pipeIndex = segment.indexOf('|')
  const segmentType = pipeIndex === -1 ? segment : segment.slice(0, pipeIndex)

  return SEGMENT_TYPE_REGEX.test(segmentType)
}
