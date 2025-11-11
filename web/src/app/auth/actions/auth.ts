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
  try {
    const data = Object.fromEntries(formData);

    if (!data.email) {
      return {
        errors: {
          email: "Preencha seu E-mail!",
        },
      };
    }

    const { error, rawRes: res } = await request({
      method: "POST",
      path: "auth",
      data,
    });

    if (error) {
      return { errors: { email: error, password: error } };
    }

    await setAuthCookie(res!);

    return { errors: null, success: true };
  } catch (error) {
    return { errors: { response: "Ocorreu um erro... Tente novamente!" } };
  }
}

export async function registerUser(
  _prevState: FormResponse,
  formData: FormData
) {
  try {
    const data = Object.fromEntries(formData);

    if (!data.name) {
      return {
        errors: {
          name: "Preencha seu nome!",
        },
      };
    }
    if (!data.email) {
      return {
        errors: {
          email: "Preencha seu E-mail!",
        },
      };
    }
    if (!data.password) {
      return {
        errors: {
          password: "Preencha sua senha!",
        },
      };
    }
    if (data.password !== data.password_confirm) {
      return {
        errors: {
          password: "Senhas não batem!",
        },
      };
    }

    const { error, rawRes: res } = await request({
      method: "POST",
      path: "user",
      data,
    });

    if (error) {
      return { errors: { response: error } };
    }

    await setAuthCookie(res!);

    return { errors: null, success: true };
  } catch (error) {
    return { errors: { response: "Ocorreu um erro... Tente novamente!" } };
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
