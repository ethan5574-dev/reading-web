"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, BookOpen, Calendar, User } from "lucide-react"
import { getSeriesById } from "@/fetching/series"
import { getChaptersBySeries } from "@/fetching/chapters"

interface Chapter {
  chapter_id: number
  number: number
  title: string
  released_at: string
}

interface Author {
  code: number
  label: string
}

interface SeriesDetail {
  series_id: number
  name: string
  status: string
  cover_url: string
  synopsis: string
  created_at: string
  updated_at: string
  latestChapters: Chapter[]
  totalChapters: number
  seriesAuthors?: Array<{
    author: Author
  }>
}

export default function SeriesDetailPage() {
  const params = useParams()
  const router = useRouter()
  const seriesId = params.id as string

  const [series, setSeries] = useState<SeriesDetail | null>(null)
  const [chapters, setChapters] = useState<Chapter[]>([])
  const [loading, setLoading] = useState(true)
  const [chaptersPage, setChaptersPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [seriesData, chaptersData] = await Promise.all([
          getSeriesById(parseInt(seriesId)),
          getChaptersBySeries(parseInt(seriesId), chaptersPage, 50),
        ])
        
        setSeries(seriesData)
        setChapters(chaptersData.chapters || [])
        setTotalPages(chaptersData.totalPages || 1)
      } catch (error) {
        console.error("Error fetching series:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [seriesId, chaptersPage])

  if (loading) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto mb-4"></div>
          <p className="text-muted-foreground">Đang tải...</p>
        </div>
      </main>
    )
  }

  if (!series) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Không tìm thấy truyện</p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-accent">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-accent-foreground hover:text-accent-foreground/80 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Quay lại</span>
          </button>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Series Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Cover */}
          <div className="md:col-span-1">
            <img
              src={series.cover_url || "/placeholder.svg"}
              alt={series.name}
              className="w-full rounded-lg shadow-lg"
            />
          </div>

          {/* Details */}
          <div className="md:col-span-2">
            <h1 className="text-3xl font-bold text-foreground mb-4">{series.name}</h1>
            
            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <User className="h-4 w-4" />
                <span>Tác giả: {series.seriesAuthors?.map(sa => sa.author.label).join(", ") || "Đang cập nhật"}</span>
              </div>
              
              <div className="flex items-center gap-2 text-muted-foreground">
                <BookOpen className="h-4 w-4" />
                <span>Trạng thái: {series.status === "ongoing" ? "Đang cập nhật" : "Hoàn thành"}</span>
              </div>
              
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>Tổng số chương: {series.totalChapters}</span>
              </div>
            </div>

            <div className="mb-4">
              <h2 className="text-xl font-semibold text-foreground mb-2">Nội dung</h2>
              <p className="text-muted-foreground whitespace-pre-wrap">
                {series.synopsis || "Chưa có nội dung"}
              </p>
            </div>

            {/* Latest Chapters */}
            {series.latestChapters && series.latestChapters.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold text-foreground mb-2">Chương mới nhất</h2>
                <div className="space-y-2">
                  {series.latestChapters.slice(0, 5).map((chapter) => (
                    <button
                      key={chapter.chapter_id}
                      onClick={() => router.push(`/series/${seriesId}/chapter/${chapter.number}`)}
                      className="block w-full text-left px-4 py-2 rounded-md bg-accent hover:bg-accent/80 transition-colors"
                    >
                      <span className="text-accent-foreground">
                        Chương {chapter.number}{chapter.title ? `: ${chapter.title}` : ""}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* All Chapters List */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold text-foreground mb-4">Danh sách chương</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {chapters.map((chapter) => (
              <button
                key={chapter.chapter_id}
                onClick={() => router.push(`/series/${seriesId}/chapter/${chapter.number}`)}
                className="text-left px-4 py-3 rounded-md bg-card hover:bg-accent transition-colors border border-border"
              >
                <span className="text-foreground font-medium">
                  Chương {chapter.number}
                </span>
                {chapter.title && (
                  <span className="text-muted-foreground text-sm block mt-1">
                    {chapter.title}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              <button
                onClick={() => setChaptersPage(prev => Math.max(1, prev - 1))}
                disabled={chaptersPage === 1}
                className="px-4 py-2 rounded-md bg-accent text-accent-foreground disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Trang trước
              </button>
              <span className="px-4 py-2 text-foreground">
                {chaptersPage} / {totalPages}
              </span>
              <button
                onClick={() => setChaptersPage(prev => Math.min(totalPages, prev + 1))}
                disabled={chaptersPage === totalPages}
                className="px-4 py-2 rounded-md bg-accent text-accent-foreground disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Trang sau
              </button>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}

