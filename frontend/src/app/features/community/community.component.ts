import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { ApiService } from '../../core/services/api.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { LoadingSkeletonComponent } from '../../shared/components/loading-skeleton/loading-skeleton.component';
import { ToastrService } from 'ngx-toastr';
import {
  LucidePlus,
  LucideSearch,
  LucideImage,
  LucideMapPin,
  LucideSend,
  LucideClock,
  LucideHeart,
  LucideMessageSquare,
  LucideTrophy,
  LucideX,
  LucideSprout,
  LucideBookOpen,
  LucidePenTool,
  LucideFlame
} from '@lucide/angular';

@Component({
  selector: 'fs-community',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    PageHeaderComponent, 
    LoadingSkeletonComponent,
    LucidePlus,
    LucideSearch,
    LucideImage,
    LucideMapPin,
    LucideSend,
    LucideClock,
    LucideHeart,
    LucideMessageSquare,
    LucideTrophy,
    LucideX,
    LucideSprout,
    LucideBookOpen,
    LucidePenTool,
    LucideFlame
  ],
  templateUrl: './community.component.html'
})
export class CommunityComponent implements OnInit {
  private readonly api = inject(ApiService);
  private readonly toastr = inject(ToastrService);
  
  readonly loading = signal(true);
  readonly posts = signal<any[]>([]);
  readonly comments = signal<Record<number, any[]>>({});
  readonly expandedPostIds = signal<Set<number>>(new Set());

  // Redesign state
  readonly stories = signal<any[]>([]);
  readonly leaderboard = signal<any[]>([]);
  readonly activeCategory = signal<string>('All');
  readonly searchQuery = signal<string>('');

  // Stories navigation state
  readonly showCreateStoryModal = signal<boolean>(false);
  readonly activeUserStoryIndex = signal<number>(-1);
  readonly activeSlideIndex = signal<number>(0);
  readonly storyProgress = signal<number>(0);
  readonly uploadingStoryImg = signal<boolean>(false);
  private activeStoryTimer: any = null;

  // New layout and modal signals
  readonly showCreatePostModal = signal<boolean>(false);
  readonly showLeaderboardModal = signal<boolean>(false);

  // Constants
  readonly categories = ['All', 'General', 'Crop Protection', 'Mandi Prices', 'Weather Alerts'];

  // Form bindings
  newPost = { title: '', content: '', category: 'General', mediaUrl: '', location: '' };
  newStory = { mediaUrl: '', caption: '' };
  newCommentText: Record<number, string> = {};

  // Computed filtered list of posts
  readonly filteredPosts = computed(() => {
    let list = this.posts();
    const cat = this.activeCategory();
    const query = this.searchQuery().toLowerCase().trim();

    if (cat !== 'All') {
      list = list.filter(p => p.category === cat);
    }
    if (query) {
      list = list.filter(p =>
        (p.title && p.title.toLowerCase().includes(query)) ||
        (p.content && p.content.toLowerCase().includes(query)) ||
        (p.authorName && p.authorName.toLowerCase().includes(query))
      );
    }
    return list;
  });

  // Computed grouped user stories
  readonly groupedStories = computed(() => {
    const rawStories = this.stories();
    const groupsMap = new Map<number, any>();
    
    for (const story of rawStories) {
      const authorId = story.authorId;
      if (!groupsMap.has(authorId)) {
        groupsMap.set(authorId, {
          authorId,
          authorName: story.authorName || 'Farmer',
          authorProfilePhoto: story.authorProfilePhoto,
          stories: []
        });
      }
      groupsMap.get(authorId)!.stories.push({
        id: story.id,
        mediaUrl: story.mediaUrl,
        mediaType: story.mediaType,
        caption: story.caption,
        createdAt: story.createdAt
      });
    }
    
    // Sort stories inside each group chronologically (oldest first)
    for (const group of groupsMap.values()) {
      group.stories.sort((a: any, b: any) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    }
    
    return Array.from(groupsMap.values());
  });

  ngOnInit(): void {
    this.loadPosts();
    this.loadStories();
    this.loadLeaderboard();
  }

  loadPosts(): void {
    this.api.get<any[]>('/api/community/posts').subscribe({
      next: (arr) => {
        this.posts.set(arr);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  loadStories(): void {
    this.api.get<any[]>('/api/community/stories').subscribe({
      next: (arr) => {
        this.stories.set(arr);
      }
    });
  }

  loadLeaderboard(): void {
    this.api.get<any[]>('/api/community/leaderboard').subscribe({
      next: (arr) => {
        // Sort just in case backend does not
        const sorted = (arr || []).sort((a, b) => (b.reputationScore || 0) - (a.reputationScore || 0));
        this.leaderboard.set(sorted);
      }
    });
  }

  createPost(): void {
    if (!this.newPost.title || !this.newPost.content) return;
    
    // Support image attach
    const mediaUrls = this.newPost.mediaUrl ? [this.newPost.mediaUrl] : [];
    
    this.api.post<any>('/api/community/posts', {
      title: this.newPost.title,
      content: this.newPost.content,
      category: this.newPost.category,
      postType: mediaUrls.length > 0 ? 'IMAGE' : 'TEXT',
      mediaUrls: mediaUrls,
      location: this.newPost.location
    }).subscribe({
      next: () => {
        this.newPost = { title: '', content: '', category: 'General', mediaUrl: '', location: '' };
        this.showCreatePostModal.set(false);
        this.loadPosts();
        this.loadLeaderboard(); // Update leaderboard for reputation points update
      }
    });
  }

  likePost(post: any): void {
    // Optimistic Update
    const originallyLiked = post.hasLiked;
    post.hasLiked = !originallyLiked;
    if (post.hasLiked) {
      post.likesCount = (post.likesCount || 0) + 1;
    } else {
      post.likesCount = Math.max(0, (post.likesCount || 0) - 1);
    }
    this.api.post<any>(`/api/community/posts/${post.id}/like`, {}).subscribe({
      next: (updatedPost) => {
        post.likesCount = updatedPost.likesCount;
        this.loadLeaderboard(); // Update leaderboard for reputation points update
      },
      error: () => {
        post.hasLiked = originallyLiked;
        if (post.hasLiked) {
          post.likesCount = (post.likesCount || 0) + 1;
        } else {
          post.likesCount = Math.max(0, (post.likesCount || 0) - 1);
        }
      }
    });
  }

  isCommentsExpanded(postId: number): boolean {
    return this.expandedPostIds().has(postId);
  }

  // Comments toggling
  toggleComments(postId: number): void {
    const nextIds = new Set(this.expandedPostIds());
    if (nextIds.has(postId)) {
      nextIds.delete(postId);
      this.expandedPostIds.set(nextIds);
    } else {
      nextIds.add(postId);
      this.expandedPostIds.set(nextIds);
      this.loadComments(postId);
    }
  }

  loadComments(postId: number): void {
    this.api.get<any[]>(`/api/community/posts/${postId}/comments`).subscribe({
      next: (arr) => {
        const nextComments = { ...this.comments() };
        nextComments[postId] = arr;
        this.comments.set(nextComments);
      }
    });
  }

  addComment(postId: number): void {
    const text = this.newCommentText[postId];
    if (!text) return;

    this.api.post<any>(`/api/community/posts/${postId}/comment`, {
      content: text
    }).subscribe({
      next: () => {
        this.newCommentText[postId] = '';
        this.loadComments(postId);
        // Refresh comment count in list
        const post = this.posts().find(p => p.id === postId);
        if (post) post.commentsCount = (post.commentsCount || 0) + 1;
      }
    });
  }

  // Categories and filters logic
  setCategory(cat: string): void {
    this.activeCategory.set(cat);
  }

  onSearchInput(event: Event): void {
    const query = (event.target as HTMLInputElement).value;
    this.searchQuery.set(query);
  }

  // Create Post Modal Logic
  openCreatePostModal(): void {
    this.showCreatePostModal.set(true);
  }

  closeCreatePostModal(): void {
    this.showCreatePostModal.set(false);
    this.newPost = { title: '', content: '', category: 'General', mediaUrl: '', location: '' };
  }

  // Mobile Leaderboard Logic
  openLeaderboardModal(): void {
    this.showLeaderboardModal.set(true);
  }

  closeLeaderboardModal(): void {
    this.showLeaderboardModal.set(false);
  }

  // Stories Logic
  openCreateStoryModal(): void {
    this.showCreateStoryModal.set(true);
  }

  closeCreateStoryModal(): void {
    this.showCreateStoryModal.set(false);
    this.newStory = { mediaUrl: '', caption: '' };
  }

  onStoryFileSelected(event: Event): void {
    const target = event.target as HTMLInputElement;
    if (target.files && target.files.length > 0) {
      const file = target.files[0];
      this.uploadingStoryImg.set(true);
      const formData = new FormData();
      formData.append('file', file);
      
      this.api.post<string>('/api/chats/upload', formData).subscribe({
        next: (url) => {
          this.newStory.mediaUrl = url;
          this.uploadingStoryImg.set(false);
        },
        error: (err) => {
          this.toastr.error('Failed to upload image. Please try again.');
          this.uploadingStoryImg.set(false);
        }
      });
    }
  }

  createStory(): void {
    if (!this.newStory.mediaUrl) return;

    this.api.post<any>('/api/community/stories', {
      mediaUrl: this.newStory.mediaUrl,
      mediaType: 'IMAGE',
      caption: this.newStory.caption
    }).subscribe({
      next: () => {
        this.closeCreateStoryModal();
        this.loadStories();
      }
    });
  }

  viewStory(userIndex: number): void {
    this.activeUserStoryIndex.set(userIndex);
    this.activeSlideIndex.set(0);
    this.startStoryTimer();
  }

  startStoryTimer(): void {
    if (this.activeStoryTimer) {
      clearInterval(this.activeStoryTimer);
    }
    this.storyProgress.set(0);
    const intervalTime = 40; 
    const totalDuration = 5000; // 5 seconds
    const steps = totalDuration / intervalTime;
    let currentStep = 0;

    this.activeStoryTimer = setInterval(() => {
      currentStep++;
      this.storyProgress.set((currentStep / steps) * 100);
      if (currentStep >= steps) {
        clearInterval(this.activeStoryTimer);
        this.nextStory();
      }
    }, intervalTime);
  }

  nextStory(): void {
    const userGroups = this.groupedStories();
    const userIdx = this.activeUserStoryIndex();
    if (userIdx < 0 || userIdx >= userGroups.length) {
      this.closeStoryViewer();
      return;
    }
    
    const activeGroup = userGroups[userIdx];
    const nextSlideIdx = this.activeSlideIndex() + 1;
    
    if (nextSlideIdx < activeGroup.stories.length) {
      // Go to next slide for same user
      this.activeSlideIndex.set(nextSlideIdx);
      this.startStoryTimer();
    } else {
      // Go to next user
      const nextUserIdx = userIdx + 1;
      if (nextUserIdx < userGroups.length) {
        this.activeUserStoryIndex.set(nextUserIdx);
        this.activeSlideIndex.set(0);
        this.startStoryTimer();
      } else {
        // No more users/stories
        this.closeStoryViewer();
      }
    }
  }

  prevStory(): void {
    const userGroups = this.groupedStories();
    const userIdx = this.activeUserStoryIndex();
    if (userIdx < 0 || userIdx >= userGroups.length) {
      this.closeStoryViewer();
      return;
    }
    
    const prevSlideIdx = this.activeSlideIndex() - 1;
    if (prevSlideIdx >= 0) {
      // Go to previous slide for same user
      this.activeSlideIndex.set(prevSlideIdx);
      this.startStoryTimer();
    } else {
      // Go to previous user
      const prevUserIdx = userIdx - 1;
      if (prevUserIdx >= 0) {
        this.activeUserStoryIndex.set(prevUserIdx);
        // Set slide index to the last story of the previous user
        this.activeSlideIndex.set(userGroups[prevUserIdx].stories.length - 1);
        this.startStoryTimer();
      } else {
        // At the very first story, close viewer
        this.closeStoryViewer();
      }
    }
  }

  closeStoryViewer(): void {
    if (this.activeStoryTimer) {
      clearInterval(this.activeStoryTimer);
      this.activeStoryTimer = null;
    }
    this.activeUserStoryIndex.set(-1);
    this.activeSlideIndex.set(0);
    this.storyProgress.set(0);
  }

  // Styling and display helpers
  getCategoryBadgeClass(category: string): string {
    const base = 'px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full shadow-sm ';
    switch (category) {
      case 'Crop Protection':
        return base + 'text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/30';
      case 'Mandi Prices':
        return base + 'text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 border border-amber-100 dark:border-amber-900/30';
      case 'Weather Alerts':
        return base + 'text-cyan-700 dark:text-cyan-300 bg-cyan-50 dark:bg-cyan-950/40 border border-cyan-100 dark:border-cyan-900/30';
      default:
        return base + 'text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/30';
    }
  }

  getRankBadgeClass(index: number): string {
    const base = 'w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-extrabold ';
    if (index === 0) return base + 'bg-amber-100 text-amber-800 border border-amber-200 dark:bg-amber-950 dark:text-amber-300';
    if (index === 1) return base + 'bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:text-slate-300';
    if (index === 2) return base + 'bg-orange-100 text-orange-800 border border-orange-200 dark:bg-orange-950 dark:text-orange-300';
    return base + 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400';
  }

  formatTime(createdAtStr: string): string {
    if (!createdAtStr) return 'Recently';
    try {
      const created = new Date(createdAtStr);
      const diffMs = new Date().getTime() - created.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours}h ago`;
      return `${Math.floor(diffHours / 24)}d ago`;
    } catch {
      return 'Recently';
    }
  }

  onMediaPreviewError(): void {
    // Fallback for invalid media url
    this.newPost.mediaUrl = '';
  }
}
