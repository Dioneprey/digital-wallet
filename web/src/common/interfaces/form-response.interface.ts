export interface FormResponse {
  errors: FormErrors;
  success?: boolean;
  payload?: Record<string, any>;
}

export type FormErrors = Record<string, string | null | undefined> | null;
