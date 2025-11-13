export interface FormResponse {
  errors: FormErrors;
  success?: boolean;
  payload?: FormData;
}

export type FormErrors = Record<string, string | null | undefined> | null;
