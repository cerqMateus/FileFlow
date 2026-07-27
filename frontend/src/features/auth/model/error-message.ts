type AuthErrorLike = Readonly<{
  status?: number | undefined;
  code?: string | undefined;
}>;

const RATE_LIMIT_MESSAGE =
  "Muitas tentativas. Aguarde um instante antes de tentar novamente.";
const NETWORK_MESSAGE =
  "Não foi possível conectar. Verifique sua internet e tente novamente.";

export function getAuthErrorMessage(
  operation: "cadastro" | "login" | "logout",
  error: AuthErrorLike | null | undefined,
): string {
  if (error?.status === 429 || error?.code === "TOO_MANY_REQUESTS") {
    return RATE_LIMIT_MESSAGE;
  }

  if (operation === "login") {
    return "E-mail ou senha inválidos.";
  }

  if (operation === "cadastro") {
    return "Não foi possível criar sua conta. Revise os dados e tente novamente.";
  }

  return "Não foi possível sair agora. Tente novamente.";
}

export function getAuthNetworkMessage(): string {
  return NETWORK_MESSAGE;
}
