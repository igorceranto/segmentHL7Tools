import { decodeHL7Escape, encodeHL7Escape } from '../functions/escape'

describe('decodeHL7Escape', () => {
  describe('escape sequences padrão', () => {
    it('decodifica \\F\\ para field separator padrão |', () => {
      expect(decodeHL7Escape('foo\\F\\bar')).toBe('foo|bar')
    })

    it('decodifica \\S\\ para component separator padrão ^', () => {
      expect(decodeHL7Escape('foo\\S\\bar')).toBe('foo^bar')
    })

    it('decodifica \\R\\ para repetition separator padrão ~', () => {
      expect(decodeHL7Escape('foo\\R\\bar')).toBe('foo~bar')
    })

    it('decodifica \\T\\ para subcomponent separator padrão &', () => {
      expect(decodeHL7Escape('foo\\T\\bar')).toBe('foo&bar')
    })

    it('decodifica \\E\\ para escape character padrão \\', () => {
      expect(decodeHL7Escape('foo\\E\\bar')).toBe('foo\\bar')
    })

    it('decodifica \\P\\ para truncation character padrão # (encodingChars com 5 chars)', () => {
      expect(decodeHL7Escape('foo\\P\\bar', '^~\\&#')).toBe('foo#bar')
    })
  })

  describe('encoding chars customizados', () => {
    const customEncoding = '^~|&'

    it('usa o component separator customizado para |S|', () => {
      // customEncoding tem '|' como escape char (pos 2), então sequências são |X|
      expect(decodeHL7Escape('foo|S|bar', customEncoding)).toBe('foo^bar')
    })

    it('usa o repetition separator customizado para |R|', () => {
      expect(decodeHL7Escape('foo|R|bar', customEncoding)).toBe('foo~bar')
    })

    it('usa o escape character customizado como delimitador de sequência', () => {
      // com encodingChars '^~|&' onde escape = '|', a sequência |F| → fieldSep ('!')
      expect(decodeHL7Escape('foo|F|bar', '^~|&', '!')).toBe('foo!bar')
    })
  })

  describe('fieldSeparator customizado', () => {
    it('usa o fieldSeparator informado para \\F\\', () => {
      expect(decodeHL7Escape('foo\\F\\bar', '^~\\&', '!')).toBe('foo!bar')
    })
  })

  describe('múltiplas escapes no mesmo valor', () => {
    it('decodifica várias escape sequences em sequência', () => {
      expect(decodeHL7Escape('\\F\\\\S\\\\R\\')).toBe('|^~')
    })

    it('decodifica múltiplas ocorrências da mesma sequence', () => {
      expect(decodeHL7Escape('a\\F\\b\\F\\c')).toBe('a|b|c')
    })

    it('decodifica escapes misturados com texto normal', () => {
      expect(decodeHL7Escape('Sobrenome\\S\\Nome\\R\\Apelido')).toBe(
        'Sobrenome^Nome~Apelido'
      )
    })
  })

  describe('preserva texto sem escapes', () => {
    it('retorna o valor inalterado se não houver escapes', () => {
      expect(decodeHL7Escape('texto simples')).toBe('texto simples')
    })

    it('retorna o valor inalterado com números', () => {
      expect(decodeHL7Escape('12345')).toBe('12345')
    })
  })

  describe('suporte a \\X.....\\ hexadecimal', () => {
    it('decodifica \\X41\\ para A', () => {
      // 'A' = 0x41 (byte único)
      expect(decodeHL7Escape('\\X41\\')).toBe('A')
    })

    it('decodifica múltiplos bytes hex', () => {
      // 'Hi' = 0x48 0x69
      expect(decodeHL7Escape('\\X4869\\')).toBe('Hi')
    })
  })

  describe('inputs inválidos', () => {
    it('retorna string vazia para string vazia', () => {
      expect(decodeHL7Escape('')).toBe('')
    })

    it('retorna string vazia para null', () => {
      expect(decodeHL7Escape(null as unknown as string)).toBe('')
    })

    it('retorna string vazia para undefined', () => {
      expect(decodeHL7Escape(undefined as unknown as string)).toBe('')
    })
  })
})

describe('encodeHL7Escape', () => {
  describe('escape de cada caractere especial', () => {
    it('escapa field separator |', () => {
      expect(encodeHL7Escape('foo|bar')).toBe('foo\\F\\bar')
    })

    it('escapa component separator ^', () => {
      expect(encodeHL7Escape('foo^bar')).toBe('foo\\S\\bar')
    })

    it('escapa repetition separator ~', () => {
      expect(encodeHL7Escape('foo~bar')).toBe('foo\\R\\bar')
    })

    it('escapa subcomponent separator &', () => {
      expect(encodeHL7Escape('foo&bar')).toBe('foo\\T\\bar')
    })

    it('escapa escape character \\', () => {
      expect(encodeHL7Escape('foo\\bar')).toBe('foo\\E\\bar')
    })

    it('escapa truncation character # quando presente em encodingChars', () => {
      expect(encodeHL7Escape('foo#bar', '^~\\&#')).toBe('foo\\P\\bar')
    })

    it('não escapa # quando encodingChars tem apenas 4 caracteres', () => {
      expect(encodeHL7Escape('foo#bar', '^~\\&')).toBe('foo#bar')
    })
  })

  describe('não double-encoda', () => {
    it('encode seguido de decode retorna o valor original com |', () => {
      const original = 'valor com | pipe'
      expect(decodeHL7Escape(encodeHL7Escape(original))).toBe(original)
    })

    it('encode seguido de decode retorna o valor original com ^', () => {
      const original = 'comp^onent'
      expect(decodeHL7Escape(encodeHL7Escape(original))).toBe(original)
    })

    it('encode seguido de decode retorna o valor original com \\', () => {
      const original = 'back\\slash'
      expect(decodeHL7Escape(encodeHL7Escape(original))).toBe(original)
    })

    it('encode seguido de decode retorna o valor original com &', () => {
      const original = 'sub&comp'
      expect(decodeHL7Escape(encodeHL7Escape(original))).toBe(original)
    })
  })

  describe('round-trip', () => {
    it('decode(encode(v)) === v para string com todos os especiais', () => {
      const value = 'a|b^c~d&e\\f'
      expect(decodeHL7Escape(encodeHL7Escape(value))).toBe(value)
    })

    it('decode(encode(v)) === v para string com caractere de truncação', () => {
      const value = 'a|b#c'
      const enc = '^~\\&#'
      expect(decodeHL7Escape(encodeHL7Escape(value, enc), enc)).toBe(value)
    })

    it('decode(encode(v)) === v para string simples sem especiais', () => {
      const value = 'texto normal sem especiais'
      expect(decodeHL7Escape(encodeHL7Escape(value))).toBe(value)
    })

    it('decode(encode(v)) === v com encoding chars customizados', () => {
      const value = 'foo|bar^baz~qux&quux'
      const enc = '^~\\&'
      const sep = '|'
      expect(decodeHL7Escape(encodeHL7Escape(value, enc, sep), enc, sep)).toBe(
        value
      )
    })
  })

  describe('inputs inválidos', () => {
    it('retorna string vazia para string vazia', () => {
      expect(encodeHL7Escape('')).toBe('')
    })

    it('retorna string vazia para null', () => {
      expect(encodeHL7Escape(null as unknown as string)).toBe('')
    })

    it('retorna string vazia para undefined', () => {
      expect(encodeHL7Escape(undefined as unknown as string)).toBe('')
    })
  })
})
