package com.farmsetu.model.entity;

import com.farmsetu.model.enums.PostType;
import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity
@Table(name = "posts")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties({ "hibernateLazyInitializer", "handler", "mediaUrls", "tags", "author" })
public class Post extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "author_id", nullable = false)
    private User author;

    @Column(columnDefinition = "TEXT")
    private String content;

    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(name = "post_media", joinColumns = @JoinColumn(name = "post_id"))
    @Column(name = "media_url")
    @lombok.Builder.Default
    private List<String> mediaUrls = new ArrayList<>();

    @Enumerated(EnumType.STRING)
    @Column(name = "post_type")
    @lombok.Builder.Default
    private PostType postType = PostType.TEXT;

    private String category;

    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(name = "post_tags", joinColumns = @JoinColumn(name = "post_id"))
    @Column(name = "tag")
    @lombok.Builder.Default
    private List<String> tags = new ArrayList<>();

    private String location;

    @Column(name = "likes_count")
    @lombok.Builder.Default
    private Integer likesCount = 0;

    @Column(name = "comments_count")
    @lombok.Builder.Default
    private Integer commentsCount = 0;

    @Column(name = "shares_count")
    @lombok.Builder.Default
    private Integer sharesCount = 0;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "post_likes", joinColumns = @JoinColumn(name = "post_id"))
    @Column(name = "user_id")
    @lombok.Builder.Default
    private java.util.Set<Long> likedUserIds = new java.util.HashSet<>();
}
