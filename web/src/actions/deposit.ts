"use server";

import { FormResponse } from "@/common/interfaces/form-response.interface";
import { request } from "@/common/util/fetch";

export async function createDeposit(
  _prevState: FormResponse,
  formData: FormData
): Promise<FormResponse> {
  const data = Object.fromEntries(formData);
  try {
    if (!data.amount || data.amount === "0") {
      return {
        errors: {
          amount: "Preencha o valor",
        },
        payload: data,
      };
    }

    const { error } = await request({
      method: "POST",
      path: "transactions/deposit",
      data: {
        ...data,
        amount: Number(data.amount),
      },
    });

    if (error) {
      return { errors: { response: error.message }, payload: data };
    }

    return { errors: null, success: true };
  } catch (error) {
    return {
      errors: { response: "Ocorreu um erro... Tente novamente!" },
      payload: data,
    };
  }
}
