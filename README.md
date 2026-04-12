# segmentHL7Tools

Ferramentas para manipulação de segmentos HL7 (Health Level 7) em TypeScript/JavaScript.

## Instalação

```bash
npm install segmenthl7tools
```

## Uso

### Importação

```typescript
// ES Modules
import { parseHL7Segment, createHL7Segment, validateHL7Segment, extractFieldValue, setFieldValue } from 'segmenthl7tools';

// CommonJS
const { parseHL7Segment, createHL7Segment, validateHL7Segment, extractFieldValue, setFieldValue } = require('segmenthl7tools');
```

### Exemplos de Uso

#### Parsear um segmento HL7

```typescript
import { parseHL7Segment } from 'segmenthl7tools';

const segment = "MSH|^~\\&|SENDING_APP|SENDING_FACILITY|RECEIVING_APP|RECEIVING_FACILITY|20231201120000||ADT^A01|MSG00001|P|2.5";
const parsed = parseHL7Segment(segment);

console.log(parsed.segmentType); // "MSH"
console.log(parsed.field1);      // "^~\\&"
console.log(parsed.field8);      // "ADT^A01"
console.log(parsed.field11);     // "2.5"
```

#### Criar um segmento HL7

```typescript
import { createHL7Segment } from 'segmenthl7tools';

const segment = createHL7Segment("PID", ["1", "12345", "SMITH^JOHN", "19800101", "M"]);
console.log(segment);
// Output: "PID|1|12345|SMITH^JOHN|19800101|M"
```

#### Validar um segmento HL7

O segmentType deve ter exatamente 3 caracteres alfanuméricos maiúsculos (ex: `MSH`, `PID`, `PV1`).

```typescript
import { validateHL7Segment } from 'segmenthl7tools';

console.log(validateHL7Segment("MSH|^~\\&|APP|FACILITY")); // true
console.log(validateHL7Segment("PID|1|12345"));             // true
console.log(validateHL7Segment(""));                         // false
console.log(validateHL7Segment("|APP|FACILITY"));            // false — sem tipo
console.log(validateHL7Segment("AB|campo"));                 // false — tipo com 2 chars
console.log(validateHL7Segment("pid|campo"));                // false — tipo em minúsculas
```

#### Extrair valor de um campo específico

Retorna `''` para campos que existem mas estão vazios, e `null` apenas quando o índice está além do range.

```typescript
import { extractFieldValue } from 'segmenthl7tools';

const segment = "PID|1|12345|SMITH^JOHN||M";

console.log(extractFieldValue(segment, 0)); // "PID"
console.log(extractFieldValue(segment, 1)); // "1"
console.log(extractFieldValue(segment, 3)); // "SMITH^JOHN"
console.log(extractFieldValue(segment, 4)); // "" — campo vazio
console.log(extractFieldValue(segment, 9)); // null — fora do range
```

#### Definir valor de um campo específico

```typescript
import { setFieldValue } from 'segmenthl7tools';

const segment = "PID|1|12345|SMITH^JOHN";
const updated = setFieldValue(segment, 2, "67890");
console.log(updated);
// Output: "PID|1|67890|SMITH^JOHN"

// Cria campos vazios intermediários se necessário
const withGap = setFieldValue("PID|1|12345", 5, "M");
console.log(withGap);
// Output: "PID|1|12345|||M"
```

## API Reference

### `parseHL7Segment(segment: string): ParsedHL7Segment`

Parseia um segmento HL7 e retorna um objeto com o `segmentType` e campos indexados como `field1`, `field2`, etc.

**Lança:** `Error` se o segmento for uma string vazia, null ou não-string.

---

### `createHL7Segment(segmentType: string, fields: string[]): string`

Cria um segmento HL7 a partir do tipo e campos fornecidos.

**Lança:** `Error` se `segmentType` for inválido ou `fields` não for um array.

---

### `validateHL7Segment(segment: string): boolean`

Valida se uma string é um segmento HL7 válido. O tipo do segmento deve ter exatamente 3 caracteres alfanuméricos maiúsculos (`/^[A-Z0-9]{3}$/`).

---

### `extractFieldValue(segment: string, fieldIndex: number): string | null`

Extrai o valor de um campo específico pelo índice (0-based).

- Retorna `''` para campos que existem mas estão vazios.
- Retorna `null` para índices fora do range ou segmento inválido.

---

### `setFieldValue(segment: string, fieldIndex: number, value: string): string`

Define o valor de um campo específico. Preenche campos intermediários com `''` se necessário.

**Lança:** `Error` se o segmento for inválido ou o índice for negativo.

---

### Tipos exportados

```typescript
import type { HL7Segment, ParsedHL7Segment } from 'segmenthl7tools';

// HL7Segment — estrutura para criar segmentos
interface HL7Segment {
  segmentType: string
  fields: string[]
}

// ParsedHL7Segment — retorno de parseHL7Segment
interface ParsedHL7Segment {
  segmentType: string
  [key: string]: string  // field1, field2, ...fieldN
}
```

## Desenvolvimento

### Pré-requisitos

- Node.js >= 20.0.0
- npm

### Instalação das dependências

```bash
npm install
```

### Scripts disponíveis

```bash
# Build do projeto
npm run build

# Desenvolvimento com watch
npm run dev

# Executar testes
npm test

# Executar testes com UI interativa
npm run test:ui

# Verificar cobertura de testes
npm run test:coverage

# Verificação de tipos TypeScript
npm run type-check

# Formatação de código com Biome
npm run biome:format

# Linting com Biome
npm run biome:lint

# Verificação completa com Biome
npm run biome:check

# Publicar release
npm run release
```

### Hooks do Git (Husky)

- **Pre-commit**: formatação, linting, verificação de tipos e testes
- **Pre-push**: build completo e testes com cobertura

### Ferramentas de Qualidade

- **Biome**: linting e formatação de código
- **Husky**: hooks do Git para automação
- **Vitest**: framework de testes com cobertura (threshold: 80%)
- **TypeScript**: verificação estática de tipos (strict mode)
- **GitHub Actions**: CI/CD automatizado

### Estrutura do projeto

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

examples/
└── basic-usage.ts

.github/
├── workflows/
│   └── ci.yml
└── dependabot.yml

.husky/
├── pre-commit
└── pre-push
```

## Licença

MIT License — veja o arquivo [LICENSE](LICENSE) para detalhes.

## Contribuição

Contribuições são bem-vindas! Por favor, abra uma issue ou pull request.

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/MinhaFeature`)
3. Commit suas mudanças (`git commit -m 'feat: adiciona MinhaFeature'`)
4. Push para a branch (`git push origin feature/MinhaFeature`)
5. Abra um Pull Request

## Suporte

- **Issues:** [GitHub Issues](https://github.com/igorceranto/segmentHL7Tools/issues)
- **Documentação:** [GitHub README](https://github.com/igorceranto/segmentHL7Tools#readme)

## Links Úteis

- [HL7 Standards](https://www.hl7.org/)
- [HL7 v2.x Implementation Guide](https://www.hl7.org/implement/standards/)
- [TypeScript Documentation](https://www.typescriptlang.org/)
- [Biome Documentation](https://biomejs.dev/)
- [Husky Documentation](https://typicode.github.io/husky/)
