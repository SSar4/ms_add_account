/* eslint-disable @typescript-eslint/no-floating-promises */
import { Collection, MongoClient } from 'mongodb'
import env from '../../../../../main/config/env'
export const MongoHelper = {
  client: null as unknown as MongoClient,
  url: null as unknown as string,

  async connect (uri: string): Promise<void> {
    this.url = env.mongoUrl
    this.client = await MongoClient.connect(this.url)
  },

  async disconnect (): Promise<void> {
    await this.client.close()
  },

  emailUnique (name: string): void {
    this.client.db().collection(name).createIndex({ email: 1 }, { unique: true })
  },
  async getCollection (name: string): Promise<Collection> {
    if (this.url === null) throw new Error('Mongo não esta conectado')

    if (this.client === null) {
      await this.connect(this.url)
    }
    // this.client.db().collection(name).createIndex( { "email": 1 }, { unique: true } )
    return this.client.db().collection(name)
  },

  map: (data: any): any => {
    const { _id, ...rest } = data
    return { ...rest, id: _id.toHexString() }
  },

  mapCollection: (collection: any[]): any[] => {
    return collection.map(c => MongoHelper.map(c))
  }
}
