export interface FormResponse {
  errors: FormErrors;
  success?: boolean;
}

export type FormErrors = Record<string, string | null | undefined> | null;
