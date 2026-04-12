import { describe, expect, it } from 'vitest'
import { normalizeSegment, validateHL7Segment } from '../functions/validation'

describe('normalizeSegment', () => {
  it('deve remover carriage return do final (terminador HL7)', () => {
    expect(normalizeSegment('PID|1|12345\r')).toBe('PID|1|12345')
  })

  it('deve remover espaços nas extremidades', () => {
    expect(normalizeSegment('  PID|1|12345  ')).toBe('PID|1|12345')
  })

  it('deve remover \\r e espaços combinados', () => {
    expect(normalizeSegment('  MSH|^~\\&|APP|FAC  \r')).toBe(
      'MSH|^~\\&|APP|FAC'
    )
  })

  it('deve preservar espaços internos ao segmento', () => {
    expect(normalizeSegment('PID|1|12345|SMITH JOHN')).toBe(
      'PID|1|12345|SMITH JOHN'
    )
  })

  it('deve retornar string vazia para input vazio', () => {
    expect(normalizeSegment('')).toBe('')
  })
})

describe('validateHL7Segment', () => {
  describe('segmentos válidos', () => {
    it('deve aceitar segmento MSH com encoding chars', () => {
      expect(validateHL7Segment('MSH|^~\\&|APP|FACILITY')).toBe(true)
    })

    it('deve aceitar segmento PID com campos', () => {
      expect(validateHL7Segment('PID|1|12345')).toBe(true)
    })

    it('deve aceitar segmento PV1', () => {
      expect(validateHL7Segment('PV1|1|I|2000^2012^01')).toBe(true)
    })

    it('deve aceitar segmento EVN', () => {
      expect(validateHL7Segment('EVN|A01|20231201120000')).toBe(true)
    })

    it('deve aceitar segmento OBX', () => {
      expect(validateHL7Segment('OBX|1|NM|8302-2^Body height^LN||175|cm')).toBe(
        true
      )
    })

    it('deve aceitar Z-segment (extensão local)', () => {
      expect(validateHL7Segment('ZPD|campo1|campo2')).toBe(true)
      expect(validateHL7Segment('ZAL|campo1')).toBe(true)
    })

    it('deve aceitar segmento com dígito no tipo (OB1, NK1)', () => {
      expect(validateHL7Segment('NK1|1|SMITH^JANE')).toBe(true)
      expect(validateHL7Segment('OB1|campo')).toBe(true)
    })

    it('deve aceitar segmento apenas com tipo sem pipe', () => {
      expect(validateHL7Segment('MSH')).toBe(true)
      expect(validateHL7Segment('EVN')).toBe(true)
    })

    it('deve aceitar segmento com \\r no final (terminador HL7)', () => {
      expect(validateHL7Segment('PID|1|12345\r')).toBe(true)
    })

    it('deve aceitar segmento com espaços nas extremidades', () => {
      expect(validateHL7Segment('  PID|1|12345  ')).toBe(true)
    })

    it('deve aceitar segmento com \\r e espaços combinados', () => {
      expect(validateHL7Segment('  MSH|^~\\&|APP  \r')).toBe(true)
    })
  })

  describe('segmentos inválidos', () => {
    it('deve rejeitar string vazia', () => {
      expect(validateHL7Segment('')).toBe(false)
    })

    it('deve rejeitar null', () => {
      expect(validateHL7Segment(null as unknown as string)).toBe(false)
    })

    it('deve rejeitar undefined', () => {
      expect(validateHL7Segment(undefined as unknown as string)).toBe(false)
    })

    it('deve rejeitar segmento sem tipo (começa com pipe)', () => {
      expect(validateHL7Segment('|APP|FACILITY')).toBe(false)
    })

    it('deve rejeitar tipo com 2 caracteres', () => {
      expect(validateHL7Segment('AB|campo')).toBe(false)
    })

    it('deve rejeitar tipo com 4 caracteres', () => {
      expect(validateHL7Segment('MSSH|campo')).toBe(false)
    })

    it('deve rejeitar tipo em minúsculas', () => {
      expect(validateHL7Segment('pid|campo')).toBe(false)
    })

    it('deve rejeitar tipo misto maiúsculas/minúsculas', () => {
      expect(validateHL7Segment('Pid|campo')).toBe(false)
    })

    it('deve rejeitar tipo com caractere especial', () => {
      expect(validateHL7Segment('MS$|campo')).toBe(false)
    })

    it('deve rejeitar tipo com espaço', () => {
      expect(validateHL7Segment('MS |campo')).toBe(false)
    })

    it('deve rejeitar string só com \\r', () => {
      expect(validateHL7Segment('\r')).toBe(false)
    })

    it('deve rejeitar string só com espaços', () => {
      expect(validateHL7Segment('   ')).toBe(false)
    })
  })
})
