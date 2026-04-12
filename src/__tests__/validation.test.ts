import { describe, expect, it } from 'vitest'
import { validateHL7Segment } from '../functions/validation'

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

    it('deve aceitar segmento OBX com campo numérico', () => {
      expect(validateHL7Segment('OBX|1|NM|8302-2^Body height^LN||175|cm')).toBe(
        true
      )
    })

    it('deve aceitar segmento com tipo numérico (ZZ1)', () => {
      expect(validateHL7Segment('ZZ1|campo1|campo2')).toBe(true)
    })

    it('deve aceitar segmento apenas com tipo e sem pipe (MSH)', () => {
      expect(validateHL7Segment('MSH')).toBe(true)
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

    it('deve rejeitar segmento com tipo começando por pipe (sem tipo)', () => {
      expect(validateHL7Segment('|APP|FACILITY')).toBe(false)
    })

    it('deve rejeitar tipo com 2 caracteres (AB)', () => {
      expect(validateHL7Segment('AB|campo')).toBe(false)
    })

    it('deve rejeitar tipo com 4 caracteres (MSSH)', () => {
      expect(validateHL7Segment('MSSH|campo')).toBe(false)
    })

    it('deve rejeitar tipo em minúsculas (pid)', () => {
      expect(validateHL7Segment('pid|campo')).toBe(false)
    })

    it('deve rejeitar tipo com caractere especial (MS$)', () => {
      expect(validateHL7Segment('MS$|campo')).toBe(false)
    })

    it('deve rejeitar tipo com espaço', () => {
      expect(validateHL7Segment('MS |campo')).toBe(false)
    })
  })
})
