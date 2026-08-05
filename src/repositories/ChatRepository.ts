import { supabase, isSupabaseConfigured } from "../lib/supabase";
import { ChatMessage, Conversation } from "../types/social";

export class ChatRepository {
  /**
   * Get or create a 1-on-1 conversation between two users
   */
  async getOrCreateConversation(userId1: string, userId2: string): Promise<Conversation | null> {
    if (!isSupabaseConfigured) return null;

    try {
      // Find existing common conversation
      const { data: user1Convs } = await supabase
        .from("conversation_participants")
        .select("conversation_id")
        .eq("user_id", userId1);

      if (user1Convs && user1Convs.length > 0) {
        const convIds = user1Convs.map((c) => c.conversation_id);
        const { data: shared } = await supabase
          .from("conversation_participants")
          .select("conversation_id")
          .in("conversation_id", convIds)
          .eq("user_id", userId2)
          .single();

        if (shared) {
          const { data: conv } = await supabase
            .from("conversations")
            .select("*")
            .eq("id", shared.conversation_id)
            .single();

          if (conv) return conv as Conversation;
        }
      }

      // Create new conversation if not found
      const { data: newConv, error: convErr } = await supabase
        .from("conversations")
        .insert({ is_group: false })
        .select()
        .single();

      if (convErr || !newConv) throw convErr;

      // Add participants
      await supabase.from("conversation_participants").insert([
        { conversation_id: newConv.id, user_id: userId1 },
        { conversation_id: newConv.id, user_id: userId2 },
      ]);

      return newConv as Conversation;
    } catch (err) {
      console.error("Get or create conversation error:", err);
      return null;
    }
  }

  /**
   * Fetch messages for a conversation with pagination
   */
  async getMessages(conversationId: string, limit: number = 50, beforeTimestamp?: string): Promise<ChatMessage[]> {
    if (!isSupabaseConfigured) return [];

    try {
      let query = supabase
        .from("messages")
        .select(`
          *,
          sender_profile:profiles!messages_sender_id_fkey(*)
        `)
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: false })
        .limit(limit);

      if (beforeTimestamp) {
        query = query.lt("created_at", beforeTimestamp);
      }

      const { data, error } = await query;
      if (error) throw error;

      return ((data as ChatMessage[]) || []).reverse();
    } catch (err) {
      console.error("Get messages error:", err);
      return [];
    }
  }

  /**
   * Send a text or image message
   */
  async sendMessage(conversationId: string, senderId: string, text?: string, imageUrl?: string): Promise<ChatMessage | null> {
    if (!isSupabaseConfigured) return null;

    try {
      const { data, error } = await supabase
        .from("messages")
        .insert({
          conversation_id: conversationId,
          sender_id: senderId,
          text: text ? text.trim() : null,
          image_url: imageUrl || null,
          status: "sent",
        })
        .select(`
          *,
          sender_profile:profiles!messages_sender_id_fkey(*)
        `)
        .single();

      if (error) throw error;

      // Update conversation timestamp
      await supabase
        .from("conversations")
        .update({ updated_at: new Date().toISOString() })
        .eq("id", conversationId);

      return data as ChatMessage;
    } catch (err) {
      console.error("Send message error:", err);
      throw err;
    }
  }

  /**
   * Mark messages in a conversation as seen
   */
  async markMessagesSeen(conversationId: string, userId: string): Promise<void> {
    if (!isSupabaseConfigured) return;

    try {
      await supabase
        .from("messages")
        .update({ status: "seen" })
        .eq("conversation_id", conversationId)
        .neq("sender_id", userId)
        .neq("status", "seen");

      await supabase
        .from("conversation_participants")
        .update({ last_read_at: new Date().toISOString() })
        .eq("conversation_id", conversationId)
        .eq("user_id", userId);
    } catch (err) {
      console.error("Mark messages seen error:", err);
    }
  }

  /**
   * Soft delete a message for current user
   */
  async deleteMessageForMe(messageId: string, userId: string): Promise<boolean> {
    if (!isSupabaseConfigured) return false;

    try {
      const { data: msg } = await supabase
        .from("messages")
        .select("deleted_by_users")
        .eq("id", messageId)
        .single();

      const currentDeleted = msg?.deleted_by_users || [];
      if (!currentDeleted.includes(userId)) {
        currentDeleted.push(userId);
      }

      const { error } = await supabase
        .from("messages")
        .update({ deleted_by_users: currentDeleted })
        .eq("id", messageId);

      if (error) throw error;
      return true;
    } catch (err) {
      console.error("Delete message for me error:", err);
      return false;
    }
  }

  /**
   * Update typing indicator
   */
  async setTypingStatus(conversationId: string, userId: string, isTyping: boolean): Promise<void> {
    if (!isSupabaseConfigured) return;

    try {
      await supabase.from("typing_status").upsert({
        conversation_id: conversationId,
        user_id: userId,
        is_typing: isTyping,
        updated_at: new Date().toISOString(),
      });
    } catch (err) {
      console.error("Set typing status error:", err);
    }
  }
}

export const chatRepository = new ChatRepository();
