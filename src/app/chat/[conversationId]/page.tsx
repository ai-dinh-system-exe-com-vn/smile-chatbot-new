import { isValidConversationId } from "@/lib/conversation";
// import { useRouter } from "next/navigation";
import { redirect } from "next/navigation";
import PageClient from "./page-client";

export const runtime = "edge";

export default async function Page({
  params,
}: {
  params: Promise<{ conversationId: string }>;
}) {
  const conversationId = (await params).conversationId;

  if (!isValidConversationId(conversationId)) {
    return redirect("/");
  } else {
    return <PageClient conversationId={conversationId} />;
  }
}
