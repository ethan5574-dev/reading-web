"use client"

import { useEffect, useMemo, useState } from "react"
import { Plus, Search, MoreHorizontal, Eye, Calendar, User, Hash } from "lucide-react"
import Modal from "@/components/Modal"
import dynamic from 'next/dynamic';
import { AuthGuard } from "@/hook/useAuthGuard";
import { createPost, getPostsByAuthor, updatePost, deletePost } from "@/fetching/post";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toastError, toastSuccess } from "@/utils/toast";
const CKEditorClient = dynamic(() => import('@/components/CKEditorClient'), { ssr: false });

const useCreatePostMutation = () => {
  return useMutation({
    mutationFn: (formData: FormData) => createPost(formData as any),
    onSuccess: () => toastSuccess('Post created successfully'),
    onError: (err) => toastError(err?.message),
  });
}

const useUpdatePostMutation = () => {
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => updatePost(id, data),
    onSuccess: () => toastSuccess('Post updated successfully'),
    onError: (err) => toastError(err?.message),
  });
}

const useDeletePostMutation = () => {
  return useMutation({
    mutationFn: (id: number) => deletePost(id),
    onSuccess: () => toastSuccess('Post deleted successfully'),
    onError: (err) => toastError(err?.message),
  });
}

type Post = {
  post_id: number
  author_id: number
  total_view_count: number
  title: string
  image_url?: string | null
  isDeleted?: boolean | null
  content: string
  createdAt: string
  updatedAt: string
}

const ManagePostPage = () => {
  const queryClient = useQueryClient();
  const [posts, setPosts] = useState<Post[]>()
  const [showForm, setShowForm] = useState<boolean>(false)
  const [editingPost, setEditingPost] = useState<Post | null>(null)
  const [title, setTitle] = useState<string>("")
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [content, setContent] = useState<string>("")
  const [isPublished, setIsPublished] = useState<boolean>(true)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const createMutation = useCreatePostMutation();
  const updateMutation = useUpdatePostMutation();
  const deleteMutation = useDeletePostMutation();
  const [limit, setLimit] = useState<number>(10);
  const [page, setPage] = useState<number>(1);
  useEffect(() => {
    const fetchPosts = async () => {
      const posts = await getPostsByAuthor(page, limit);
      setPosts(posts?.data?.data);
    }
    fetchPosts();
  }, [page, limit]);

  const handleAdd = async () => {
    if (!title.trim() || !content.trim()) return
    try {
      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('content', content.trim());
      formData.append('isPublished', String(isPublished));
      if (imageFile) formData.append('image', imageFile);
      await createMutation.mutateAsync(formData);
      setShowForm(false);
      setTitle("");
      setContent("");
      setImageFile(null);
      // Refresh posts list
      const posts = await getPostsByAuthor(page, limit);
      setPosts(posts?.data?.data);
    } catch (e) {
      // You can add toast here if needed
    }
  }

  const handleEdit = (post: Post) => {
    setEditingPost(post);
    setTitle(post.title);
    setContent(post.content);
    setIsPublished(!post.isDeleted);
    setImageFile(null);
    setShowForm(true);
  }

  const handleUpdate = async () => {
    if (!title.trim() || !content.trim() || !editingPost) return
    try {
      const updateData = {
        title: title.trim(),
        content: content.trim(),
        isDeleted: !isPublished,
      };
      await updateMutation.mutateAsync({ id: editingPost.post_id, data: updateData });
      setShowForm(false);
      setEditingPost(null);
      setTitle("");
      setContent("");
      setImageFile(null);
      // Refresh posts list
      const posts = await getPostsByAuthor(page, limit);
      setPosts(posts?.data?.data);
    } catch (e) {
      // Error handled by mutation
    }
  }

  const handleDelete = async (postId: number) => {
    if (confirm('Are you sure you want to delete this post?')) {
      try {
        await deleteMutation.mutateAsync(postId);
        // Refresh posts list
        const posts = await getPostsByAuthor(page, limit);
        setPosts(posts?.data?.data);
      } catch (e) {
        // Error handled by mutation
      }
    }
  }

  const handleCancel = () => {
    setShowForm(false);
    setEditingPost(null);
    setTitle("");
    setContent("");
    setImageFile(null);
  }

  const filteredPosts = posts?.filter(
    (post) =>
      post.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <AuthGuard>
      <div className="min-h-screen mt-16 bg-white text-zinc-900">
        <div className="mx-auto max-w-7xl px-6 py-8">
          {/* Header */}
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-semibold text-foreground text-balance">Content Management</h1>
              <p className="mt-1 text-sm text-muted-foreground">Manage and organize your blog posts</p>
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              Create Post
            </button>
          </div>

          {/* Search and Filters */}
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search posts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-secondary bg-background pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-secondary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div className="flex items-center gap-2 text-sm text-secondary">
              <span>{filteredPosts?.length || 0} posts</span>
            </div>
          </div>

          {/* Posts Table */}
          <div className="overflow-hidden rounded-lg border border-secondary bg-background">
            {/* Table Header */}
            <div className="hidden grid-cols-[60px_1fr_200px_120px_140px_60px] border-b border-secondary bg-secondary/30 px-6 py-4 text-xs font-medium text-secondary uppercase tracking-wider lg:grid">
              <div className="flex items-center gap-2">
                <Hash className="h-3 w-3" />
                ID
              </div>
              <div>Title</div>
              <div className="flex items-center gap-2">
                <User className="h-3 w-3" />
                Author
              </div>
              <div className="flex items-center gap-2">
                <Eye className="h-3 w-3" />
                Views
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-3 w-3" />
                Created
              </div>
              <div></div>
            </div>

            {/* Table Body */}
            <div className="divide-y divide-secondary">
              {filteredPosts?.map((post, index) => (
                <div
                  key={post.post_id}
                  className="group grid grid-cols-1 gap-4 px-6 py-4 transition-colors hover:bg-secondary/20 lg:grid-cols-[60px_1fr_200px_120px_140px_60px] lg:items-center lg:gap-0"
                >
                  {/* Mobile Layout */}
                  <div className="lg:hidden space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-medium text-foreground text-pretty">{post.title}</h3>
                        <div className="mt-1 flex items-center gap-4 text-sm text-secondary">
                          <span className="flex items-center gap-1">
                          <Hash className="h-3 w-3" />
                          {post.post_id}
                          </span>
                          <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {post.author_id}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <button 
                          onClick={() => handleEdit(post)}
                          className="rounded-md p-1.5 text-primary transition-colors hover:bg-primary/10 hover:text-primary cursor-pointer"
                          title="Edit post"
                        >
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button 
                          onClick={() => handleDelete(post.post_id)}
                          className="rounded-md p-1.5 text-error transition-colors hover:bg-error/10 hover:text-error cursor-pointer"
                          title="Delete post"
                        >
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-secondary">
                      <span className="flex items-center gap-1">
                      <Eye className="h-3 w-3" />
                      {post.total_view_count?.toLocaleString?.() || post.total_view_count} views
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(post.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {/* Desktop Layout */}
                  <div className="hidden lg:block">
                    <span className="inline-flex items-center rounded-md bg-secondary/20 px-2 py-1 text-xs font-mono text-secondary">
                      #{post.post_id}
                    </span>
                  </div>
                  <div className="hidden lg:block">
                    <h3 className="font-medium text-foreground text-pretty group-hover:text-primary transition-colors">
                      {post.title}
                    </h3>
                  </div>
                  <div className="hidden lg:block text-sm text-secondary">{post.author_id}</div>
                  <div className="hidden lg:block text-sm text-secondary">{post.total_view_count?.toLocaleString?.() || post.total_view_count}</div>
                  <div className="hidden lg:block text-sm text-secondary">
                    {new Date(post.createdAt).toLocaleDateString()}
                  </div>
                  <div className="hidden lg:block">
                    <div className="flex gap-1">
                      <button 
                        onClick={() => handleEdit(post)}
                        className="rounded-md p-1.5 text-primary transition-colors hover:bg-primary/10 hover:text-primary cursor-pointer"
                        title="Edit post"
                      >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button 
                        onClick={() => handleDelete(post.post_id)}
                        className="rounded-md p-1.5 text-error transition-colors hover:bg-error/10 hover:text-error cursor-pointer"
                        title="Delete post"
                      >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredPosts && filteredPosts.length === 0 && (
              <div className="px-6 py-12 text-center">
                <div className="mx-auto h-12 w-12 rounded-full bg-secondary/20 flex items-center justify-center mb-4">
                  <Search className="h-5 w-5 text-secondary" />
                </div>
                <h3 className="text-sm font-medium text-foreground mb-1">No posts found</h3>
                <p className="text-sm text-secondary">
                  {searchQuery ? "Try adjusting your search terms" : "Get started by creating your first post"}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Modal Form */}
        <Modal
          isOpen={showForm}
          onClose={() => setShowForm(false)}
          size="xl"
        >
          <div className="p-6">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-zinc-900">
                {editingPost ? 'Edit Post' : 'Create New Post'}
              </h2>
              <p className="text-sm text-zinc-600 mt-1">
                {editingPost ? 'Update your blog post' : 'Add a new blog post to your collection'}
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-900 mb-2">Post Title</label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter post title..."
                  className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
           
              <div>
                <label className="block text-sm font-medium text-zinc-900 mb-2">Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
                  className="block w-full text-sm text-zinc-900 file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-zinc-100 file:text-zinc-700 hover:file:bg-zinc-200"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-900 mb-2">Is Published</label>
                  <select
                    value={isPublished ? 'true' : 'false'}
                    onChange={(e) => setIsPublished(e.target.value === 'true')}
                    className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  >
                    <option value="true">true</option>
                    <option value="false">false</option>
                  </select>
                </div>
             
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-900 mb-2">Content</label>
                <CKEditorClient value={content} onChange={setContent} placeholder="Write your post..." />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleCancel}
                className="flex-1 rounded-lg border border-zinc-200 bg-white px-4 py-2.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={editingPost ? handleUpdate : handleAdd}
                disabled={!title.trim() || !content.trim() || createMutation.isPending || updateMutation.isPending}
                className="flex-1 rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-800 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
              >
                {editingPost 
                  ? (updateMutation.isPending ? 'Updating…' : 'Update Post')
                  : (createMutation.isPending ? 'Creating…' : 'Create Post')
                }
              </button>
            </div>
          </div>
        </Modal>
      </div>
    </AuthGuard>
  )
}

export default ManagePostPage
