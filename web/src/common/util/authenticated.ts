import {
  AUTHENTICATION_COOKIE,
  REFRESH_TOKEN_COOKIE,
} from "@/common/constants/auth-cookie";
import { cookies } from "next/headers";

export default async function authenticated() {
  return !!(await cookies()).get(AUTHENTICATION_COOKIE)?.value;
}
