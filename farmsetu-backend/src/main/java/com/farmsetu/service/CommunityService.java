package com.farmsetu.service;

import com.farmsetu.exception.ResourceNotFoundException;
import com.farmsetu.model.dto.common.PageResponse;
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
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
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

    public PageResponse<Post> listPosts(int page, int size) {
        Page<Post> posts = postRepository.findAll(PageRequest.of(page, size));
        return PageResponse.from(posts);
    }

    public Post getPost(Long id) {
        return postRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Post not found"));
    }

    @Transactional
    public Post createPost(String content, PostType type, List<String> mediaUrls,
                           String category, List<String> tags, String location) {
        User author = userRepository.getReferenceById(SecurityUtils.currentUserId());
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
        User author = userRepository.getReferenceById(SecurityUtils.currentUserId());
        Comment.CommentBuilder builder = Comment.builder().post(post).author(author).content(content);
        if (parentId != null) {
            builder.parentComment(commentRepository.getReferenceById(parentId));
        }
        Comment comment = commentRepository.save(builder.build());
        post.setCommentsCount(post.getCommentsCount() + 1);
        postRepository.save(post);
        return comment;
    }

    public PageResponse<Comment> getComments(Long postId, int page, int size) {
        return PageResponse.from(commentRepository.findByPostId(postId, PageRequest.of(page, size)));
    }

    @Transactional
    public void deleteComment(Long postId, Long commentId) {
        commentRepository.deleteById(commentId);
    }

    @Transactional
    public Story createStory(String mediaUrl, String mediaType, String caption) {
        User author = userRepository.getReferenceById(SecurityUtils.currentUserId());
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
