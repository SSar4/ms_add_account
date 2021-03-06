import { Validation } from '../../presentation/helprs/validators/validation'

export class ValidatorComposite implements Validation {
  private readonly validations: Validation[]
  constructor (validations: Validation[]) {
    this.validations = validations
  }

  validate (input: any): Error | null {
    for (const validation of this.validations) {
      const error = validation.validate(input)
      if (error != null) {
        return error
      }
    }
    return null
  }
}
