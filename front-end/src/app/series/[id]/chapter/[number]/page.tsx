"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, ChevronLeft, ChevronRight, Home } from "lucide-react"
import { getChapterByNumber } from "@/fetching/chapters"
import { getSeriesById } from "@/fetching/series"

interface Chapter {
  chapter_id: number
  series_id: number
  number: number
  title: string
  pages_url: string[]
  released_at: string
  series?: {
    name: string
  }
}

export default function ChapterReaderPage() {
  const params = useParams()
  const router = useRouter()
  const seriesId = params.id as string
  const chapterNumber = params.number as string

  const [chapter, setChapter] = useState<Chapter | null>(null)
  const [seriesName, setSeriesName] = useState<string>("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [chapterData, seriesData] = await Promise.all([
          getChapterByNumber(parseInt(seriesId), parseFloat(chapterNumber)),
          getSeriesById(parseInt(seriesId)),
        ])
        
        setChapter(chapterData)
        setSeriesName(seriesData?.name || "")
      } catch (error) {
        console.error("Error fetching chapter:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [seriesId, chapterNumber])

  const handlePrevChapter = () => {
    const prevNumber = parseFloat(chapterNumber) - 1
    if (prevNumber > 0) {
      router.push(`/series/${seriesId}/chapter/${prevNumber}`)
    }
  }

  const handleNextChapter = () => {
    const nextNumber = parseFloat(chapterNumber) + 1
    router.push(`/series/${seriesId}/chapter/${nextNumber}`)
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto mb-4"></div>
          <p className="text-muted-foreground">Đang tải chương...</p>
        </div>
      </main>
    )
  }

  if (!chapter) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Không tìm thấy chương</p>
          <button
            onClick={() => router.push(`/series/${seriesId}`)}
            className="px-4 py-2 rounded-md bg-accent text-accent-foreground"
          >
            Quay lại trang truyện
          </button>
        </div>
      </main>
    )
  }

  const pages = Array.isArray(chapter.pages_url) ? chapter.pages_url : []

  return (
    <main className="min-h-screen bg-black">
      {/* Fixed Header */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-sm border-b border-gray-800">
        <div className="mx-auto max-w-4xl px-4 py-3">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.push(`/series/${seriesId}`)}
              className="flex items-center gap-2 text-white hover:text-gray-300 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              <span className="text-sm">{seriesName}</span>
            </button>
            
            <h1 className="text-white text-sm font-medium">
              Chương {chapter.number}{chapter.title ? `: ${chapter.title}` : ""}
            </h1>
            
            <button
              onClick={() => router.push("/")}
              className="text-white hover:text-gray-300 transition-colors"
            >
              <Home className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Chapter Images */}
      <div className="pt-16 pb-20">
        <div className="mx-auto max-w-4xl">
          {pages.length > 0 ? (
            pages.map((pageUrl, index) => (
              <div key={index} className="w-full">
                <img
                  src={pageUrl}
                  alt={`Page ${index + 1}`}
                  className="w-full h-auto"
                  loading={index < 3 ? "eager" : "lazy"}
                />
              </div>
            ))
          ) : (
            <div className="flex items-center justify-center h-64">
              <p className="text-gray-400">Chương này chưa có nội dung</p>
            </div>
          )}
        </div>
      </div>

      {/* Fixed Footer Navigation */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-sm border-t border-gray-800">
        <div className="mx-auto max-w-4xl px-4 py-3">
          <div className="flex items-center justify-between">
            <button
              onClick={handlePrevChapter}
              className="flex items-center gap-2 px-4 py-2 rounded-md bg-gray-800 text-white hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={parseFloat(chapterNumber) <= 1}
            >
              <ChevronLeft className="h-5 w-5" />
              <span>Chương trước</span>
            </button>
            
            <button
              onClick={() => router.push(`/series/${seriesId}`)}
              className="px-4 py-2 rounded-md bg-accent text-accent-foreground hover:bg-accent/80 transition-colors"
            >
              Danh sách chương
            </button>
            
            <button
              onClick={handleNextChapter}
              className="flex items-center gap-2 px-4 py-2 rounded-md bg-gray-800 text-white hover:bg-gray-700 transition-colors"
            >
              <span>Chương sau</span>
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </main>
  )
}

