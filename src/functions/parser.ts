import type { ParsedHL7Segment } from '../types'
import { normalizeSegment } from './validation'

const SEGMENT_TYPE_REGEX = /^[A-Z0-9]{3}$/

/**
 * Parseia um segmento HL7 v2 e retorna um objeto com os campos indexados.
 *
 * Conformidade HL7 v2.8.2 §2.5:
 * - O terminador de segmento \r (0x0D) e espaços nas extremidades são removidos
 *   antes do parse.
 * - O segment ID deve ter exatamente 3 caracteres alfanuméricos maiúsculos.
 * - Para o segmento MSH, MSH-1 (field separator) e MSH-2 (encoding characters)
 *   recebem tratamento especial: MSH-1 é sempre o caractere na posição 3 da
 *   string e MSH-2 é o conteúdo entre MSH-1 e o próximo MSH-1.
 *
 * @param segment - String do segmento HL7 (com ou sem \r no final)
 * @returns Objeto tipado com segmentType e campos field1, field2, ..., fieldN
 * @throws Error se o segmento não for uma string válida ou o segment ID for inválido
 */
export function parseHL7Segment(segment: string): ParsedHL7Segment {
  if (!segment || typeof segment !== 'string') {
    throw new Error('Segmento HL7 deve ser uma string válida')
  }

  const normalized = normalizeSegment(segment)
  const firstPipe = normalized.indexOf('|')
  const segmentType =
    firstPipe === -1 ? normalized : normalized.slice(0, firstPipe)

  if (!SEGMENT_TYPE_REGEX.test(segmentType)) {
    throw new Error(
      `Segment ID inválido: "${segmentType}". Deve ter exatamente 3 caracteres alfanuméricos maiúsculos (A-Z, 0-9)`
    )
  }

  const result: ParsedHL7Segment = { segmentType }

  if (firstPipe === -1) {
    return result
  }

  // Tratamento especial para MSH conforme HL7 v2 spec §2.14.9:
  // MSH-1 é o field separator (o próprio | na posição 3).
  // MSH-2 são os encoding characters (^~\& ou ^~\&# na versão 2.8+).
  // O split normal por | não funciona porque MSH-1 e MSH-2 têm semântica
  // diferente dos demais campos.
  if (segmentType === 'MSH') {
    // normalized[3] é sempre '|' pois a validação garante segmentType de 3 chars
    const fieldSep = normalized[3] as string
    const afterId = normalized.slice(4) // tudo após "MSH|"
    const mshFields = afterId.split(fieldSep)

    // field1 = MSH-1 (o field separator em si)
    result.field1 = fieldSep
    // field2 = MSH-2 (encoding characters, primeiro campo após MSH-1)
    // e assim por diante a partir de field3
    mshFields.forEach((field, index) => {
      result[`field${index + 2}`] = field
    })

    return result
  }

  const fields = normalized.slice(firstPipe + 1).split('|')
  fields.forEach((field, index) => {
    result[`field${index + 1}`] = field
  })

  return result
}

/**
 * Cria um segmento HL7 v2 a partir do tipo e campos fornecidos.
 *
 * O segment ID é validado conforme HL7 v2.8.2 §2.5.2:
 * deve ter exatamente 3 caracteres alfanuméricos maiúsculos.
 *
 * @param segmentType - Tipo do segmento (ex: MSH, PID, PV1, ZPD)
 * @param fields - Array de strings com os valores dos campos
 * @returns String do segmento HL7 formatado
 * @throws Error se segmentType for inválido ou fields não for um array
 */
export function createHL7Segment(
  segmentType: string,
  fields: string[]
): string {
  if (!segmentType || typeof segmentType !== 'string') {
    throw new Error('Tipo de segmento deve ser uma string válida')
  }

  if (!SEGMENT_TYPE_REGEX.test(segmentType)) {
    throw new Error(
      `Segment ID inválido: "${segmentType}". Deve ter exatamente 3 caracteres alfanuméricos maiúsculos (A-Z, 0-9)`
    )
  }

  if (!Array.isArray(fields)) {
    throw new Error('Campos devem ser um array')
  }

  return [segmentType, ...fields].join('|')
}
