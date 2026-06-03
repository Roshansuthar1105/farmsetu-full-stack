package com.farmsetu.repository;

import com.farmsetu.model.entity.ChatMessage;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {

    @Query("""
            SELECT m FROM ChatMessage m
            WHERE (m.sender.id = :userId AND m.receiver.id = :peerId)
               OR (m.sender.id = :peerId AND m.receiver.id = :userId)
            ORDER BY m.createdAt DESC
            """)
    Page<ChatMessage> findConversation(@Param("userId") Long userId,
                                       @Param("peerId") Long peerId,
                                       Pageable pageable);
}
