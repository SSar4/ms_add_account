/* eslint-disable @typescript-eslint/strict-boolean-expressions */
import { ObjectId } from 'mongodb'
import { AddAccountRepository } from '../../../../../data/protocols/db/add-account-repository'
import { LoadAccountByEmailRepository } from '../../../../../data/protocols/db/load-account-email-repository'
import { UpdateAcessTokenRepository } from '../../../../../data/protocols/db/update-acess-token-repository'
import { AccountModel } from '../../../../../domain/models/account'
import { AddAccountModel } from '../../../../../domain/usecases/add-account'
import { MongoHelper } from '../helpers/mongo-helper'

export class AccountMongoRepository implements AddAccountRepository, LoadAccountByEmailRepository, UpdateAcessTokenRepository {
  async add (accountData: AddAccountModel): Promise<AccountModel | null> {
    const accountCollection = MongoHelper.getCollection('accounts')
    MongoHelper.emailUnique('accounts')
    const result = await (await accountCollection).insertOne(accountData)
    // console.log(await accountCollection.findOne({ _id: result.insertedId }),'resilt--------------------')
    const account = await (await accountCollection).findOne({ _id: result.insertedId })

    return MongoHelper.map(account)
  }

  async loadByEmail (email: string): Promise<AccountModel | null> {
    const accountCollection = await MongoHelper.getCollection('accounts')
    const account = await accountCollection.findOne({ email }) as unknown as AccountModel
    return account && MongoHelper.map(account)
  }

  async updateAcessToken (id: string, token: string): Promise<void> {
    const accountCollection = await MongoHelper.getCollection('accounts')
    await accountCollection.updateOne({
      _id: new ObjectId(id)
    }, {
      $set: {
        accessToken: token
      }
    })
  }
}
