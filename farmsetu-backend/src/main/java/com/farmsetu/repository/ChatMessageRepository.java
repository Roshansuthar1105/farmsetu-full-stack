package com.farmsetu.repository;

import com.farmsetu.model.entity.ChatMessage;


import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {

    @Query(nativeQuery = true, value = "SELECT * FROM chat_message WHERE (sender_id = :userId AND receiver_id = :otherUserId) OR (sender_id = :otherUserId AND receiver_id = :userId) ORDER BY created_at DESC LIMIT :limit OFFSET :offset")
    java.util.List<java.util.Map<String, Object>> findConversationNative(@Param("userId") Long userId,
                                                                         @Param("otherUserId") Long otherUserId,
                                                                         @Param("limit") int limit,
                                                                         @Param("offset") int offset);
}
