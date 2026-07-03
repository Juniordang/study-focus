import { useMutation } from "@tanstack/react-query";
import { ReqUser, userAuthApi } from "@/lib/api";

export function useLogin() {
  return useMutation({
    mutationFn: (payload: ReqUser) => userAuthApi.login(payload),
    onSuccess: (data) => {
      if (data && data.token) {
        console.log(
          "Token encontrado, salvando no localStorage...",
          data.token,
        );
        localStorage.setItem("@StudyFocus:token", data.token);
      }
      console.log("Login efetuado com sucesso!", data);
    },
  });
}

export function useRegister() {
  return useMutation({
    mutationFn: (payload: ReqUser) => userAuthApi.create(payload),
    onSuccess: (data) => {
      // Função chamada quando a criação da conta funcionar.
      console.log("Usuário registrado com sucesso!", data);
    },
  });
}
