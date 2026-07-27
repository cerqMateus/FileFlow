export type AuthMode = "cadastro" | "login";

export type AuthFields = Readonly<{
  name: string;
  email: string;
  password: string;
  passwordConfirmation: string;
}>;

export type AuthField = keyof AuthFields;
export type AuthFieldErrors = Partial<Record<AuthField, string>>;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/u;

export function validateAuthFields(
  mode: AuthMode,
  fields: AuthFields,
): AuthFieldErrors {
  const errors: AuthFieldErrors = {};
  const name = fields.name.trim();
  const email = fields.email.trim();

  if (mode === "cadastro") {
    if (name.length < 2 || name.length > 100) {
      errors.name = "Informe um nome entre 2 e 100 caracteres.";
    }
  }

  if (email === "" || !EMAIL_PATTERN.test(email)) {
    errors.email = "Informe um e-mail válido.";
  }

  if (fields.password.length < 8 || fields.password.length > 128) {
    errors.password = "A senha deve ter entre 8 e 128 caracteres.";
  }

  if (
    mode === "cadastro" &&
    fields.passwordConfirmation !== fields.password
  ) {
    errors.passwordConfirmation = "As senhas não coincidem.";
  }

  return errors;
}
