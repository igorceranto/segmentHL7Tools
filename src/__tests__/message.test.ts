import { describe, expect, it } from 'vitest'
import { createHL7Message, parseHL7Message } from '../functions/message'

const ADT_A01 =
  'MSH|^~\\&|SENDING|FACILITY|RECEIVING|FACILITY|20230601120000||ADT^A01|123456|P|2.5\r' +
  'PID|1||123456789^^^MRN||SILVA^JOAO^CARLOS||19850315|M|||RUA DAS FLORES^100^^SAO PAULO^SP^01234-567^BR\r' +
  'PV1|1|I|WARD^201^01|||||||CARDIOLOGY||||||||123456|IN||||||||||||||||||||||||20230601110000'

describe('parseHL7Message', () => {
  describe('mensagem ADT^A01 completa (MSH + PID + PV1)', () => {
    it('deve parsear os três segmentos', () => {
      const msg = parseHL7Message(ADT_A01)

      expect(msg.segments).toHaveLength(3)
      expect(msg.segments[0]?.segmentType).toBe('MSH')
      expect(msg.segments[1]?.segmentType).toBe('PID')
      expect(msg.segments[2]?.segmentType).toBe('PV1')
    })

    it('deve ler fieldSeparator do MSH-1', () => {
      const msg = parseHL7Message(ADT_A01)

      expect(msg.fieldSeparator).toBe('|')
    })

    it('deve ler encodingChars do MSH-2', () => {
      const msg = parseHL7Message(ADT_A01)

      expect(msg.encodingChars).toBe('^~\\&')
    })
  })

  describe('terminadores de segmento', () => {
    const base = 'MSH|^~\\&|S|F|R|F|20230601||ADT^A01|1|P|2.5\rPID|1||123'

    it('deve aceitar \\r como terminador', () => {
      const msg = parseHL7Message(base)

      expect(msg.segments).toHaveLength(2)
    })

    it('deve aceitar \\n como terminador', () => {
      const withLF = base.replace(/\r/g, '\n')
      const msg = parseHL7Message(withLF)

      expect(msg.segments).toHaveLength(2)
    })

    it('deve aceitar \\r\\n como terminador', () => {
      const withCRLF = base.replace(/\r/g, '\r\n')
      const msg = parseHL7Message(withCRLF)

      expect(msg.segments).toHaveLength(2)
    })
  })

  describe('linhas inválidas', () => {
    it('deve ignorar linhas vazias', () => {
      const msg = parseHL7Message(
        'MSH|^~\\&|S|F|R|F|20230601||ADT^A01|1|P|2.5\r\rPID|1||123'
      )

      expect(msg.segments).toHaveLength(2)
    })

    it('deve ignorar segmentos com segment ID inválido', () => {
      const msg = parseHL7Message(
        'MSH|^~\\&|S|F|R|F|20230601||ADT^A01|1|P|2.5\rXX|invalido\rPID|1||123'
      )

      expect(msg.segments).toHaveLength(2)
    })

    it('deve ignorar linhas com apenas espaços', () => {
      const msg = parseHL7Message(
        'MSH|^~\\&|S|F|R|F|20230601||ADT^A01|1|P|2.5\r   \rPID|1||123'
      )

      expect(msg.segments).toHaveLength(2)
    })
  })

  describe('getSegment', () => {
    it('deve retornar o primeiro segmento do tipo informado', () => {
      const msg = parseHL7Message(ADT_A01)

      const pid = msg.getSegment('PID')
      expect(pid).not.toBeNull()
      expect(pid?.segmentType).toBe('PID')
    })

    it('deve retornar null para tipo inexistente', () => {
      const msg = parseHL7Message(ADT_A01)

      expect(msg.getSegment('ZZZ')).toBeNull()
      expect(msg.getSegment('OBX')).toBeNull()
    })

    it('deve retornar o primeiro quando há múltiplos do mesmo tipo', () => {
      const twoNTE =
        'MSH|^~\\&|S|F|R|F|20230601||ADT^A01|1|P|2.5\r' +
        'NTE|1|comentario um\r' +
        'NTE|2|comentario dois'
      const msg = parseHL7Message(twoNTE)

      const nte = msg.getSegment('NTE')
      expect(nte?.field1).toBe('1')
    })
  })

  describe('getSegments', () => {
    it('deve retornar todos os segmentos do tipo informado', () => {
      const twoNTE =
        'MSH|^~\\&|S|F|R|F|20230601||ADT^A01|1|P|2.5\r' +
        'NTE|1|um\r' +
        'NTE|2|dois\r' +
        'NTE|3|tres'
      const msg = parseHL7Message(twoNTE)

      const ntes = msg.getSegments('NTE')
      expect(ntes).toHaveLength(3)
      expect(ntes[0]?.field1).toBe('1')
      expect(ntes[1]?.field1).toBe('2')
      expect(ntes[2]?.field1).toBe('3')
    })

    it('deve retornar array vazio para tipo inexistente', () => {
      const msg = parseHL7Message(ADT_A01)

      expect(msg.getSegments('OBX')).toEqual([])
    })
  })

  describe('defaults quando não há MSH', () => {
    it('deve usar | como fieldSeparator padrão', () => {
      const msg = parseHL7Message('PID|1||123')

      expect(msg.fieldSeparator).toBe('|')
    })

    it('deve usar ^~\\& como encodingChars padrão', () => {
      const msg = parseHL7Message('PID|1||123')

      expect(msg.encodingChars).toBe('^~\\&')
    })
  })

  describe('erros de input inválido', () => {
    it('deve lançar erro para string vazia', () => {
      expect(() => parseHL7Message('')).toThrow()
    })

    it('deve lançar erro para null', () => {
      // @ts-expect-error testando input inválido em runtime
      expect(() => parseHL7Message(null)).toThrow()
    })

    it('deve lançar erro para undefined', () => {
      // @ts-expect-error testando input inválido em runtime
      expect(() => parseHL7Message(undefined)).toThrow()
    })
  })
})

describe('createHL7Message', () => {
  it('deve juntar segmentos com \\r', () => {
    const result = createHL7Message([
      'MSH|^~\\&|S|F|R|F|20230601||ADT^A01|1|P|2.5',
      'PID|1||123',
    ])

    expect(result).toBe(
      'MSH|^~\\&|S|F|R|F|20230601||ADT^A01|1|P|2.5\rPID|1||123\r'
    )
  })

  it('deve adicionar \\r no final da mensagem', () => {
    const result = createHL7Message(['PID|1||123'])

    expect(result.endsWith('\r')).toBe(true)
  })

  it('deve filtrar segmentos vazios', () => {
    const result = createHL7Message(['PID|1||123', '', 'PV1|1|I'])

    expect(result).toBe('PID|1||123\rPV1|1|I\r')
  })

  it('deve lançar erro para segmento inválido', () => {
    expect(() => createHL7Message(['PID|1||123', 'xx|invalido'])).toThrow()
  })

  it('deve lançar erro para segmento com segment ID curto demais', () => {
    expect(() => createHL7Message(['PI|1||123'])).toThrow()
  })

  it('deve aceitar segmentos Z customizados', () => {
    const result = createHL7Message([
      'MSH|^~\\&|S|F|R|F|20230601||ADT^A01|1|P|2.5',
      'ZPD|dados customizados',
    ])

    expect(result).toContain('ZPD|dados customizados')
  })
})
