import { conversationRepository } from "@/services/repositories/objects/conversation-repository";

export const createOrGetConversation = async (conversationId: string) => {
    return await conversationRepository.getById(conversationId);
}