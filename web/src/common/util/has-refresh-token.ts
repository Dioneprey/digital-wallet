import { REFRESH_TOKEN_COOKIE } from "@/common/constants/auth-cookie";
import { cookies } from "next/headers";

export default async function hasRefreshToken() {
  return !!(await cookies()).get(REFRESH_TOKEN_COOKIE)?.value;
}
