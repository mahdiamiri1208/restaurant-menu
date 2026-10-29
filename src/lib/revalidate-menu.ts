import { revalidatePath, revalidateTag } from "next/cache";

export function revalidatePublicMenu() {
  revalidateTag("public-menu", { expire: 0 });
  revalidatePath("/");
}