# segmentHL7Tools

<p align="center">
  <a href="https://www.npmjs.com/package/segmenthl7tools"><img src="https://img.shields.io/npm/v/segmenthl7tools?color=cb3837&label=npm" alt="npm version" /></a>
  <a href="https://www.npmjs.com/package/segmenthl7tools"><img src="https://img.shields.io/npm/dm/segmenthl7tools?color=cb3837" alt="npm downloads" /></a>
  <a href="https://github.com/igorceranto/segmentHL7Tools/actions/workflows/ci.yml"><img src="https://github.com/igorceranto/segmentHL7Tools/actions/workflows/ci.yml/badge.svg" alt="CI" /></a>
  <a href="https://codecov.io/gh/igorceranto/segmentHL7Tools"><img src="https://codecov.io/gh/igorceranto/segmentHL7Tools/branch/main/graph/badge.svg" alt="Coverage" /></a>
  <a href="https://github.com/igorceranto/segmentHL7Tools/blob/main/LICENSE"><img src="https://img.shields.io/github/license/igorceranto/segmentHL7Tools" alt="License" /></a>
  <a href="https://www.typescriptlang.org/"><img src="https://img.shields.io/badge/TypeScript-5.x-3178c6?logo=typescript&logoColor=white" alt="TypeScript" /></a>
</p>

<p align="center">
  Ferramentas leves para parsear, criar, validar e manipular segmentos HL7 v2.x em TypeScript e JavaScript.
</p>

---

## Sumário

- [Instalação](#instalação)
- [Início Rápido](#início-rápido)
- [API](#api)
  - [parseHL7Segment](#parsehl7segment)
  - [createHL7Segment](#createhl7segment)
  - [validateHL7Segment](#validatehl7segment)
  - [extractFieldValue](#extractfieldvalue)
  - [setFieldValue](#setfieldvalue)
  - [Tipos](#tipos)
- [Desenvolvimento](#desenvolvimento)
- [Contribuição](#contribuição)
- [Licença](#licença)

---

## Instalação

```bash
npm install segmenthl7tools
```

```bash
yarn add segmenthl7tools
```

```bash
pnpm add segmenthl7tools
```

> Requer **Node.js >= 20**. Compatível com ES Modules e CommonJS.

---

## Início Rápido

```typescript
import {
  parseHL7Segment,
  createHL7Segment,
  validateHL7Segment,
  extractFieldValue,
  setFieldValue,
} from 'segmenthl7tools'

// Parsear um segmento
const parsed = parseHL7Segment('PID|1|12345|SMITH^JOHN|19800101|M')
console.log(parsed.segmentType) // "PID"
console.log(parsed.field3)      // "SMITH^JOHN"

// Criar um segmento
const segment = createHL7Segment('PID', ['1', '12345', 'SMITH^JOHN'])
console.log(segment) // "PID|1|12345|SMITH^JOHN"

// Validar
console.log(validateHL7Segment('MSH|^~\\&|APP|FAC')) // true
console.log(validateHL7Segment(''))                    // false

// Extrair campo
console.log(extractFieldValue('PID|1|12345', 2)) // "12345"
console.log(extractFieldValue('PID|1|12345', 9)) // null

// Modificar campo
console.log(setFieldValue('PID|1|12345|SMITH^JOHN', 2, '99999'))
// "PID|1|99999|SMITH^JOHN"
```

---

## API

### `parseHL7Segment`

```typescript
parseHL7Segment(segment: string): ParsedHL7Segment
```

Parseia um segmento HL7 e retorna um objeto com `segmentType` e os campos indexados como `field1`, `field2`, ..., `fieldN`.

```typescript
const result = parseHL7Segment(
  'MSH|^~\\&|SENDING_APP|SENDING_FAC||RECEIVING_FAC|20231201||ADT^A01|MSG001|P|2.5'
)

result.segmentType // "MSH"
result.field1      // "^~\\&"
result.field8      // "ADT^A01"
result.field11     // "2.5"
```

> Lança `Error` se o argumento não for uma string válida.

---

### `createHL7Segment`

```typescript
createHL7Segment(segmentType: string, fields: string[]): string
```

Cria uma string de segmento HL7 a partir do tipo e de um array de campos.

```typescript
createHL7Segment('PID', ['1', '12345', 'SMITH^JOHN', '19800101', 'M'])
// "PID|1|12345|SMITH^JOHN|19800101|M"

// Campos vazios intermediários são preservados
createHL7Segment('PID', ['1', '', 'SMITH^JOHN'])
// "PID|1||SMITH^JOHN"

// Array vazio retorna apenas o tipo
createHL7Segment('EVN', [])
// "EVN"
```

> Lança `Error` se `segmentType` for inválido ou `fields` não for um array.

---

### `validateHL7Segment`

```typescript
validateHL7Segment(segment: string): boolean
```

Valida se uma string é um segmento HL7 bem formado. O tipo do segmento deve ter **exatamente 3 caracteres alfanuméricos maiúsculos** (`/^[A-Z0-9]{3}$/`).

| Entrada | Resultado | Motivo |
|---|---|---|
| `"MSH\|^~\\&\|APP\|FAC"` | `true` | Tipo válido |
| `"PID\|1\|12345"` | `true` | Tipo válido |
| `""` | `false` | String vazia |
| `"\|APP\|FAC"` | `false` | Sem tipo |
| `"AB\|campo"` | `false` | Tipo com 2 chars |
| `"MSSH\|campo"` | `false` | Tipo com 4 chars |
| `"pid\|campo"` | `false` | Tipo em minúsculas |

---

### `extractFieldValue`

```typescript
extractFieldValue(segment: string, fieldIndex: number): string | null
```

Extrai o valor de um campo pelo índice (0-based, onde 0 é o `segmentType`).

- Retorna `''` para campos que **existem mas estão vazios**
- Retorna `null` para índices **além do range** ou segmento inválido

```typescript
const seg = 'PID|1|12345|SMITH^JOHN||M'

extractFieldValue(seg, 0)  // "PID"
extractFieldValue(seg, 3)  // "SMITH^JOHN"
extractFieldValue(seg, 4)  // "" — campo vazio
extractFieldValue(seg, 9)  // null — fora do range
extractFieldValue('', 0)   // null — segmento inválido
```

---

### `setFieldValue`

```typescript
setFieldValue(segment: string, fieldIndex: number, value: string): string
```

Define o valor de um campo específico. Preenche campos intermediários com `''` automaticamente se o índice estiver além do tamanho atual do segmento.

```typescript
setFieldValue('PID|1|12345|SMITH^JOHN', 2, '99999')
// "PID|1|99999|SMITH^JOHN"

// Cria campos vazios intermediários se necessário
setFieldValue('PID|1|12345', 5, 'M')
// "PID|1|12345|||M"

// Altera o tipo do segmento (índice 0)
setFieldValue('PID|1|12345', 0, 'NK1')
// "NK1|1|12345"
```

> Lança `Error` se o segmento for inválido ou o índice for negativo.

---

### Tipos

```typescript
import type { HL7Segment, ParsedHL7Segment } from 'segmenthl7tools'
```

```typescript
/** Estrutura para representar um segmento HL7 */
interface HL7Segment {
  segmentType: string
  fields: string[]
}

/** Retorno de parseHL7Segment */
interface ParsedHL7Segment {
  segmentType: string
  [key: string]: string // field1, field2, ...fieldN
}
```

---

## Desenvolvimento

### Pré-requisitos

- Node.js >= 20
- npm

### Setup

```bash
git clone https://github.com/igorceranto/segmentHL7Tools.git
cd segmentHL7Tools
npm install
```

### Scripts

| Comando | Descrição |
|---|---|
| `npm run build` | Build CJS + ESM + tipos |
| `npm run dev` | Watch mode |
| `npm test` | Rodar testes |
| `npm run test:ui` | Testes com UI interativa |
| `npm run test:coverage` | Testes com relatório de cobertura |
| `npm run type-check` | Verificação de tipos TypeScript |
| `npm run biome:format` | Formatar código |
| `npm run biome:lint` | Linting |
| `npm run biome:check` | Lint + format juntos |
| `npm run release` | Criar e publicar release |

### Estrutura

```
src/
├── __tests__/
│   ├── field-operations.test.ts
│   ├── parser.test.ts
│   └── validation.test.ts
├── functions/
│   ├── field-operations.ts
│   ├── index.ts
│   ├── parser.ts
│   └── validation.ts
├── types/
│   ├── hl7.ts
│   └── index.ts
└── index.ts
```

### Qualidade

O projeto usa automações para garantir a qualidade do código:

- **Biome** — linting e formatação
- **Vitest** — testes com threshold de cobertura em 80%
- **TypeScript strict** — verificação estática de tipos
- **Husky** — hooks de pre-commit e pre-push
- **GitHub Actions** — CI/CD em cada push e release

---

## Contribuição

Contribuições são bem-vindas!

1. Faça um fork do projeto
2. Crie sua branch (`git checkout -b feature/minha-feature`)
3. Faça commit das mudanças (`git commit -m 'feat: adiciona minha feature'`)
4. Push para a branch (`git push origin feature/minha-feature`)
5. Abra um Pull Request

Bugs e sugestões via [Issues](https://github.com/igorceranto/segmentHL7Tools/issues).

---

## Licença

[MIT](LICENSE) © [ICeranto](https://github.com/igorceranto)
