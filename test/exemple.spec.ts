import { beforeAll, afterAll, describe, it, expect, beforeEach } from 'vitest'
import { app } from './src/app'
import { execSync } from 'node:child_process'
import request from 'supertest'

describe('Rotas de Transações', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  beforeEach(async () => {
    execSync('npm run knex migrate:rollback --all')
    execSync('npm run knex migrate:latest')
  })

  it('usuario criar uma nova transação', async () => {
    await request(app.server)
      .post('/transacoes')
      .send({
        title: 'Transação de Teste',
        amount: 1000,
        type: 'credito',
      })
      .expect(201)
  })

  it('Tem que ser possivel listar todas as transações', async () => {
    const criacaoDaTransacao = await request(app.server)
      .post('/transacoes')
      .send({
        title: 'Transação de Teste',
        amount: 1000,
        type: 'credito',
      })
    const cookies = criacaoDaTransacao.get('Set-Cookie')

    const listaDeTransacao = await request(app.server)
      .get('/transacoes')
      .set('Cookie', cookies)
      .expect(200)

    expect(listaDeTransacao.body.transacoes).toEqual([
      expect.objectContaining({
        title: 'Transação de Teste',
        amount: 1000,
      }),
    ])
  })

  it('Tem que ser possivel especificar uma transação especifica', async () => {
    const criacaoDaTransacao = await request(app.server)
      .post('/transacoes')
      .send({
        title: 'Transação de Teste',
        amount: 1000,
        type: 'credito',
      })
    const cookies = criacaoDaTransacao.get('Set-Cookie')

    const listaDeTransacao = await request(app.server)
      .get('/transacoes')
      .set('Cookie', cookies)
      .expect(200)

    const transacaoId = listaDeTransacao.body.transacoes[0].id
    const pegandoTransacaoId = await request(app.server)
      .get(`/transacoes/${transacaoId}`)
      .set('Cookie', cookies)
      .expect(200)

    expect(pegandoTransacaoId.body.transacao).toEqual(
      expect.objectContaining({
        title: 'Transação de Teste',
        amount: 1000,
      }),
    )
  })

  it('Tem que ser possivel fazer o resumo do total de transacoes', async () => {
    const criacaoDaTransacao = await request(app.server)
      .post('/transacoes')
      .send({
        title: 'Transação de Teste',
        amount: 1000,
        type: 'credito',
      })

    const cookies = criacaoDaTransacao.get('Set-Cookie')
    await request(app.server).post('/transacoes').set('Cookie', cookies).send({
      title: 'Debito Teste',
      amount: 500,
      type: 'debito',
    })

    const resumo = await request(app.server)
      .get('/transacoes/resumo')
      .set('Cookie', cookies)
      .expect(200)

    expect(resumo.body.resumo).toEqual({
      Total: 500,
    })
  })
})
