package com.farmsetu.controller;

import com.farmsetu.model.dto.common.ApiResponse;
import com.farmsetu.model.dto.common.PageResponse;
import com.farmsetu.model.entity.Comment;
import com.farmsetu.model.entity.Post;
import com.farmsetu.model.entity.Story;
import com.farmsetu.model.enums.PostType;
import com.farmsetu.service.CommunityService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class CommunityController {

    private final CommunityService communityService;

    @GetMapping("/posts")
    public ApiResponse<PageResponse<Post>> list(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ApiResponse.ok(communityService.listPosts(page, size));
    }

    @PostMapping("/posts")
    public ApiResponse<Post> create(@RequestBody Map<String, Object> body) {
        return ApiResponse.ok(communityService.createPost(
                (String) body.get("content"),
                body.get("postType") != null ? PostType.valueOf(body.get("postType").toString()) : null,
                (List<String>) body.get("mediaUrls"),
                (String) body.get("category"),
                (List<String>) body.get("tags"),
                (String) body.get("location")));
    }

    @GetMapping("/posts/{id}")
    public ApiResponse<Post> get(@PathVariable Long id) {
        return ApiResponse.ok(communityService.getPost(id));
    }

    @PutMapping("/posts/{id}")
    public ApiResponse<Post> update(@PathVariable Long id, @RequestBody Map<String, String> body) {
        return ApiResponse.ok(communityService.updatePost(id, body.get("content")));
    }

    @DeleteMapping("/posts/{id}")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        communityService.deletePost(id);
        return ApiResponse.ok(null);
    }

    @PostMapping("/posts/{id}/like")
    public ApiResponse<Post> like(@PathVariable Long id) {
        return ApiResponse.ok(communityService.likePost(id));
    }

    @PostMapping("/posts/{id}/comment")
    public ApiResponse<Comment> comment(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        Long parentId = body.get("parentCommentId") != null
                ? Long.valueOf(body.get("parentCommentId").toString()) : null;
        return ApiResponse.ok(communityService.addComment(id, (String) body.get("content"), parentId));
    }

    @GetMapping("/posts/{id}/comments")
    public ApiResponse<PageResponse<Comment>> comments(
            @PathVariable Long id,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ApiResponse.ok(communityService.getComments(id, page, size));
    }

    @DeleteMapping("/posts/{postId}/comments/{commentId}")
    public ApiResponse<Void> deleteComment(@PathVariable Long postId, @PathVariable Long commentId) {
        communityService.deleteComment(postId, commentId);
        return ApiResponse.ok(null);
    }

    @PostMapping("/stories")
    public ApiResponse<Story> createStory(@RequestBody Map<String, String> body) {
        return ApiResponse.ok(communityService.createStory(
                body.get("mediaUrl"), body.get("mediaType"), body.get("caption")));
    }

    @GetMapping("/stories")
    public ApiResponse<List<Story>> stories() {
        return ApiResponse.ok(communityService.activeStories());
    }

    @DeleteMapping("/stories/{id}")
    public ApiResponse<Void> deleteStory(@PathVariable Long id) {
        communityService.deleteStory(id);
        return ApiResponse.ok(null);
    }
}
