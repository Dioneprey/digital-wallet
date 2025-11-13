import { get } from "@/common/util/fetch";
import { User } from "./type";
import { PaginationMetaResponse } from "@/common/interfaces/pagination-meta-response";

export async function getMe() {
  return await get<{ user: User }>({
    path: "me",
  });
}

interface FetchUsersByEmailProps {
  email: string;
}
export async function fetchUsersByEmail({ email }: FetchUsersByEmailProps) {
  return await get<{ users: User[]; meta: PaginationMetaResponse }>({
    path: "users",
    params: {
      email,
    },
  });
}
