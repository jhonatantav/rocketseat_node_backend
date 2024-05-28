// env/index.ts
import { config } from 'dotenv'
import { z } from 'zod'

if (process.env.NODE_ENV === 'test') {
  config({ path: '.env.test' })
} else {
  config()
}

const envSchema = z.object({
  NODE_ENV: z.enum(['test', 'desenvolvimento', 'produção']).default('produção'),
  DATABASE_CLIENT: z.enum(['sqlite', 'pg'])
  DATABASE_URL: z.string(),
  PORT: z.coerce.number().default(3333),
})

const _env = envSchema.safeParse(process.env)

if (_env.success === false) {
  console.error('Falha na importação de alguma variável', _env.error.format())
  throw new Error('Variável inválida selecionada!')
}

export const env = _env.data

console.log('Configurações de ambiente carregadas:', env)
