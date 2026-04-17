// [AI MODULE]
// [SAFE]
// [NO NEW DEPENDENCIES]

import Ajv from "ajv";

const ajv = new Ajv({ allErrors: true });

export class Validator {
  static validate(schema: object, data: any): { isValid: boolean; errors?: string } {
    const validate = ajv.compile(schema);
    const valid = validate(data);
    
    if (!valid) {
      return { 
        isValid: false, 
        errors: ajv.errorsText(validate.errors) 
      };
    }
    
    return { isValid: true };
  }
}
