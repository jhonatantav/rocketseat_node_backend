import fastify from 'fastify'
import cookie from '@fastify/cookie'
import { rotasDeTransacoes } from './routes/transacoes'

export const app = fastify()

app.register(cookie)

app.register(rotasDeTransacoes, {
  prefix: 'transacoes',
})
