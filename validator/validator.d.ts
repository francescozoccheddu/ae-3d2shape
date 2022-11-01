import { ErrorObject } from "ajv";

export const validate: {
    (obj: any): boolean,
    readonly errors: ErrorObject[] | null;
};
export default validate;