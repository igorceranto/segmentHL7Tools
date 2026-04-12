import { describe, expect, it } from 'vitest'
import { createHL7Segment, parseHL7Segment } from '../functions/parser'

describe('parseHL7Segment', () => {
  describe('casos válidos', () => {
    it('deve parsear segmento MSH simples', () => {
      const result = parseHL7Segment('MSH|^~\\&|SENDING_APP|SENDING_FACILITY')

      expect(result.segmentType).toBe('MSH')
      expect(result.field1).toBe('^~\\&')
      expect(result.field2).toBe('SENDING_APP')
      expect(result.field3).toBe('SENDING_FACILITY')
    })

    it('deve parsear segmento MSH completo com 12 campos', () => {
      const segment =
        'MSH|^~\\&|SENDING_APP|SENDING_FAC|RECEIVING_APP|RECEIVING_FAC|20231201120000||ADT^A01|MSG00001|P|2.5'
      const result = parseHL7Segment(segment)

      expect(result.segmentType).toBe('MSH')
      expect(result.field1).toBe('^~\\&')
      expect(result.field8).toBe('ADT^A01')
      expect(result.field9).toBe('MSG00001')
      expect(result.field11).toBe('2.5')
    })

    it('deve parsear segmento PID com subcomponentes (^)', () => {
      const result = parseHL7Segment('PID|1|12345|SMITH^JOHN^A|19800101|M')

      expect(result.segmentType).toBe('PID')
      expect(result.field3).toBe('SMITH^JOHN^A')
      expect(result.field4).toBe('19800101')
    })

    it('deve parsear segmento com campos vazios intermediários', () => {
      const result = parseHL7Segment('PID|1||SMITH^JOHN||19800101')

      expect(result.segmentType).toBe('PID')
      expect(result.field1).toBe('1')
      expect(result.field2).toBe('')
      expect(result.field3).toBe('SMITH^JOHN')
      expect(result.field4).toBe('')
      expect(result.field5).toBe('19800101')
    })

    it('deve parsear segmento PV1 com repetições (~)', () => {
      const result = parseHL7Segment('PV1|1|I|2000^2012^01~3000^3001^02')

      expect(result.segmentType).toBe('PV1')
      expect(result.field3).toBe('2000^2012^01~3000^3001^02')
    })

    it('deve parsear segmento com apenas o tipo e um campo', () => {
      const result = parseHL7Segment('EVN|A01')

      expect(result.segmentType).toBe('EVN')
      expect(result.field1).toBe('A01')
    })

    it('deve retornar objeto tipado com segmentType', () => {
      const result = parseHL7Segment('OBR|1|ORDER123')

      expect(typeof result.segmentType).toBe('string')
      expect(result.segmentType).toBe('OBR')
    })
  })

  describe('casos inválidos', () => {
    it('deve lançar erro para string vazia', () => {
      expect(() => parseHL7Segment('')).toThrow(
        'Segmento HL7 deve ser uma string válida'
      )
    })

    it('deve lançar erro para null', () => {
      expect(() => parseHL7Segment(null as unknown as string)).toThrow(
        'Segmento HL7 deve ser uma string válida'
      )
    })

    it('deve lançar erro para undefined', () => {
      expect(() => parseHL7Segment(undefined as unknown as string)).toThrow(
        'Segmento HL7 deve ser uma string válida'
      )
    })

    it('deve lançar erro para número', () => {
      expect(() => parseHL7Segment(123 as unknown as string)).toThrow(
        'Segmento HL7 deve ser uma string válida'
      )
    })
  })
})

describe('createHL7Segment', () => {
  describe('casos válidos', () => {
    it('deve criar segmento PID com campos', () => {
      const result = createHL7Segment('PID', ['1', '12345', 'SMITH^JOHN'])

      expect(result).toBe('PID|1|12345|SMITH^JOHN')
    })

    it('deve criar segmento MSH com encoding chars', () => {
      const result = createHL7Segment('MSH', [
        '^~\\&',
        'APP',
        'FAC',
        '',
        '',
        '20231201',
      ])

      expect(result).toBe('MSH|^~\\&|APP|FAC|||20231201')
    })

    it('deve criar segmento com array vazio', () => {
      const result = createHL7Segment('EVN', [])

      expect(result).toBe('EVN')
    })

    it('deve preservar campos vazios intermediários', () => {
      const result = createHL7Segment('PID', ['1', '', 'SMITH^JOHN'])

      expect(result).toBe('PID|1||SMITH^JOHN')
    })

    it('deve criar segmento com subcomponentes e repetições', () => {
      const result = createHL7Segment('OBX', [
        '1',
        'NM',
        '8302-2^Body height^LN',
        '',
        '175',
        'cm',
      ])

      expect(result).toBe('OBX|1|NM|8302-2^Body height^LN||175|cm')
    })
  })

  describe('casos inválidos', () => {
    it('deve lançar erro para tipo de segmento vazio', () => {
      expect(() => createHL7Segment('', [])).toThrow(
        'Tipo de segmento deve ser uma string válida'
      )
    })

    it('deve lançar erro para tipo de segmento null', () => {
      expect(() => createHL7Segment(null as unknown as string, [])).toThrow(
        'Tipo de segmento deve ser uma string válida'
      )
    })

    it('deve lançar erro para campos null', () => {
      expect(() =>
        createHL7Segment('PID', null as unknown as string[])
      ).toThrow('Campos devem ser um array')
    })

    it('deve lançar erro para campos não-array', () => {
      expect(() =>
        createHL7Segment('PID', 'campo' as unknown as string[])
      ).toThrow('Campos devem ser um array')
    })
  })
})
