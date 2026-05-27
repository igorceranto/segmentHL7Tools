import { extractFieldValue, setFieldValue } from './field-operations'
import { parseHL7Message } from './message'
import { createHL7Segment, parseHL7Segment } from './parser'

/**
 * Busca a linha raw de um segmento específico em uma mensagem HL7.
 * Retorna null se o segmento não for encontrado.
 */
function findRawSegment(message: string, segmentType: string): string | null {
  const prefix = `${segmentType}|`
  const lines = message.split(/\r\n|\r|\n/)
  for (const line of lines) {
    const trimmed = line.trim()
    if (trimmed.startsWith(prefix)) {
      return trimmed
    }
  }
  return null
}

/**
 * Extrai o tipo da mensagem HL7 v2 (MSH-9).
 *
 * @param message - String da mensagem HL7 completa
 * @returns Tipo da mensagem (ex: 'ADT^A01') ou null se não encontrar MSH ou campo vazio
 */
export function getMessageType(message: string): string | null {
  if (!message || typeof message !== 'string') return null

  let parsed: ReturnType<typeof parseHL7Message>
  try {
    parsed = parseHL7Message(message)
  } catch {
    return null
  }

  if (!parsed.getSegment('MSH')) return null

  const mshLine = findRawSegment(message, 'MSH')
  if (!mshLine) return null

  const value = extractFieldValue(mshLine, 9)
  return value || null
}

/**
 * Extrai o message control ID da mensagem HL7 v2 (MSH-10).
 *
 * @param message - String da mensagem HL7 completa
 * @returns Message control ID ou null se não encontrar
 */
export function getMessageControlId(message: string): string | null {
  if (!message || typeof message !== 'string') return null

  let parsed: ReturnType<typeof parseHL7Message>
  try {
    parsed = parseHL7Message(message)
  } catch {
    return null
  }

  if (!parsed.getSegment('MSH')) return null

  const mshLine = findRawSegment(message, 'MSH')
  if (!mshLine) return null

  const value = extractFieldValue(mshLine, 10)
  return value || null
}

/**
 * Extrai o patient ID da mensagem HL7 v2 (PID-3).
 *
 * @param message - String da mensagem HL7 completa
 * @returns Patient ID (PID-3) ou null se não houver PID ou campo vazio
 */
export function getPatientId(message: string): string | null {
  if (!message || typeof message !== 'string') return null

  let parsed: ReturnType<typeof parseHL7Message>
  try {
    parsed = parseHL7Message(message)
  } catch {
    return null
  }

  if (!parsed.getSegment('PID')) return null

  const pidLine = findRawSegment(message, 'PID')
  if (!pidLine) return null

  const value = extractFieldValue(pidLine, 3)
  return value || null
}

/**
 * Constrói uma mensagem ACK HL7 v2 completa a partir do MSH original.
 *
 * Conforme HL7 v2 spec §2.9, uma resposta ACK deve:
 * - Inverter sending/receiving (MSH-3↔MSH-5 e MSH-4↔MSH-6)
 * - Atualizar MSH-7 com o datetime atual (YYYYMMDDHHmmss)
 * - Definir MSH-9 como 'ACK'
 * - Gerar novo MSH-10 baseado no timestamp atual
 * - Incluir segmento MSA com ackCode, originalControlId e textMessage
 *
 * @param originalMSHSegment - String do segmento MSH original (segmento único)
 * @param ackCode - Código de acknowledgement ('AA', 'AE' ou 'AR')
 * @param textMessage - Mensagem de texto opcional para MSA-3 (default '')
 * @returns String da mensagem ACK completa (MSH + MSA separados por \r)
 */
export function buildACK(
  originalMSHSegment: string,
  ackCode: 'AA' | 'AE' | 'AR',
  textMessage: string = ''
): string {
  parseHL7Segment(originalMSHSegment)

  const sendingApp = extractFieldValue(originalMSHSegment, 3) ?? ''
  const sendingFac = extractFieldValue(originalMSHSegment, 4) ?? ''
  const receivingApp = extractFieldValue(originalMSHSegment, 5) ?? ''
  const receivingFac = extractFieldValue(originalMSHSegment, 6) ?? ''
  const originalControlId = extractFieldValue(originalMSHSegment, 10) ?? ''
  const processingId = extractFieldValue(originalMSHSegment, 11) ?? 'P'
  const versionId = extractFieldValue(originalMSHSegment, 12) ?? '2.5'

  const now = new Date()
  const pad = (n: number) => n.toString().padStart(2, '0')
  const datetime = [
    now.getFullYear(),
    pad(now.getMonth() + 1),
    pad(now.getDate()),
    pad(now.getHours()),
    pad(now.getMinutes()),
    pad(now.getSeconds()),
  ].join('')

  const newControlId = datetime

  let ackMSH = originalMSHSegment
  ackMSH = setFieldValue(ackMSH, 3, receivingApp)
  ackMSH = setFieldValue(ackMSH, 4, receivingFac)
  ackMSH = setFieldValue(ackMSH, 5, sendingApp)
  ackMSH = setFieldValue(ackMSH, 6, sendingFac)
  ackMSH = setFieldValue(ackMSH, 7, datetime)
  ackMSH = setFieldValue(ackMSH, 8, '')
  ackMSH = setFieldValue(ackMSH, 9, 'ACK')
  ackMSH = setFieldValue(ackMSH, 10, newControlId)
  ackMSH = setFieldValue(ackMSH, 11, processingId)
  ackMSH = setFieldValue(ackMSH, 12, versionId)

  const msaSegment = createHL7Segment('MSA', [
    ackCode,
    originalControlId,
    textMessage,
  ])

  return `${ackMSH}\r${msaSegment}`
}
