"use client"

import { useEffect, useState } from "react"
import { Search, Star, Flame, Cloud } from "lucide-react"
import StoryCard from "@/components/StoryCard"
import { getAllSeries } from "@/fetching/series"

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

interface Series {
  series_id: number
  name: string
  status: string
  cover_url: string
  synopsis: string
  created_at: string
  updated_at: string
  latestChapters: string[]
  totalChapters: number
}

export default function Home() {
  const [series, setSeries] = useState<Series[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSeries = async () => {
      try {
        const response = await getAllSeries(1, 18) // Fetch 18 series for 3 sections
        console.log(response)
        setSeries(response?.data?.series || [])
      } catch (error) {
        console.error("Error fetching series:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchSeries()
  }, [])

  // Map series data to story card format
  const mapSeriesToStory = (s: Series) => {
    

    return {
      id: s.series_id,
      title: s.name,
      episodes: `${s.totalChapters || 0} Chương`,
      chapter: s.latestChapters,
      image: s.cover_url || "/placeholder.svg",
    }
  }

  // Split series into 3 sections (6 items each)
  const hotStories = series.slice(0, 6).map(s => ({ ...mapSeriesToStory(s), isHot: true }))
  const exclusiveStories = series.slice(6, 12).map(s => ({ ...mapSeriesToStory(s), isNew: false }))
  const newStories = series.slice(12, 18).map(s => ({ ...mapSeriesToStory(s), isNew: true }))

  if (loading) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto mb-4"></div>
          <p className="text-muted-foreground">Đang tải truyện...</p>
        </div>
      </main>
    )
  }

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
            {hotStories.length > 0 ? (
              hotStories.map((story) => (
                <StoryCard key={story.id} {...story} />
              ))
            ) : (
              <p className="col-span-full text-center text-muted-foreground">Chưa có truyện</p>
            )}
          </div>
        </section>

        {/* Exclusive Stories Section */}
        <section className="mb-12">
          <div className="mb-6 flex items-center gap-2">
            <Flame className="h-5 w-5 text-accent" />
            <h2 className="text-xl font-bold text-foreground">Độc Quyền Truyện QQ</h2>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {exclusiveStories.length > 0 ? (
              exclusiveStories.map((story) => (
                <StoryCard key={story.id} {...story} />
              ))
            ) : (
              <p className="col-span-full text-center text-muted-foreground">Chưa có truyện</p>
            )}
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
            {newStories.length > 0 ? (
              newStories.map((story) => (
                <StoryCard key={story.id} {...story} />
              ))
            ) : (
              <p className="col-span-full text-center text-muted-foreground">Chưa có truyện</p>
            )}
          </div>
        </section>
      </div>
    </main>
  )
}
