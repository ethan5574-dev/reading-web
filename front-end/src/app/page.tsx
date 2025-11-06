"use client"

import { Search, Star, Flame, Cloud } from "lucide-react"
import StoryCard from "@/components/StoryCard"
const navItems = [
  { label: "Trang Chủ", href: "#" },
  { label: "Thể Loại", href: "#" },
  { label: "Xếp Hạng", href: "#" },
  { label: "Con Gái", href: "#" },
  { label: "Con Trai", href: "#" },
  { label: "Tìm Truyện", href: "#" },
  { label: "Lịch Sử", href: "#" },
  { label: "Theo Dõi", href: "#" },
  { label: "Thảo Luận", href: "#" },
]

export default function Home() {
  const hotStories = [
    {
      id: 1,
      title: "Câu Bé Của Thần Chết",
      episodes: "1 Giới Truyện",
      chapter: "Chương 303",
      image: "/image.png",
      isHot: true,
    },
    {
      id: 2,
      title: "Gây Gổ Cấp 99+",
      episodes: "7 Giới Truyện",
      chapter: "Chương 1675",
      image: "/image.png",
      isHot: true,
    },
    {
      id: 3,
      title: "Vô Luyện Định Phong",
      episodes: "9 Giới Truyện",
      chapter: "Chương 3853",
      image: "/image.png",
      isHot: true,
    },
    {
      id: 4,
      title: "Tuyệt Thế Đường Môn",
      episodes: "1 Ngoài Truyện",
      chapter: "Chương 574",
      image: "/image.png",
      isHot: true,
    },
    {
      id: 5,
      title: "One Piece",
      episodes: "1 Ngoài Truyện",
      chapter: "Chương 1164",
      image: "/image.png",
      isHot: true,
    },
    {
      id: 6,
      title: "Hoàn Quan Hồi Quy 1",
      episodes: "1 Ngoài Truyện",
      chapter: "Chương 61",
      image: "/image.png",
      isHot: true,
    },
  ]

  const exclusiveStories = [
    {
      id: 7,
      title: "Trong Sinh Độ Thị Tu Tiên",
      episodes: "16 Phát Trước",
      chapter: "Chương 1115",
      image: "/image.png",
      isNew: false,
    },
    {
      id: 8,
      title: "Ta Muốn Phong Thiên",
      episodes: "1 Giới Truyện",
      chapter: "Chương 11",
      image: "/image.png",
      isNew: false,
    },
    {
      id: 9,
      title: "Chàng Rể Mạnh Nhất",
      episodes: "3 Giới Truyện",
      chapter: "Chương 347",
      image: "/image.png",
      isNew: false,
    },
    {
      id: 10,
      title: "Anh Sáng Arad",
      episodes: "5 Giới Truyện",
      chapter: "Chương 51",
      image: "/image.png",
      isNew: false,
    },
    {
      id: 11,
      title: "Một Con Dao Mộ Lộn",
      episodes: "6 Giới Truyện",
      chapter: "Chương 17",
      image: "/image.png",
      isNew: false,
    },
    {
      id: 12,
      title: "Mạnh Nhất Lịch Sử",
      episodes: "7 Giới Truyện",
      chapter: "Chương 241",
      image: "/image.png",
      isNew: false,
    },
  ]

  const newStories = [
    {
      id: 13,
      title: "Bộ Tối Lạo Độc Vụ",
      episodes: "6 Phát Trước",
      chapter: "Chapter 216",
      image: "/image.png",
      isNew: true,
    },
    {
      id: 14,
      title: "Thiên Tài Vô Thuật Hội",
      episodes: "26 Phát Trước",
      chapter: "Chapter 115",
      image: "/image.png",
      isNew: true,
    },
    {
      id: 15,
      title: "Vợ Tôi Có Thể Nhân Thế",
      episodes: "36 Phát Trước",
      chapter: "Chapter 107",
      image: "/image.png",
      isNew: true,
    },
    {
      id: 16,
      title: "Trả Thành Cương Nhân",
      episodes: "42 Phát Trước",
      chapter: "Chapter 8",
      image: "/image.png",
      isNew: true,
    },
    {
      id: 17,
      title: "Mạhouka Koukou No Re",
      episodes: "42 Phát Trước",
      chapter: "Chapter 20",
      image: "/image.png",
      isNew: true,
    },
    {
      id: 18,
      title: "Trở Thành Thiên Tài Tiên",
      episodes: "1 Giới Truyện",
      chapter: "Chapter 33",
      image: "/image.png",
      isNew: true,
    },
  ]

  return (
    <main className="min-h-screen bg-background">
      <nav className="border-b border-border bg-accent">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex overflow-x-auto">
          {navItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="whitespace-nowrap px-4 py-3 text-sm font-medium text-accent-foreground transition-colors hover:bg-accent/90"
            >
              {item.label}
            </a>
          ))}
        </div>
      </div>
    </nav>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Popular Stories Section */}
        <section className="mb-12">
          <div className="mb-6 flex items-center gap-2">
            <Star className="h-5 w-5 fill-accent text-accent" />
            <h2 className="text-xl font-bold text-foreground">Truyện Hay</h2>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {hotStories.map((story) => (
              <StoryCard key={story.id} {...story} />
            ))}
          </div>
        </section>

        {/* Exclusive Stories Section */}
        <section className="mb-12">
          <div className="mb-6 flex items-center gap-2">
            <Flame className="h-5 w-5 text-accent" />
            <h2 className="text-xl font-bold text-foreground">Độc Quyền Truyện QQ</h2>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {exclusiveStories.map((story) => (
              <StoryCard key={story.id} {...story} />
            ))}
          </div>
        </section>

        {/* New Updated Stories Section */}
        <section>
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Cloud className="h-5 w-5 text-accent" />
              <h2 className="text-xl font-bold text-foreground">Truyện Mới Cập Nhật</h2>
            </div>
            <button className="flex items-center justify-center rounded-full border-2 border-accent p-2 text-accent transition-colors hover:bg-accent hover:text-accent-foreground">
              <Search className="h-5 w-5" />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {newStories.map((story) => (
              <StoryCard key={story.id} {...story} />
            ))}
          </div>
        </section>
      </div>
    </main>
  )
}
