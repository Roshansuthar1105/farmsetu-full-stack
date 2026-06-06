package com.farmsetu.service;

import com.farmsetu.exception.ResourceNotFoundException;
import com.farmsetu.model.entity.Comment;
import com.farmsetu.model.entity.Post;
import com.farmsetu.model.entity.Story;
import com.farmsetu.model.entity.User;
import com.farmsetu.model.enums.PostType;
import com.farmsetu.repository.CommentRepository;
import com.farmsetu.repository.PostRepository;
import com.farmsetu.repository.StoryRepository;
import com.farmsetu.repository.UserRepository;
import com.farmsetu.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class CommunityService {

    private final PostRepository postRepository;
    private final CommentRepository commentRepository;
    private final StoryRepository storyRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<Map<String, Object>> listPosts(int page, int size) {
        List<Post> posts = postRepository.findAllWithAuthor(org.springframework.data.domain.PageRequest.of(page, size, org.springframework.data.domain.Sort.by("createdAt").descending()));
        return posts.stream().map(p -> {
            Map<String, Object> map = new java.util.HashMap<>();
            map.put("id", p.getId());
            map.put("title", "");
            map.put("content", p.getContent() != null ? p.getContent() : "");
            map.put("category", p.getCategory() != null ? p.getCategory() : "");
            map.put("location", p.getLocation() != null ? p.getLocation() : "");
            map.put("postType", p.getPostType() != null ? p.getPostType().name() : "TEXT");
            map.put("likesCount", p.getLikesCount() != null ? p.getLikesCount() : 0);
            map.put("commentsCount", p.getCommentsCount() != null ? p.getCommentsCount() : 0);
            map.put("sharesCount", p.getSharesCount() != null ? p.getSharesCount() : 0);
            map.put("authorId", p.getAuthor().getId());
            map.put("authorName", p.getAuthor().getName());
            map.put("mediaUrls", p.getMediaUrls() != null ? new java.util.ArrayList<>(p.getMediaUrls()) : new java.util.ArrayList<>());
            map.put("tags", p.getTags() != null ? new java.util.ArrayList<>(p.getTags()) : new java.util.ArrayList<>());
            map.put("createdAt", p.getCreatedAt() != null ? p.getCreatedAt().toString() : "");
            return map;
        }).collect(java.util.stream.Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Post getPost(Long id) {
        return postRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Post not found"));
    }

    @Transactional
    public Post createPost(String content, PostType type, List<String> mediaUrls,
                           String category, List<String> tags, String location) {
        User author = userRepository.findById(SecurityUtils.currentUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + SecurityUtils.currentUserId()));
        Post post = Post.builder()
                .author(author)
                .content(content)
                .postType(type != null ? type : PostType.TEXT)
                .mediaUrls(mediaUrls)
                .category(category)
                .tags(tags)
                .location(location)
                .build();
        return postRepository.save(post);
    }

    @Transactional
    public Post updatePost(Long id, String content) {
        Post post = getPost(id);
        post.setContent(content);
        return postRepository.save(post);
    }

    @Transactional
    public void deletePost(Long id) {
        postRepository.delete(getPost(id));
    }

    @Transactional
    public Post likePost(Long id) {
        Post post = getPost(id);
        post.setLikesCount(post.getLikesCount() + 1);
        return postRepository.save(post);
    }

    @Transactional
    public Comment addComment(Long postId, String content, Long parentId) {
        Post post = getPost(postId);
        User author = userRepository.findById(SecurityUtils.currentUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + SecurityUtils.currentUserId()));
        Comment.CommentBuilder builder = Comment.builder().post(post).author(author).content(content);
        if (parentId != null) {
            builder.parentComment(commentRepository.getReferenceById(parentId));
        }
        Comment comment = commentRepository.save(builder.build());
        post.setCommentsCount(post.getCommentsCount() + 1);
        postRepository.save(post);
        return comment;
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getComments(Long postId, int page, int size) {
        List<Comment> comments = commentRepository.findByPostId(postId, org.springframework.data.domain.PageRequest.of(page, size, org.springframework.data.domain.Sort.by("createdAt").ascending()));
        return comments.stream().map(c -> {
            Map<String, Object> map = new java.util.HashMap<>();
            map.put("id", c.getId());
            map.put("content", c.getContent());
            map.put("likesCount", c.getLikesCount() != null ? c.getLikesCount() : 0);
            map.put("authorId", c.getAuthor().getId());
            map.put("authorName", c.getAuthor().getName());
            map.put("parentCommentId", c.getParentComment() != null ? c.getParentComment().getId() : null);
            map.put("createdAt", c.getCreatedAt() != null ? c.getCreatedAt().toString() : "");
            return map;
        }).collect(java.util.stream.Collectors.toList());
    }

    @Transactional
    public void deleteComment(Long postId, Long commentId) {
        commentRepository.deleteById(commentId);
    }

    @Transactional
    public Story createStory(String mediaUrl, String mediaType, String caption) {
        User author = userRepository.findById(SecurityUtils.currentUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + SecurityUtils.currentUserId()));
        Story story = Story.builder()
                .author(author)
                .mediaUrl(mediaUrl)
                .mediaType(mediaType)
                .caption(caption)
                .expiresAt(Instant.now().plus(24, ChronoUnit.HOURS))
                .build();
        return storyRepository.save(story);
    }

    public List<Story> activeStories() {
        return storyRepository.findByExpiresAtAfterOrderByCreatedAtDesc(Instant.now());
    }

    @Transactional
    public void deleteStory(Long id) {
        storyRepository.deleteById(id);
    }

    public Map<String, Object> leaderboard() {
        return Map.of("message", "Leaderboard aggregation placeholder");
    }
}

