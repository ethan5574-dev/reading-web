"use client"

import { Search, Bell } from "lucide-react"

export default function Header() {
  return (
    <header className="border-b border-border bg-card">
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex items-center gap-2 text-2xl font-bold text-accent">
            <div className="h-8 w-8 rounded-full bg-accent flex items-center justify-center">
              <span className="text-accent-foreground font-black">Q</span>
            </div>
            <span>TRUYENQQ</span>
          </div>

          {/* Search Bar */}
          <div className="hidden flex-1 md:flex md:max-w-md">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Bạn muốn tìm truyện gì?"
                className="w-full rounded-full border-2 border-accent bg-background px-4 py-2 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-0"
              />
              <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-accent" />
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-4">
            <button className="relative rounded-full p-2 text-muted-foreground transition-colors hover:text-foreground">
              <Bell className="h-5 w-5" />
              <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-accent" />
            </button>
            <button className="h-8 w-8 rounded-full bg-gradient-to-br from-accent to-accent/80" />
          </div>
        </div>

        {/* Mobile Search */}
        <div className="mt-4 md:hidden">
          <div className="relative">
            <input
              type="text"
              placeholder="Bạn muốn tìm truyện gì?"
              className="w-full rounded-full border-2 border-accent bg-background px-4 py-2 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
            />
            <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-accent" />
          </div>
        </div>
      </div>
    </header>
  )
}