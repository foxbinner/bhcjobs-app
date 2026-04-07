export interface FormState {
  name: string;
  phone: string;
  email: string;
  password: string;
  confirm_password: string;
  passport_number: string;
  dob: string;
  gender: string;
}

export type FormErrors = Record<string, string>;

export interface StepBag {
  form: FormState;
  errors: FormErrors;
  focused: string | null;
  setField: (key: keyof FormState) => (value: string) => void;
  setFocused: (key: string | null) => void;
}
