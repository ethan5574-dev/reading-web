"use client";

import { useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Search, Eye, Calendar, User, Hash } from 'lucide-react';
import { searchPosts } from '@/fetching/post';
import { useQuery } from '@tanstack/react-query';
import Loading from '@/app/loading';

interface Author {
  user_id: number;
  email: string;
  username: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

interface Post {
  post_id: number;
  author_id: number;
  total_view_count: number;
  title: string;
  image_url: string | null;
  isDeleted: boolean | null;
  content: string;
  createdAt: string;
  updatedAt: string;
  author: Author;
}

export default function SearchPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [currentQuery, setCurrentQuery] = useState(searchParams.get('q') || '');
  const [page, setPage] = useState(1);
  const limit = 10;

  const { data: searchResults, isLoading, isError } = useQuery({
    queryKey: ['search', currentQuery, page],
    queryFn: () => searchPosts(currentQuery, page, limit),
    enabled: !!currentQuery && currentQuery.length >= 2,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim().length >= 2) {
      setCurrentQuery(query.trim());
      setPage(1);
      // Update URL without page reload
      const params = new URLSearchParams();
      params.set('q', query.trim());
      // Use replace to avoid adding to history
      router.replace(`/search?${params.toString()}`);
    }
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const stripHtml = (html?: string) => (html ? html.replace(/<[^>]+>/g, '') : '');

  const posts = searchResults?.data?.data || [];
  const total = searchResults?.data?.total || 0;
  const totalPages = searchResults?.data?.totalPages || 0;


  return (
    <div className="min-h-screen bg-background pt-16">
      <div className="mx-auto max-w-4xl px-4 py-8">
        {/* Search Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-4">Search Posts</h1>
          
          {/* Search Form */}
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-secondary" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search posts by title or content..."
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-secondary bg-background text-foreground placeholder:text-secondary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <button
              type="submit"
              disabled={query.trim().length < 2}
              className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors"
            >
              Search
            </button>
          </form>

          {/* Search Info */}
          {currentQuery && (
            <div className="mt-4 text-secondary">
              {isLoading ? (
                <p>Searching for &ldquo;{currentQuery}&rdquo;...</p>
              ) : (
                <div>
                  <p>
                    Found {total} result{total !== 1 ? 's' : ''} for &ldquo;{currentQuery}&rdquo;
                    {totalPages > 1 && ` (Page ${page} of ${totalPages})`}
                  </p>
                  {/* Debug info */}
                  <p className="text-xs mt-1">
                    Debug: Posts length = {posts.length}, Total = {total}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Loading State */}
        {isLoading && <Loading />}

        {/* Error State */}
        {isError && (
          <div className="text-center py-12">
            <div className="text-error mb-2">Something went wrong</div>
            <p className="text-secondary">Please try again later</p>
          </div>
        )}

        {/* No Results */}
        {!isLoading && !isError && currentQuery && posts.length === 0 && (
          <div className="text-center py-12">
            <Search className="mx-auto h-12 w-12 text-secondary mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No results found</h3>
            <p className="text-secondary">
              No posts match your search for &ldquo;{currentQuery}&rdquo;. Try different keywords.
            </p>
          </div>
        )}

        {/* Search Results */}
        {!isLoading && !isError && posts.length > 0 && (
          <div className="space-y-6">
            {posts.map((post: Post) => (
              <article
                key={post.post_id}
                className="bg-background border border-secondary rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => router.push(`/post/${post.post_id}`)}
              >
                {/* Post Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h2 className="text-xl font-semibold text-foreground mb-2 hover:text-primary transition-colors">
                      {post.title}
                    </h2>
                    <div className="flex items-center gap-4 text-sm text-secondary">
                      <div className="flex items-center gap-1">
                        <User className="h-4 w-4" />
                        <span className="text-primary font-medium">{post.author?.username || 'Unknown'}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Eye className="h-4 w-4" />
                        <span>{post.total_view_count?.toLocaleString() || 0} views</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Post Image */}
                  {post.image_url && (
                    <div className="ml-4 flex-shrink-0">
                      <img
                        src={post.image_url}
                        alt={post.title}
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                    </div>
                  )}
                </div>

                {/* Post Content Preview */}
                <div className="text-secondary line-clamp-3">
                  {stripHtml(post.content).slice(0, 200)}
                  {stripHtml(post.content).length > 200 && '...'}
                </div>

                {/* Post Footer */}
                <div className="mt-4 pt-4 border-t border-secondary">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs text-secondary">
                      <Hash className="h-3 w-3" />
                      <span>ID: {post.post_id}</span>
                    </div>
                    <span className="text-xs text-secondary">
                      Read more →
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        {/* Pagination */}
        {!isLoading && !isError && totalPages > 1 && (
          <div className="mt-8 flex justify-center">
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 1}
                className="px-3 py-2 rounded-lg border border-secondary bg-background text-foreground hover:bg-secondary/10 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors"
              >
                Previous
              </button>
              
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNum = Math.max(1, Math.min(totalPages - 4, page - 2)) + i;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`px-3 py-2 rounded-lg border transition-colors cursor-pointer ${
                        pageNum === page
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'border-secondary bg-background text-foreground hover:bg-secondary/10'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
              
              <button
                onClick={() => handlePageChange(page + 1)}
                disabled={page === totalPages}
                className="px-3 py-2 rounded-lg border border-secondary bg-background text-foreground hover:bg-secondary/10 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* Initial State */}
        {!currentQuery && (
          <div className="text-center py-12">
            <Search className="mx-auto h-16 w-16 text-secondary mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">Search Posts</h3>
            <p className="text-secondary">
              Enter keywords to search through all posts by title and content.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
