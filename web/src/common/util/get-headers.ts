"use server";
import { cookies } from "next/headers";

export const getHeaders = async () => {
  const cookieStore = await cookies();
  const cookieString = cookieStore
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join("; ");

  return {
    Cookie: cookieString,
  };
};
