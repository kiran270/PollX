"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession, signIn, signOut } from "next-auth/react"
import { useState } from "react"
import { useTheme } from "./ThemeProvider"
import Logo from "./Logo"

function ThemeToggle() {
  try {
    const { theme, toggleTheme } = useTheme()
    const textClass = theme === "dark" ? "text-white" : "text-black"

    return (
      <button
        onClick={toggleTheme}
        className={`w-full flex items-center justify-between px-4 py-3 rounded-lg ${textClass} hover:text-[#E31E24] transition-all`}
      >
        <span className="flex items-center gap-3">
          {theme === "dark" ? (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
            </svg>
          )}
          <span className="font-medium">Theme</span>
        </span>
        <span className="text-xs capitalize">{theme}</span>
      </button>
    )
  } catch (error) {
    // Theme provider not available, return null
    return null
  }
}

export default function Navbar() {
  const pathname = usePathname()
  const { data: session, status } = useSession()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  
  let theme = "dark"
  try {
    const themeContext = useTheme()
    theme = themeContext.theme
  } catch {
    // Theme provider not available
  }

  const isAdmin = session?.user?.role === "admin"
  const isLoading = status === "loading"
  
  // Theme-aware classes
  const bgClass = theme === "dark" ? "bg-black" : "bg-white"
  const borderClass = theme === "dark" ? "border-white/10" : "border-black/10"
  const textClass = theme === "dark" ? "text-white" : "text-black"
  const textMutedClass = theme === "dark" ? "text-white/60" : "text-black/60"
  const hoverTextClass = "hover:text-[#E31E24]"
  const inactiveBgClass = theme === "dark" ? "bg-white/5" : "bg-black/5"

  return (
    <>
      {/* Mobile Header */}
      <div className={`lg:hidden fixed top-0 left-0 right-0 h-16 ${bgClass} border-b ${borderClass} flex items-center justify-between px-4 z-50`}>
        <Link href="/" className="flex items-center">
          <Logo className="h-10 w-20" />
        </Link>

        <div className="flex items-center gap-2">
          {!isLoading && !session && (
            <button
              onClick={() => signIn("google")}
              className="px-3 py-1.5 bg-[#E31E24] hover:bg-[#C41A1F] text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-1.5"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Sign in
            </button>
          )}

          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className={`p-2 ${textClass} hover:text-[#E31E24] transition-colors`}
          >
            {isMobileMenuOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar - Desktop & Mobile */}
      <div className={`fixed top-0 h-screen w-64 ${bgClass} border-r ${borderClass} flex flex-col z-50 transition-transform duration-300 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } lg:left-0`}>
        {/* Logo - Desktop Only */}
        <div className={`hidden lg:block p-4 border-b ${borderClass}`}>
          <Link href="/" className="flex items-center justify-center group">
            <Logo className="h-20 w-32" />
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 mt-16 lg:mt-0" onClick={() => setIsMobileMenuOpen(false)}>
          <Link
            href="/"
            className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all ${pathname === "/"
              ? "bg-[#E31E24] text-white"
              : `${textClass} ${hoverTextClass}`
              }`}
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
            </svg>
            Active Polls
          </Link>

          <Link
            href="/history"
            className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all ${pathname === "/history"
              ? "bg-[#E31E24] text-white"
              : `${textClass} ${hoverTextClass}`
              }`}
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
            </svg>
            History
          </Link>

          {session && (
            <Link
              href="/create-poll"
              className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all ${pathname === "/create-poll"
                ? "bg-[#E31E24] text-white"
                : `${textClass} ${hoverTextClass}`
                }`}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Create Poll
            </Link>
          )}

          {session && isAdmin && (
            <Link
              href="/analytics"
              className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all ${pathname === "/analytics"
                ? "bg-[#E31E24] text-white"
                : `${textClass} ${hoverTextClass}`
                }`}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
              </svg>
              Analytics
            </Link>
          )}
        </nav>

        {/* Theme Toggle */}
        <div className="px-4 pb-2">
          <ThemeToggle />
        </div>

        {/* User Info / Sign In */}
        <div className={`p-4 border-t ${borderClass}`}>
          {isLoading ? (
            <div className="flex items-center justify-center p-3">
              <div className={`animate-spin rounded-full h-6 w-6 border-2 ${theme === "dark" ? "border-white/20" : "border-black/20"} border-t-[#E31E24]`}></div>
            </div>
          ) : session ? (
            <div className="space-y-3">
              <div className={`flex items-center gap-3 p-3 ${inactiveBgClass} rounded-lg`}>
                {session.user?.image ? (
                  <img
                    src={session.user.image}
                    alt={session.user.name || "User"}
                    className="w-10 h-10 rounded-full"
                  />
                ) : (
                  <div className="w-10 h-10 bg-[#E31E24] rounded-full flex items-center justify-center text-white font-bold">
                    {session.user?.name?.charAt(0) || "U"}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-semibold ${textClass} truncate`}>
                    {session.user?.name || "User"}
                  </p>
                  <p className={`text-xs ${textMutedClass}`}>
                    {session.user?.role || "MEMBER"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => signOut()}
                className={`w-full px-4 py-2 text-sm ${textClass} ${hoverTextClass} rounded-lg transition-all flex items-center justify-center gap-2`}
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
                </svg>
                Sign Out
              </button>
            </div>
          ) : (
            <button
              onClick={() => signIn("google")}
              className="w-full px-4 py-3 bg-[#E31E24] hover:bg-[#C41A1F] text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Sign in with Google
            </button>
          )}
        </div>
      </div>
    </>
  )
}
