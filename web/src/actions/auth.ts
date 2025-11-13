"use server";

import { jwtDecode } from "jwt-decode";
import { cookies } from "next/headers";
import { AUTHENTICATION_COOKIE } from "../../../common/constants/auth-cookie";
import { request } from "@/common/util/fetch";
import { FormResponse } from "@/common/interfaces/form-response.interface";

export async function validateCredentials(
  _prevState: FormResponse,
  formData: FormData
): Promise<FormResponse> {
  const data = Object.fromEntries(formData);
  try {
    if (!data.email) {
      return {
        errors: {
          email: "Preencha seu E-mail!",
        },
        payload: data,
      };
    }

    const { error, rawRes: res } = await request({
      method: "POST",
      path: "auth",
      data,
    });

    if (error) {
      return { errors: { response: error.message }, payload: data };
    }

    await setAuthCookie(res!);

    return { errors: null, success: true, payload: data };
  } catch (error) {
    return {
      errors: { response: "Ocorreu um erro... Tente novamente!" },
      payload: data,
    };
  }
}

export async function registerUser(
  _prevState: FormResponse,
  formData: FormData
): Promise<FormResponse> {
  const data = Object.fromEntries(formData);
  try {
    if (!data.name) {
      return {
        errors: {
          name: "Preencha seu nome!",
        },
        payload: data,
      };
    }
    if (!data.email) {
      return {
        errors: {
          email: "Preencha seu E-mail!",
        },
        payload: data,
      };
    }
    if (!data.password) {
      return {
        errors: {
          password: "Preencha sua senha!",
        },
        payload: data,
      };
    }
    if (data.password !== data.password_confirm) {
      return {
        errors: {
          password: "Senhas não batem!",
        },
        payload: data,
      };
    }

    const { error, rawRes: res } = await request({
      method: "POST",
      path: "users",
      data,
    });

    if (error) {
      if (error.status === 409) {
        return {
          errors: { email: "Usuário com mesmo email já existe" },
          payload: data,
        };
      }

      return { errors: { response: error.message }, payload: data };
    }

    await setAuthCookie(res!);

    return { errors: null, success: true, payload: data };
  } catch (error) {
    return {
      errors: { response: "Ocorreu um erro... Tente novamente!" },
      payload: data,
    };
  }
}

const setAuthCookie = async (response: Response) => {
  const setCookieHeader = response.headers.get("Set-Cookie");

  if (!setCookieHeader) return;

  const token = setCookieHeader.split(";")[0].split("=")[1];

  (await cookies()).set({
    name: AUTHENTICATION_COOKIE,
    value: token,
    secure: true,
    httpOnly: true,
    expires: new Date(jwtDecode(token).exp! * 1000),
  });

  const cookiesList = setCookieHeader.split(",").map((c) => c.trim());

  for (const cookieStr of cookiesList) {
    const [nameValue, ...attrs] = cookieStr.split(";");
    const [name, value] = nameValue.split("=");

    const isAccessToken = name === "Authentication";
    const isRefreshToken = name === "RefreshToken";

    if (isAccessToken || isRefreshToken) {
      (await cookies()).set({
        name,
        value,
        httpOnly: true,
        secure: true,
        path: "/",
        sameSite: "lax",
        // expiracao do accessToken via JWT exp, refreshToken via Max-Age
        ...(isAccessToken
          ? { expires: new Date(jwtDecode(value).exp! * 1000) }
          : { maxAge: 7 * 24 * 60 * 60 }),
      });
    }
  }
};
