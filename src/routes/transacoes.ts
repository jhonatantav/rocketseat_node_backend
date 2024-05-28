import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import crypto, { randomUUID } from 'node:crypto'
import { knex } from '../database'
import { checkSessionIdExist } from '../middlewares/check-id-exist'

export async function rotasDeTransacoes(app: FastifyInstance) {
  app.get(
    '/',
    {
      preHandler: [checkSessionIdExist],
    },
    async (request, reply) => {
      const { sessionId } = request.cookies

      const transacoes = await knex('transacoes')
        .where('session_id', sessionId)
        .select()

      return { transacoes }
    },
  )

  app.get(
    '/:id',
    {
      preHandler: [checkSessionIdExist],
    },
    async (request) => {
      const transacaoParamsSchema = z.object({
        id: z.string().uuid(),
      })

      const { id } = transacaoParamsSchema.parse(request.params)

      const { sessionId } = request.cookies

      const transacao = await knex('transacoes')
        .where({
          id,
          session_id: sessionId,
        })
        .first()

      return { transacao }
    },
  )

  app.get(
    '/resumo',
    {
      preHandler: [checkSessionIdExist],
    },
    async (request) => {
      const { sessionId } = request.cookies

      const resumo = await knex('transacoes')
        .where('session_id', sessionId)
        .sum('amount', { as: 'Total' })
        .first()

      return { resumo }
    },
  )

  app.post('/', async (request, reply) => {
    const criartransacaobodyschema = z.object({
      title: z.string(),
      amount: z.number(),
      type: z.enum(['credito', 'debito']),
    })

    const { title, amount, type } = criartransacaobodyschema.parse(request.body)

    let sessionId = request.cookies.sessionId

    if (!sessionId) {
      sessionId = randomUUID()
      reply.cookie('sessionId', sessionId, {
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // = 7 dias
      })
    }

    await knex('transacoes').insert({
      id: crypto.randomUUID(),
      title,
      amount: type === 'credito' ? amount : amount * -1,
      session_id: sessionId,
    })

    return reply.status(201).send()
  })
}
