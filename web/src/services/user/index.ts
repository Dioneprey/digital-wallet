import { get } from "@/common/util/fetch";
import { User } from "./type";

export async function getMe() {
  return await get<{ user: User }>({
    path: "me",
  });
}
