"use server";

import { FormResponse } from "@/common/interfaces/form-response.interface";
import { request } from "@/common/util/fetch";

export async function createTransfer(
  _prevState: FormResponse,
  formData: FormData
): Promise<FormResponse> {
  try {
    const data = Object.fromEntries(formData);

    if (!data.toUserId) {
      return {
        errors: {
          toUserId: "Preencha o destinatário",
        },
      };
    }

    if (!data.amount || data.amount === "0") {
      return {
        errors: {
          amount: "Preencha o valor",
        },
      };
    }

    const { error } = await request({
      method: "POST",
      path: "transactions/transfer",
      data: {
        ...data,
        amount: Number(data.amount),
      },
    });

    if (error) {
      return { errors: { email: error, password: error } };
    }

    return { errors: null, success: true };
  } catch (error) {
    return { errors: { response: "Ocorreu um erro... Tente novamente!" } };
  }
}
