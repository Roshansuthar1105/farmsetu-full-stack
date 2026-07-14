package com.farmsetu.repository;

import com.farmsetu.model.entity.ChatMessage;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {

    @Query(value = "SELECT * FROM chats cm WHERE (cm.sender_id = :userId AND cm.receiver_id = :otherUserId) OR (cm.sender_id = :otherUserId AND cm.receiver_id = :userId) ORDER BY cm.created_at DESC", nativeQuery = true)
    List<ChatMessage> findConversation(@Param("userId") Long userId,
                                       @Param("otherUserId") Long otherUserId,
                                       Pageable pageable);

    List<ChatMessage> findBySenderIdAndReceiverIdAndRead(Long senderId, Long receiverId, boolean read);
}

