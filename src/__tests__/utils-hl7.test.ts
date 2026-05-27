import { describe, expect, it } from 'vitest'
import {
  buildACK,
  getMessageControlId,
  getMessageType,
  getPatientId,
} from '../functions/utils-hl7'

const ADT_A01_MESSAGE = [
  'MSH|^~\\&|SendApp|SendFac|RecvApp|RecvFac|20240101120000||ADT^A01|CTRL001|P|2.5',
  'EVN|A01|20240101120000',
  'PID|1||PAT123^^^MRN||Smith^John^A||19800101|M',
  'PV1|1|I|2B^202^1',
].join('\r')

const MSH_SEGMENT =
  'MSH|^~\\&|SendApp|SendFac|RecvApp|RecvFac|20240101120000||ADT^A01|CTRL001|P|2.5'

describe('getMessageType', () => {
  it('retorna o tipo da mensagem ADT^A01', () => {
    expect(getMessageType(ADT_A01_MESSAGE)).toBe('ADT^A01')
  })

  it('retorna null para mensagem sem MSH', () => {
    const noMSH = 'PID|1||PAT123|||Smith^John\rEVN|A01|20240101'
    expect(getMessageType(noMSH)).toBeNull()
  })

  it('retorna null para string vazia', () => {
    expect(getMessageType('')).toBeNull()
  })

  it('retorna null se MSH-9 estiver vazio', () => {
    const msg =
      'MSH|^~\\&|SendApp|SendFac|RecvApp|RecvFac|20240101120000|||CTRL001|P|2.5'
    expect(getMessageType(msg)).toBeNull()
  })

  it('extrai tipo de mensagem ORU^R01', () => {
    const msg =
      'MSH|^~\\&|LAB|LABFac|RIS|RISFac|20240601080000||ORU^R01|MSG999|P|2.5'
    expect(getMessageType(msg)).toBe('ORU^R01')
  })
})

describe('getMessageControlId', () => {
  it('extrai o message control ID corretamente', () => {
    expect(getMessageControlId(ADT_A01_MESSAGE)).toBe('CTRL001')
  })

  it('retorna null para mensagem sem MSH', () => {
    const noMSH = 'PID|1||PAT123\rEVN|A01|20240101'
    expect(getMessageControlId(noMSH)).toBeNull()
  })

  it('retorna null para string vazia', () => {
    expect(getMessageControlId('')).toBeNull()
  })

  it('extrai ID diferente', () => {
    const msg =
      'MSH|^~\\&|App|Fac|App2|Fac2|20240101120000||ADT^A01|ID-XYZ-999|P|2.5'
    expect(getMessageControlId(msg)).toBe('ID-XYZ-999')
  })
})

describe('getPatientId', () => {
  it('retorna o patient ID (PID-3) quando PID está presente', () => {
    expect(getPatientId(ADT_A01_MESSAGE)).toBe('PAT123^^^MRN')
  })

  it('retorna null quando não há segmento PID', () => {
    const msg =
      'MSH|^~\\&|SendApp|SendFac|RecvApp|RecvFac|20240101120000||ACK|CTRL001|P|2.5\rMSA|AA|CTRL001'
    expect(getPatientId(msg)).toBeNull()
  })

  it('retorna null para string vazia', () => {
    expect(getPatientId('')).toBeNull()
  })

  it('retorna null quando PID-3 está vazio', () => {
    const msg =
      'MSH|^~\\&|A|B|C|D|20240101||ADT^A01|ID001|P|2.5\rPID|1|||Smith^John'
    expect(getPatientId(msg)).toBeNull()
  })
})

describe('buildACK', () => {
  it('gera uma mensagem ACK com MSH e MSA', () => {
    const ack = buildACK(MSH_SEGMENT, 'AA')
    const parts = ack.split('\r')
    expect(parts).toHaveLength(2)
    expect(parts[0]).toMatch(/^MSH\|/)
    expect(parts[1]).toMatch(/^MSA\|/)
  })

  it('gera ACK com ackCode AA', () => {
    const ack = buildACK(MSH_SEGMENT, 'AA')
    const msaLine = ack.split('\r')[1]
    expect(msaLine).toMatch(/^MSA\|AA\|/)
  })

  it('gera ACK com ackCode AE', () => {
    const ack = buildACK(MSH_SEGMENT, 'AE')
    const msaLine = ack.split('\r')[1]
    expect(msaLine).toMatch(/^MSA\|AE\|/)
  })

  it('gera ACK com ackCode AR', () => {
    const ack = buildACK(MSH_SEGMENT, 'AR')
    const msaLine = ack.split('\r')[1]
    expect(msaLine).toMatch(/^MSA\|AR\|/)
  })

  it('preserva o original control ID no MSA-2', () => {
    const ack = buildACK(MSH_SEGMENT, 'AA')
    const msaLine = ack.split('\r')[1]
    expect(msaLine).toContain('|CTRL001|')
  })

  it('inclui textMessage no MSA-3 quando fornecido', () => {
    const ack = buildACK(MSH_SEGMENT, 'AA', 'Mensagem aceita com sucesso')
    const msaLine = ack.split('\r')[1]
    expect(msaLine).toBe('MSA|AA|CTRL001|Mensagem aceita com sucesso')
  })

  it('MSA-3 vazio quando textMessage não fornecido', () => {
    const ack = buildACK(MSH_SEGMENT, 'AA')
    const msaLine = ack.split('\r')[1]
    expect(msaLine).toBe('MSA|AA|CTRL001|')
  })

  it('inverte sending e receiving application (MSH-3↔MSH-5)', () => {
    const ack = buildACK(MSH_SEGMENT, 'AA')
    const mshLine = ack.split('\r')[0]
    // split('|'): [0]=MSH, [1]=^~\&, [2]=MSH-3, [3]=MSH-4, [4]=MSH-5, [5]=MSH-6, ...
    const fields = mshLine.split('|')
    // MSH-3 no ACK deve ser RecvApp (original MSH-5)
    expect(fields[2]).toBe('RecvApp')
    // MSH-5 no ACK deve ser SendApp (original MSH-3)
    expect(fields[4]).toBe('SendApp')
  })

  it('inverte sending e receiving facility (MSH-4↔MSH-6)', () => {
    const ack = buildACK(MSH_SEGMENT, 'AA')
    const mshLine = ack.split('\r')[0]
    const fields = mshLine.split('|')
    // MSH-4 no ACK deve ser RecvFac (original MSH-6)
    expect(fields[3]).toBe('RecvFac')
    // MSH-6 no ACK deve ser SendFac (original MSH-4)
    expect(fields[5]).toBe('SendFac')
  })

  it('define MSH-9 como ACK', () => {
    const ack = buildACK(MSH_SEGMENT, 'AA')
    const mshLine = ack.split('\r')[0]
    // split('|'): [8]=MSH-9
    const fields = mshLine.split('|')
    expect(fields[8]).toBe('ACK')
  })

  it('gera novo MSH-10 baseado no timestamp atual', () => {
    const ack = buildACK(MSH_SEGMENT, 'AA')
    const mshLine = ack.split('\r')[0]
    // split('|'): [9]=MSH-10
    const fields = mshLine.split('|')
    // Novo control ID é diferente do original
    expect(fields[9]).not.toBe('CTRL001')
    // Novo control ID tem 14 dígitos (YYYYMMDDHHmmss)
    expect(fields[9]).toMatch(/^\d{14}$/)
  })

  it('preserva encoding characters no MSH-2', () => {
    const ack = buildACK(MSH_SEGMENT, 'AA')
    const mshLine = ack.split('\r')[0]
    // split('|'): [1]=MSH-2 (encoding chars)
    const fields = mshLine.split('|')
    expect(fields[1]).toBe('^~\\&')
  })
})
