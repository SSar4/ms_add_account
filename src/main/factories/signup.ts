import { DbAddAccount } from '../../data/usecases/addAccount/db-add-account'
import { SignUpController } from '../../presentation/controller/signup/signupController'
import { EmailValidatorAdapter } from '../../utils/email-validator-adapter/email-validator-adapter'
import { SenhaValidatorAdapter } from '../../utils/senha-validator-adapter/senha-validator-adapter'
import { BcrypterAdapter } from '../../infra/cryptography/bcrypt-adapter'
import { AccountMongoRepository } from '../../infra/db/mongodb/account-repository/account/add-account-repository'

export const makeSignuoController = (): SignUpController =>{
    const emailValidatorAdapter = new EmailValidatorAdapter()
    const senhaValidatorAdapter = new SenhaValidatorAdapter()
    const bcrypterAdapter = new BcrypterAdapter(12)
    const accountMongoRepository = new AccountMongoRepository()
    const dbAddAccount = new DbAddAccount(bcrypterAdapter, accountMongoRepository)
    const signUpController = new SignUpController(emailValidatorAdapter, senhaValidatorAdapter, dbAddAccount)
    return signUpController
}