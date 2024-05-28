/* Definição de tipos */
// eslint-disable-next-line
import { Knex } from "knex";

declare module 'knex/types/tables' {
  export interface Tables {
    transacoes: {
      id: string
      title: string
      amount: number
      created_at: string
      sesson_id: string
    }
  }
}
