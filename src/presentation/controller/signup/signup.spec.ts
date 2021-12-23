import { InvalidParamError, ServerError } from "../../errors"
import { MissinParamError } from "../../errors/missing-param-error"
import { AccountModel, AddAccount, AddAccountModel, EmailValidator, SenhaValidator } from "./signup-protocols"
import { SignUpController } from "./signupController"

const emailValidate = (): EmailValidator => {
  class EmailValidatorStub implements EmailValidator {
    isValid (email: string): boolean {
      return true
    }
  }
  return new EmailValidatorStub()
}

const senhaValidate = (): SenhaValidator => {
  class EmailValidatorStub implements SenhaValidator {
    isValid (senha: string): boolean {
      return true
    }
  }
  return new EmailValidatorStub()
}

const makeAddAccount = (): AddAccount => {
  class AddAccountStub implements AddAccount {
    async add (account: AddAccountModel): Promise<AccountModel> {
      const fakeAccount = {
        id: 'valid_id',
        nome: 'valid_nome',
        senha: 'valid_senha',
        email: 'valid_email@email.com'
      }
      return await new Promise((resolve, reject) => resolve(fakeAccount))
    }
  }
  return new AddAccountStub()
}

interface SutTypes {
    sut: SignUpController
    emailValidatorStub: EmailValidator
    senhaValidatorStub: SenhaValidator
    addAccountStub: AddAccount
  }
  const makeSut = (): SutTypes => {
    const emailValidatorStub = emailValidate()
    const senhaValidatorStub = senhaValidate()
    const addAccountStub = makeAddAccount()
    const sut = new SignUpController(emailValidatorStub, senhaValidatorStub, addAccountStub)
    return {  sut, emailValidatorStub, senhaValidatorStub, addAccountStub }
  }
describe('test SignUpController',()=>{
    test('devera retorna 400 se o nome não for provido', async () => {
        const { sut } = makeSut()
        const httpRequest = {
          body: {
            // nome: 'qualquer_nome',
            email: 'qualquer_@email.com',
            senha: 'qualquer_senha',
            senhaConfirme: 'qualquer_senha'
          }
        }
        const httpResponse = await sut.handle(httpRequest)
        expect(httpResponse.statusCode).toBe(400)
        expect(httpResponse.body).toEqual(new MissinParamError('nome'))
      })

      test('devera retorna 400 se o email não for provido', async () => {
        const { sut } = makeSut()
        const httpRequest = {
          body: {
            nome: 'qualquer_nome',
            // email: 'qualquer_@email.com',
            senha: 'qualquer_senha',
            senhaConfirme: 'qualquer_senha'
          }
        }
        const httpResponse = await sut.handle(httpRequest)
        expect(httpResponse.statusCode).toBe(400)
        expect(httpResponse.body).toEqual(new MissinParamError('email'))
      })

      test('devera retorna 400 se a senha não for provido', async () => {
        const { sut } = makeSut()
        const httpRequest = {
          body: {
            nome: 'qualquer_nome',
            email: 'qualquer_@email.com',
           // senha: 'qualquer_senha',
            senhaConfirme: 'qualquer_senha'
          }
        }
        const httpResponse = await sut.handle(httpRequest)
        expect(httpResponse.statusCode).toBe(400)
        expect(httpResponse.body).toEqual(new MissinParamError('senha'))
      })

      test('devera retorna 400 se a senha não for provido', async () => {
        const { sut } = makeSut()
        const httpRequest = {
          body: {
            nome: 'qualquer_nome',
            email: 'qualquer_@email.com',
            senha: 'qualquer_senha',
          //  senhaConfirme: 'qualquer_senha'
          }
        }
        const httpResponse = await sut.handle(httpRequest)
        expect(httpResponse.statusCode).toBe(400)
        expect(httpResponse.body).toEqual(new MissinParamError('senhaConfirme'))
      })

      test('devera retorna 400 se a senha != senhaConfirme', async () => {
        const { sut } = makeSut()
        const httpRequest = {
          body: {
            nome: 'qualquer_nome',
            email: 'qualquer_@email.com',
            senha: 'qualquer_senha',
            senhaConfirme: 'invalid_confirmation_senha'
          }
        }
        const httpResponse = await sut.handle(httpRequest)
        expect(httpResponse.statusCode).toBe(400)
        expect(httpResponse.body).toEqual(new InvalidParamError('senhaConfirme'))
      })

      test('retornar 400 se o email for invalido', async () => {
        const { sut, emailValidatorStub } = makeSut()
        jest.spyOn(emailValidatorStub, 'isValid').mockReturnValueOnce(false)
        const httpRequest = {
          body: {
            nome: 'qualquer_nome',
            email: 'invalid_@email.com',
            senha: 'qualquer_senha',
            senhaConfirme: 'qualquer_senha'
          }
        }
        const httpResponse = await sut.handle(httpRequest)
        expect(httpResponse.statusCode).toBe(400)
        expect(httpResponse.body).toEqual(new InvalidParamError('email'))
      })

      test('retornar 400 se a senha não for forte', async () => {
        const { sut, senhaValidatorStub } = makeSut()
        jest.spyOn(senhaValidatorStub, 'isValid').mockReturnValueOnce(false)
        const httpRequest = {
          body: {
            nome: 'qualquer_nome',
            email: 'invalid_@email.com',
            senha: 'qualquer_senha',
            senhaConfirme: 'qualquer_senha'
          }
        }
        const httpResponse = await sut.handle(httpRequest)
        expect(httpResponse.statusCode).toBe(400)
        expect(httpResponse.body).toEqual(new InvalidParamError('senha'))
      })

      test('devera chamar com o email correto', async () => {
        const { sut, emailValidatorStub } = makeSut()
        const isValidSpy = jest.spyOn(emailValidatorStub, 'isValid')
        const httpRequest = {
          body: {
            nome: 'qualquer_nome',
            email: 'vialid_@email.com',
            senha: 'qualquer_senha',
            senhaConfirme: 'qualquer_senha'
          }
        }
        await sut.handle(httpRequest)
        expect(isValidSpy).toHaveBeenCalledWith('vialid_@email.com')
      })

      test('devera chamar com a senha correto', async () => {
        const { sut, senhaValidatorStub } = makeSut()
        const isValidSpy = jest.spyOn(senhaValidatorStub, 'isValid')
        const httpRequest = {
          body: {
            nome: 'qualquer_nome',
            email: 'vialid_@email.com',
            senha: 'qualquer_senha',
            senhaConfirme: 'qualquer_senha'
          }
        }
        await sut.handle(httpRequest)
        expect(isValidSpy).toHaveBeenCalledWith('qualquer_senha')
      })

      test('devera retornar 500 se a validação de email gera exeção', async () => {
        const { emailValidatorStub, sut } = makeSut()
        jest.spyOn(emailValidatorStub, 'isValid').mockImplementationOnce(() => {
          throw new Error()
        })
        const httpRequest = {
          body: {
            nome: 'qualquer_nome',
            email: 'qualquer_@email.com',
            senha: 'qualquer_senha',
            senhaConfirme: 'qualquer_senha'
          }
        }
        const httpResponse = await sut.handle(httpRequest)
        expect(httpResponse.statusCode).toBe(500)
        expect(httpResponse.body).toEqual(new ServerError())
      })

      test('devera retornar 500 se a validação de email gera exeção', async () => {
        const { emailValidatorStub, sut } = makeSut()
        jest.spyOn(emailValidatorStub, 'isValid').mockImplementationOnce(() => {
          throw new Error()
        })
        const httpRequest = {
          body: {
            nome: 'qualquer_nome',
            email: 'qualquer_@email.com',
            senha: 'qualquer_senha',
            senhaConfirme: 'qualquer_senha'
          }
        }
        const httpResponse = await sut.handle(httpRequest)
        expect(httpResponse.statusCode).toBe(500)
        expect(httpResponse.body).toEqual(new ServerError())
      })

      test('devera retornar 500 se a validação de senha gera exeção', async () => {
        const { senhaValidatorStub, sut } = makeSut()
        jest.spyOn(senhaValidatorStub, 'isValid').mockImplementationOnce(() => {
          throw new Error()
        })
        const httpRequest = {
          body: {
            nome: 'qualquer_nome',
            email: 'qualquer_@email.com',
            senha: 'qualquer_senha',
            senhaConfirme: 'qualquer_senha'
          }
        }
        const httpResponse = await sut.handle(httpRequest)
        expect(httpResponse.statusCode).toBe(500)
        expect(httpResponse.body).toEqual(new ServerError())
      })

      test('devera criar uma conta com os valores corretos', async () => {
        const { sut, addAccountStub } = makeSut()
        const addSpy = jest.spyOn(addAccountStub, 'add')
    
        const httpRequest = {
          body: {
            nome: 'qualquer_nome',
            email: 'qualquer_@email.com',
            senha: 'qualquer_senha',
            senhaConfirme: 'qualquer_senha'
          }
        }
        await sut.handle(httpRequest)
        expect(addSpy).toHaveBeenCalledWith({
          nome: 'qualquer_nome',
          email: 'qualquer_@email.com',
          senha: 'qualquer_senha'
        })
      })

      test('devera retornar 500 se addAccount lançar alguma exeção', async () => {
        const { addAccountStub, sut } = makeSut()
        jest.spyOn(addAccountStub, 'add').mockImplementationOnce(async () => {
          return await new Promise((resolve, reject) => reject(new Error()))
        })
        const httpRequest = {
          body: {
            nome: 'qualquer_nome',
            email: 'qualquer_@email.com',
            senha: 'qualquer_senha',
            senhaConfirme: 'qualquer_senha'
          }
        }
    
        const httpResponse = await sut.handle(httpRequest)
        expect(httpResponse.statusCode).toBe(500)
        expect(httpResponse.body).toEqual(new ServerError())
      })

      test('devera retornar 200 se addAccount não lançar alguma exeção', async () => {
        const { sut } = makeSut()
        const httpRequest = {
          body: {
            nome: 'valid_nome',
            senha: 'valid_senha',
            email: 'valid_email@email.com',
            senhaConfirme: 'valid_senha'
          }
        }
    
        const httpResponse = await sut.handle(httpRequest)
        expect(httpResponse.statusCode).toBe(200)
        expect(httpResponse.body).toEqual({
          id: 'valid_id',
          nome: 'valid_nome',
          senha: 'valid_senha',
          email: 'valid_email@email.com'
        })
      })
})