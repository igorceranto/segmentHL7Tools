const SEGMENT_TYPE_REGEX = /^[A-Z0-9]{3}$/

/**
 * Remove espaços em branco e o terminador de segmento HL7 (\r, carriage
 * return 0x0D) das extremidades, conforme HL7 v2 spec cap. 2.
 * String.prototype.trim() já trata \r como espaço em branco (LineTerminator).
 */
export function normalizeSegment(segment: string): string {
  return segment.trim()
}

/**
 * Valida se uma string é um segmento HL7 v2 bem formado.
 * O tipo do segmento deve ter exatamente 3 caracteres alfanuméricos maiúsculos
 * conforme HL7 v2.8.2 §2.5.2: /^[A-Z0-9]{3}$/.
 * Segmentos Z (ZPD, ZAL, etc.) são aceitos como extensões locais.
 * O terminador \r e espaços nas extremidades são ignorados antes da validação.
 * @param segment - String do segmento HL7
 * @returns true se o segmento for válido, false caso contrário
 */
export function validateHL7Segment(segment: string): boolean {
  if (!segment || typeof segment !== 'string') {
    return false
  }

  const normalized = normalizeSegment(segment)
  const pipeIndex = normalized.indexOf('|')
  const segmentType =
    pipeIndex === -1 ? normalized : normalized.slice(0, pipeIndex)

  return SEGMENT_TYPE_REGEX.test(segmentType)
}
