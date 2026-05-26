import type { ParsedHL7Segment } from '../types'
import { parseHL7Segment } from './parser'
import { normalizeSegment, validateHL7Segment } from './validation'

export interface HL7Message {
  /** Todos os segmentos da mensagem em ordem */
  segments: ParsedHL7Segment[]
  /** Field separator lido do MSH-1 (padrão '|') */
  fieldSeparator: string
  /** Encoding characters lidos do MSH-2 (padrão '^~\\&') */
  encodingChars: string
  /** Retorna o primeiro segmento do tipo informado, ou null */
  getSegment(type: string): ParsedHL7Segment | null
  /** Retorna todos os segmentos do tipo informado */
  getSegments(type: string): ParsedHL7Segment[]
}

/**
 * Parseia uma mensagem HL7 v2 completa e retorna um objeto estruturado.
 *
 * Conformidade HL7 v2 spec cap. 2:
 * - O terminador de segmento é \r (0x0D), mas \n e \r\n também são aceitos
 *   por robustez.
 * - Linhas vazias e segmentos inválidos são silenciosamente ignorados.
 * - MSH-1 (field separator) e MSH-2 (encoding characters) são lidos do
 *   primeiro segmento MSH encontrado na mensagem.
 *
 * @param message - String da mensagem HL7 completa
 * @returns Objeto HL7Message com segmentos e métodos auxiliares
 * @throws Error se message não for uma string ou for vazia
 */
export function parseHL7Message(message: string): HL7Message {
  if (!message || typeof message !== 'string') {
    throw new Error('Mensagem HL7 deve ser uma string válida e não vazia')
  }

  const lines = message.split(/\r\n|\r|\n/)

  const segments: ParsedHL7Segment[] = []

  for (const line of lines) {
    const normalized = normalizeSegment(line)
    if (!normalized) continue
    if (!validateHL7Segment(normalized)) continue
    segments.push(parseHL7Segment(normalized))
  }

  let fieldSeparator = '|'
  let encodingChars = '^~\\&'

  const mshSegment = segments.find((s) => s.segmentType === 'MSH')
  if (mshSegment) {
    if (mshSegment.field1) {
      fieldSeparator = mshSegment.field1
    }
    if (mshSegment.field2) {
      encodingChars = mshSegment.field2
    }
  }

  return {
    segments,
    fieldSeparator,
    encodingChars,
    getSegment(type: string): ParsedHL7Segment | null {
      return segments.find((s) => s.segmentType === type) ?? null
    },
    getSegments(type: string): ParsedHL7Segment[] {
      return segments.filter((s) => s.segmentType === type)
    },
  }
}

/**
 * Cria uma mensagem HL7 v2 a partir de um array de strings de segmentos.
 *
 * Conforme HL7 v2 spec §2.3, segmentos são separados e terminados por \r.
 *
 * @param segments - Array de strings de segmentos HL7
 * @returns String da mensagem HL7 com segmentos separados por \r
 * @throws Error se algum segmento for inválido
 */
export function createHL7Message(segments: string[]): string {
  const nonEmpty = segments.filter((s) => s !== '')

  for (const segment of nonEmpty) {
    if (!validateHL7Segment(segment)) {
      throw new Error(
        `Segmento HL7 inválido: "${segment}". O tipo do segmento deve ter exatamente 3 caracteres alfanuméricos maiúsculos (A-Z, 0-9)`
      )
    }
  }

  return `${nonEmpty.join('\r')}\r`
}
