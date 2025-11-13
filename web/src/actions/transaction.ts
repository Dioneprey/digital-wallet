"use server";

import { FormResponse } from "@/common/interfaces/form-response.interface";
import { request } from "@/common/util/fetch";

export async function reverseTransfer(
  _prevState: FormResponse,
  formData: FormData
): Promise<FormResponse> {
  const data = Object.fromEntries(formData);
  try {
    if (!data.transactionId) {
      return {
        errors: {
          response: "Não foi possível identificar a transação",
        },
        payload: data,
      };
    }

    const { error } = await request({
      method: "PATCH",
      path: `transactions/${data.transactionId}/reverse`,
      data: data,
    });

    if (error) {
      return { errors: { response: error.message }, payload: data };
    }

    return { errors: null, success: true };
  } catch (error) {
    console.log(error);

    return {
      errors: { response: "Ocorreu um erro... Tente novamente!" },
      payload: data,
    };
  }
}
