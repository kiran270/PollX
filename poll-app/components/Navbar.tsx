"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession, signIn, signOut } from "next-auth/react"

export default function Navbar() {
  const pathname = usePathname()
  const { data: session, status } = useSession()
  
  const isAdmin = session?.user?.role === "ADMIN"
  const isLoading = status === "loading"

  return (
    <div className="fixed left-0 top-0 h-screen w-64 bg-slate-900 border-r border-slate-800 flex flex-col z-50">
      {/* Logo */}
      <div className="p-6 border-b border-slate-800">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
            <span className="text-2xl">📊</span>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">PollX</h1>
            <p className="text-xs text-slate-400">Voting Platform</p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        <Link
          href="/"
          className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all ${
            pathname === "/"
              ? "bg-blue-600 text-white"
              : "text-slate-400 hover:text-white hover:bg-slate-800"
          }`}
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
          </svg>
          Active Polls
        </Link>
        
        <Link
          href="/history"
          className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all ${
            pathname === "/history"
              ? "bg-blue-600 text-white"
              : "text-slate-400 hover:text-white hover:bg-slate-800"
          }`}
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
          </svg>
          History
        </Link>

        {session && isAdmin && (
          <Link
            href="/create-poll"
            className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all ${
              pathname === "/create-poll"
                ? "bg-blue-600 text-white"
                : "text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Create Poll
          </Link>
        )}
      </nav>

      {/* User Info / Sign In */}
      <div className="p-4 border-t border-slate-800">
        {isLoading ? (
          <div className="flex items-center justify-center p-3">
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-slate-600 border-t-blue-500"></div>
          </div>
        ) : session ? (
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-slate-800 rounded-lg">
              {session.user?.image ? (
                <img
                  src={session.user.image}
                  alt={session.user.name || "User"}
                  className="w-10 h-10 rounded-full"
                />
              ) : (
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center text-white font-bold">
                  {session.user?.name?.charAt(0) || "U"}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">
                  {session.user?.name || "User"}
                </p>
                <p className="text-xs text-slate-400">
                  {session.user?.role || "MEMBER"}
                </p>
              </div>
            </div>
            <button
              onClick={() => signOut()}
              className="w-full px-4 py-2 text-sm text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all flex items-center justify-center gap-2"
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
            className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Sign in with Google
          </button>
        )}
      </div>
    </div>
  )
}
