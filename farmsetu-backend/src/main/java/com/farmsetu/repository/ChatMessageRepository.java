package com.farmsetu.repository;

import com.farmsetu.model.entity.ChatMessage;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {

    @Query("SELECT cm FROM ChatMessage cm WHERE (cm.sender.id = :userId AND cm.receiver.id = :otherUserId) OR (cm.sender.id = :otherUserId AND cm.receiver.id = :userId) ORDER BY cm.createdAt DESC")
    List<ChatMessage> findConversation(@Param("userId") Long userId,
                                       @Param("otherUserId") Long otherUserId,
                                       Pageable pageable);
}
