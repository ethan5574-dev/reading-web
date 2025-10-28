'use client';
import Image from "next/image";
import { StickyNote, Eye, ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";
import {getAllPosts, getTopView} from "@/fetching/post";    
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

interface Author {
  user_id: number;
  email: string;
  password_hash: string;
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

export default function Home() {
  const [filterType, setFilterType] = useState<'all' | 'top30'>('all');
  const [showDropdown, setShowDropdown] = useState(false);

  const { data: posts } = useQuery({
    queryKey: ['posts'],
    queryFn: () => getAllPosts(),
  });

  const { data: topView, isLoading: isTopViewLoading} = useQuery({
    queryKey: ['topView'],
    queryFn: () => getTopView(30, 3),
    enabled: filterType === 'top30', // Only fetch when top30 is selected
  });

  const apiPosts = posts?.data?.data || [];
  const topViewPosts = topView?.data || [];
  
  // Sort by view count descending and take top 3
  const dataTop3Post = [...apiPosts]
    .sort((a, b) => b.total_view_count - a.total_view_count)
    .slice(0, 3);
  
  const stripHtml = (html?: string) => (html ? html.replace(/<[^>]+>/g, '') : '');
  
  const router = useRouter();
  
  // Close dropdown when clicking outside
  const handleClickOutside = (e: React.MouseEvent) => {
    if (showDropdown) {
      setShowDropdown(false);
    }
  };

  return (
    <div className="bg-white min-h-screen pt-16 cursor-pointer" onClick={handleClickOutside}>
      <div className="bg-zinc-900 mx-auto pt-6 sm:pt-10">
        <div className="mx-auto grid max-w-[1200px] grid-cols-1 max-sm:gap-4 p-4 sm:px-6 lg:grid-cols-2">
          <div 
            className="relative h-[240px] sm:h-[320px] md:h-[420px] lg:h-[500px] bg-cover bg-center"
            style={{
              backgroundImage: dataTop3Post[0]?.image_url 
                ? `url(${dataTop3Post[0].image_url})` 
                : `url('https://cdn-media.sforum.vn/storage/app/media/anh-dep-15.jpg')`
            }}
          >
            <div className="absolute inset-0 z-10 bg-gradient-to-b from-[70%] to-[100%] from-transparent to-black"></div>
            <div className="absolute left-2 bottom-2 z-20">
              <h1 className="text-white text-2xl font-bold leading-tight max-w-xl cursor-pointer" onClick={() => router.push(`/post/${dataTop3Post[0]?.post_id}`)}>
                {dataTop3Post[0]?.title}
              </h1>
              <div className="flex items-center mt-4 space-x-3">
                <Image
                  src="https://randomuser.me/api/portraits/men/32.jpg"
                  alt="John Doe"
                  width={40}
                  height={40}
                  className="rounded-full border-2 border-white"
                />
                <span className="text-white font-bold">{dataTop3Post[0]?.author?.username}</span>
                <span className="text-gray-300">·</span>
                <span className="text-gray-300">{new Date(dataTop3Post[0]?.createdAt || Date.now()).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-stretch justify-center max-sm:gap-4">
            <div 
              className="relative h-[180px] sm:h-[220px] md:h-[250px] bg-cover bg-center"
              style={{
                backgroundImage: dataTop3Post[1]?.image_url 
                  ? `url(${dataTop3Post[1].image_url})` 
                  : `url('https://cdn-media.sforum.vn/storage/app/media/anh-dep-17.jpg')`
              }}
            >
              <div className="absolute inset-0 z-10 bg-gradient-to-b from-[80%] to-[100%] from-transparent to-black"></div>
              <div className="absolute left-2 bottom-2 z-20">
                <h1 className="text-white text-xl font-bold leading-tight max-w-xl cursor-pointer" onClick={() => router.push(`/post/${dataTop3Post[1]?.post_id}`)}>
                  {dataTop3Post[1]?.title}
                </h1>
                <div className="flex items-center mt-2 space-x-3">
                  <span className="text-white font-bold">{dataTop3Post[1]?.author?.username}</span>
                  <span className="text-gray-300">·</span>
                  <span className="text-gray-300">{new Date(dataTop3Post[1]?.createdAt || Date.now()).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
            <div 
              className="relative h-[180px] sm:h-[220px] md:h-[250px] bg-cover bg-center"
              style={{
                backgroundImage: dataTop3Post[2]?.image_url 
                  ? `url(${dataTop3Post[2].image_url})` 
                  : `url('https://cdn-media.sforum.vn/storage/app/media/anh-dep-13.jpg')`
              }}
            >
              <div className="absolute inset-0 z-10 bg-gradient-to-b from-[80%] to-[100%] from-transparent to-black curso"></div>
              <div className="absolute left-2 bottom-2 z-20">
                <h1 className="text-white text-xl font-bold leading-tight max-w-xl cursor-pointer" onClick={() => router.push(`/post/${dataTop3Post[2]?.post_id}`)}>
                  {dataTop3Post[2]?.title}
                </h1>
                <div className="flex items-center mt-2 space-x-3">
                  <span className="text-white font-bold">{dataTop3Post[2]?.author?.username}</span>
                  <span className="text-gray-300">·</span>
                  <span className="text-gray-300">{new Date(dataTop3Post[2]?.createdAt || Date.now()).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className=" mx-auto pt-10">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6">
          {/* Filter Dropdown */}
          <div className="mb-6 flex justify-between items-center">
            <h2 className="text-2xl font-bold text-zinc-900">
              {filterType === 'all' ? 'All Posts' : 'Top 3 Posts (30 days)'}
            </h2>
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowDropdown(!showDropdown);
                }}
                className="flex items-center gap-2 rounded-lg border border-secondary bg-white px-4 py-2 text-sm font-medium text-secondary hover:bg-secondary/10 cursor-pointer"
              >
                {filterType === 'all' ? 'All Posts' : 'Top 3 (30 days)'}
                <ChevronDown className="h-4 w-4" />
              </button>
              {showDropdown && (
                <div className="absolute right-0 mt-2 w-48 overflow-hidden rounded-md border border-zinc-200 bg-white shadow-lg z-10">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setFilterType('all');
                      setShowDropdown(false);
                    }}
                    className={`flex w-full items-center px-4 py-2 text-sm hover:bg-secondary/10 cursor-pointer ${
                      filterType === 'all' ? 'bg-secondary/20 text-primary' : 'text-secondary'
                    }`}
                  >
                    All Posts
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setFilterType('top30');
                      setShowDropdown(false);
                    }}
                    className={`flex w-full items-center px-4 py-2 text-sm hover:bg-secondary/10 cursor-pointer ${
                      filterType === 'top30' ? 'bg-secondary/20 text-primary' : 'text-secondary'
                    }`}
                  >
                    Top 3 (30 days)
                  </button>
                </div>
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">{/* masonry columns */}
            {filterType === 'all' ? (
              apiPosts.map((post: Post) => (
              <article key={post.post_id} className="group mb-6 break-inside-avoid overflow-hidden rounded-md bg-white shadow">
                {post.image_url ? (
                  <div className="relative h-56 w-full overflow-hidden">
                    <img
                      src={post.image_url}
                      alt={post.title}
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 ease-out will-change-transform group-hover:scale-110"
                    />
                  </div>
                ) : (
                  <div className="h-56 flex w-full items-center justify-center bg-zinc-100 text-zinc-400">
                    <StickyNote className="h-8 w-8" />
                  </div>
                )}
                <div className="p-4">
                  <p className="text-xs text-gray-500">{new Date(post.createdAt).toLocaleDateString()}</p>
                  <h3 className="mt-1 text-base font-semibold text-zinc-900 cursor-pointer hover:text-primary" onClick={() => router.push(`/post/${post.post_id}`)}>{post.title}</h3>
                  <p className="mt-2 line-clamp-3 text-sm text-gray-600">{stripHtml(post.content).slice(0, 160)}</p>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-xs font-semibold text-primary">{post.author.username}</span>
                    <span className="flex items-center gap-1 text-xs text-zinc-500">
                      <Eye className="h-4 w-4" />
                      {post.total_view_count.toLocaleString()}
                    </span>
                  </div>
                </div>
              </article>
              ))
            ) : (
              isTopViewLoading ? (
                <div className="col-span-full flex justify-center items-center py-12">
                  <div className="text-zinc-500">Loading top posts...</div>
                </div>
              ) : (
                topViewPosts.map((post: Post) => (
                  <article key={post.post_id} className="group mb-6 break-inside-avoid overflow-hidden rounded-md bg-white shadow">
                    {post.image_url ? (
                      <div className="relative h-56 w-full overflow-hidden">
                        <img
                          src={post.image_url}
                          alt={post.title}
                          className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 ease-out will-change-transform group-hover:scale-110"
                        />
                      </div>
                    ) : (
                      <div className="h-56 flex w-full items-center justify-center bg-zinc-100 text-zinc-400">
                        <StickyNote className="h-8 w-8" />
                      </div>
                    )}
                    <div className="p-4">
                      <p className="text-xs text-gray-500">{new Date(post.createdAt).toLocaleDateString()}</p>
                      <h3 className="mt-1 text-base font-semibold text-zinc-900 cursor-pointer hover:text-primary" onClick={() => router.push(`/post/${post.post_id}`)}>{post.title}</h3>
                      <p className="mt-2 line-clamp-3 text-sm text-gray-600">{stripHtml(post.content).slice(0, 160)}</p>
                      <div className="mt-3 flex items-center justify-between">
                        <span className="text-xs font-semibold text-primary">{post.author.username}</span>
                        <span className="flex items-center gap-1 text-xs text-zinc-500">
                          <Eye className="h-4 w-4" />
                          {post.total_view_count.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </article>
                ))
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
