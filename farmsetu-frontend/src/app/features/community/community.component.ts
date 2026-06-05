import { Component, inject, OnInit, signal } from '@angular/core';
import { ApiService } from '../../core/services/api.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { LoadingSkeletonComponent } from '../../shared/components/loading-skeleton/loading-skeleton.component';

@Component({
  selector: 'fs-community',
  standalone: true,
  imports: [CommonModule, FormsModule, PageHeaderComponent, LoadingSkeletonComponent],
  template: `
    <fs-page-header title="Kheti Chaupal" subtitle="Share farming tips, ask expert questions, and discuss prices" />
    
    <div class="max-w-3xl mx-auto space-y-6">
      
      <!-- New Post Form Card -->
      <div class="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-xl border border-gray-100 dark:border-gray-700 space-y-4">
        <h3 class="font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <span>✍️</span> Share something with the community
        </h3>
        
        <form (ngSubmit)="createPost()" class="space-y-3">
          <div class="grid grid-cols-2 gap-3">
            <input type="text" [(ngModel)]="newPost.title" name="title" placeholder="Topic / Title" required class="border rounded-xl px-4 py-2.5 dark:bg-gray-700 outline-none focus:border-green-500 transition text-sm" />
            <select [(ngModel)]="newPost.category" name="category" class="border rounded-xl px-4 py-2.5 dark:bg-gray-700 outline-none focus:border-green-500 transition text-sm">
              <option value="General">General Talk</option>
              <option value="Crop Protection">Crop Protection</option>
              <option value="Mandi Prices">Mandi Prices</option>
              <option value="Weather Alerts">Weather Alerts</option>
            </select>
          </div>
          
          <textarea [(ngModel)]="newPost.content" name="content" rows="3" placeholder="What is happening on your farm? Ask a question or share a tip..." required class="w-full border rounded-xl px-4 py-3 dark:bg-gray-700 outline-none focus:border-green-500 transition text-sm"></textarea>
          
          <div class="flex justify-end">
            <button type="submit" class="px-6 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold rounded-xl shadow-md shadow-green-500/20 active:scale-[0.98] transition text-sm">
              Publish Post
            </button>
          </div>
        </form>
      </div>

      <!-- Posts List -->
      @if (loading()) {
        <fs-loading-skeleton />
      } @else {
        <div class="space-y-4">
          @for (post of posts(); track post.id) {
            <article class="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700/60 rounded-3xl p-6 shadow-md hover:shadow-lg transition duration-200 space-y-4">
              
              <!-- Author and Category -->
              <div class="flex justify-between items-start">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-full bg-green-50 dark:bg-green-950/30 flex items-center justify-center text-green-700 dark:text-green-300 font-bold">
                    {{ (post.authorName || 'Farmer').charAt(0) }}
                  </div>
                  <div>
                    <h4 class="font-bold text-gray-900 dark:text-white text-sm">{{ post.authorName || 'Farmer' }}</h4>
                    <p class="text-[10px] text-gray-400">Published in chaupal</p>
                  </div>
                </div>
                
                <span class="px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-green-700 dark:text-green-300 bg-green-50 dark:bg-green-900/30 rounded-full">
                  {{ post.category }}
                </span>
              </div>

              <!-- Post Content -->
              <div class="space-y-1">
                <h3 class="font-extrabold text-gray-900 dark:text-white">{{ post.title }}</h3>
                <p class="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{{ post.content }}</p>
              </div>

              <!-- Post Actions -->
              <div class="flex items-center gap-6 border-t border-gray-50 dark:border-gray-700/30 pt-3 text-xs text-gray-500">
                <button (click)="likePost(post)" class="flex items-center gap-1.5 hover:text-green-600 dark:hover:text-green-400 font-bold transition">
                  <span>❤️</span> {{ post.likesCount || 0 }} Likes
                </button>
                <button (click)="toggleComments(post.id)" class="flex items-center gap-1.5 hover:text-green-600 dark:hover:text-green-400 font-bold transition">
                  <span>💬</span> {{ post.commentsCount || 0 }} Comments
                </button>
              </div>

              <!-- Comments Section (Accordion) -->
              @if (isCommentsExpanded(post.id)) {
                <div class="border-t border-gray-100 dark:border-gray-700/50 pt-4 space-y-3">
                  
                  <!-- Write Comment Form -->
                  <div class="flex gap-2">
                    <input type="text" [(ngModel)]="newCommentText[post.id]" placeholder="Add a comment..." class="flex-1 border rounded-xl px-4 py-2 dark:bg-gray-700 outline-none text-xs focus:border-green-500" />
                    <button (click)="addComment(post.id)" class="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl text-xs transition">
                      Post
                    </button>
                  </div>

                  <!-- Comments List -->
                  <div class="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                    @for (c of comments()[post.id] || []; track c.id) {
                      <div class="bg-gray-50 dark:bg-gray-900/25 p-3 rounded-2xl text-xs space-y-1">
                        <div class="flex justify-between">
                          <span class="font-bold text-gray-700 dark:text-gray-200">{{ c.authorName || 'User' }}</span>
                          <span class="text-[9px] text-gray-400">Just now</span>
                        </div>
                        <p class="text-gray-600 dark:text-gray-300 leading-relaxed">{{ c.content }}</p>
                      </div>
                    } @empty {
                      <p class="text-[11px] text-gray-400 text-center py-2">No comments yet. Write a comment to join the discussion!</p>
                    }
                  </div>
                </div>
              }

            </article>
          } @empty {
            <div class="bg-white dark:bg-gray-800 rounded-3xl p-10 border border-dashed border-gray-200 dark:border-gray-700 text-center text-gray-500">
              <span class="text-4xl block mb-2">🌾</span>
              <p class="text-sm font-semibold">No discussions posted yet.</p>
              <p class="text-xs text-gray-400 mt-1">Be the first to share a post above!</p>
            </div>
          }
        </div>
      }
    </div>
  `
})
export class CommunityComponent implements OnInit {
  private readonly api = inject(ApiService);
  
  readonly loading = signal(true);
  readonly posts = signal<any[]>([]);
  readonly comments = signal<Record<number, any[]>>({});
  readonly expandedPostIds = signal<Set<number>>(new Set());

  // Form bindings
  newPost = { title: '', content: '', category: 'General' };
  newCommentText: Record<number, string> = {};

  ngOnInit(): void {
    this.loadPosts();
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

  createPost(): void {
    if (!this.newPost.title || !this.newPost.content) return;
    this.api.post<any>('/api/community/posts', {
      title: this.newPost.title,
      content: this.newPost.content,
      category: this.newPost.category,
      postType: 'GENERAL'
    }).subscribe({
      next: () => {
        this.newPost = { title: '', content: '', category: 'General' };
        this.loadPosts();
      }
    });
  }

  likePost(post: any): void {
    this.api.post<any>(`/api/community/posts/${post.id}/like`, {}).subscribe({
      next: (updatedPost) => {
        post.likesCount = updatedPost.likesCount;
      }
    });
  }

  isCommentsExpanded(postId: number): boolean {
    return this.expandedPostIds().has(postId);
  }

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
}
