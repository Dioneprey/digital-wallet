import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { jwtDecode } from "jwt-decode";
import { AUTHENTICATION_COOKIE } from "@/common/constants/auth-cookie";
import { request } from "@/common/util/fetch";

export async function POST(req: NextRequest) {
  const data = await req.json();

  const { error, rawRes: res } = await request(
    "POST",
    "authenticate/magic-link/validate",
    data
  );

  if (error) return NextResponse.json({ error });

  const setCookieHeader = res!.headers.get("Set-Cookie");
  if (setCookieHeader) {
    const token = setCookieHeader.split(";")[0].split("=")[1];

    (await cookies()).set({
      name: AUTHENTICATION_COOKIE,
      value: token,
      secure: true,
      httpOnly: true,
      expires: new Date(jwtDecode(token).exp! * 1000),
    });
  }

  return NextResponse.json({ error: null });
}
