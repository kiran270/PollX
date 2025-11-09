"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"

interface User {
  id: string
  name: string | null
  email: string
  role: string
  createdAt: string
  _count: {
    polls: number
    votes: number
  }
}

interface Analytics {
  overview: {
    totalUsers: number
    totalPolls: number
    totalVotes: number
    totalOptions: number
    activePolls: number
    expiredPolls: number
    adminCount: number
    memberCount: number
  }
  mostVotedPolls: Array<{
    id: string
    title: string
    voteCount: number
    expiresAt: string
  }>
  recentActivity: Array<{
    id: string
    userName: string
    pollTitle: string
    optionText: string
    createdAt: string
  }>
  pollsPerDay: number
  votesPerDay: number
}

export default function AnalyticsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [showUsers, setShowUsers] = useState(false)

  useEffect(() => {
    if (status === "loading") return

    if (!session) {
      router.push("/")
      return
    }

    if (session.user?.role !== "admin") {
      router.push("/")
      return
    }

    Promise.all([
      fetch("/api/admin/analytics").then((res) => res.json()),
      fetch("/api/admin/users").then((res) => res.json()),
    ])
      .then(([analyticsData, usersData]) => {
        setAnalytics(analyticsData)
        setUsers(usersData)
        setLoading(false)
      })
      .catch((error) => {
        console.error("Failed to load data:", error)
        setLoading(false)
      })
  }, [session, status, router])

  const handleRoleChange = async (userId: string, newRole: string) => {
    if (!confirm(`Change user role to ${newRole}?`)) return

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      })

      if (response.ok) {
        const updatedUser = await response.json()
        
        // Update users list
        setUsers(
          users.map((u) =>
            u.id === userId ? { ...u, role: updatedUser.role } : u
          )
        )

        // Update analytics counts
        if (analytics) {
          const oldRole = users.find((u) => u.id === userId)?.role
          if (oldRole !== newRole) {
            setAnalytics({
              ...analytics,
              overview: {
                ...analytics.overview,
                adminCount:
                  newRole === "admin"
                    ? analytics.overview.adminCount + 1
                    : analytics.overview.adminCount - 1,
                memberCount:
                  newRole === "MEMBER"
                    ? analytics.overview.memberCount + 1
                    : analytics.overview.memberCount - 1,
              },
            })
          }
        }
      } else {
        const data = await response.json()
        alert(data.error || "Failed to update user")
      }
    } catch (error) {
      console.error("Role change error:", error)
      alert("Failed to update user")
    }
  }

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (
      !confirm(
        `Delete user "${userName}"? This will also delete all their polls and votes. This action cannot be undone.`
      )
    )
      return

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        // Reload the page to refresh all data
        window.location.reload()
      } else {
        const data = await response.json()
        alert(data.error || "Failed to delete user")
      }
    } catch (error) {
      console.error("Delete user error:", error)
      alert("Failed to delete user")
    }
  }

  if (loading || status === "loading") {
    return (
      <div className="lg:ml-64 min-h-screen bg-slate-950 flex items-center justify-center pt-16 lg:pt-0">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-slate-700 border-t-blue-500 mb-4"></div>
          <p className="text-slate-400">Loading analytics...</p>
        </div>
      </div>
    )
  }

  if (!session || session.user?.role !== "admin" || !analytics) {
    return null
  }

  const { overview, mostVotedPolls, recentActivity } = analytics

  return (
    <div className="lg:ml-64 min-h-screen bg-slate-950 p-4 sm:p-6 lg:p-8 pt-20 lg:pt-8 grid-bg">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 fade-in">
          <h1 className="text-4xl font-bold text-white mb-2">📊 Analytics Dashboard</h1>
          <p className="text-slate-400">Overview of platform statistics and activity</p>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="bg-slate-900 rounded-xl p-6 border border-slate-800 fade-in">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-400 text-sm font-medium">Total Users</span>
              <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
            </div>
            <div className="text-3xl font-bold text-white mb-1">{overview.totalUsers}</div>
            <div className="text-xs text-slate-500">
              {overview.adminCount} admins, {overview.memberCount} members
            </div>
          </div>

          <div className="bg-slate-900 rounded-xl p-6 border border-slate-800 fade-in" style={{ animationDelay: "0.05s" }}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-400 text-sm font-medium">Total Polls</span>
              <div className="w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
            </div>
            <div className="text-3xl font-bold text-white mb-1">{overview.totalPolls}</div>
            <div className="text-xs text-slate-500">
              {overview.activePolls} active, {overview.expiredPolls} expired
            </div>
          </div>

          <div className="bg-slate-900 rounded-xl p-6 border border-slate-800 fade-in" style={{ animationDelay: "0.1s" }}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-400 text-sm font-medium">Total Votes</span>
              <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="text-3xl font-bold text-white mb-1">{overview.totalVotes}</div>
            <div className="text-xs text-slate-500">
              Avg {overview.totalPolls > 0 ? (overview.totalVotes / overview.totalPolls).toFixed(1) : 0} per poll
            </div>
          </div>

          <div className="bg-slate-900 rounded-xl p-6 border border-slate-800 fade-in" style={{ animationDelay: "0.15s" }}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-400 text-sm font-medium">Total Options</span>
              <div className="w-10 h-10 bg-amber-500/10 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
              </div>
            </div>
            <div className="text-3xl font-bold text-white mb-1">{overview.totalOptions}</div>
            <div className="text-xs text-slate-500">
              Avg {overview.totalPolls > 0 ? (overview.totalOptions / overview.totalPolls).toFixed(1) : 0} per poll
            </div>
          </div>
        </div>

        {/* User Management Section */}
        <div className="mb-6 sm:mb-8">
          <button
            onClick={() => setShowUsers(!showUsers)}
            className="w-full bg-slate-900 rounded-xl p-6 border border-slate-800 hover:border-slate-700 transition-colors text-left"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-purple-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                    />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">
                    User Management
                  </h2>
                  <p className="text-sm text-slate-400">
                    {users.length} total users
                  </p>
                </div>
              </div>
              <svg
                className={`w-6 h-6 text-slate-400 transition-transform ${
                  showUsers ? "rotate-180" : ""
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
          </button>

          {showUsers && (
            <div className="mt-4 bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-800/50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">
                        User
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">
                        Role
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-slate-400 uppercase">
                        Polls
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-slate-400 uppercase">
                        Votes
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-slate-400 uppercase">
                        Joined
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-slate-400 uppercase">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {users.map((user) => (
                      <tr
                        key={user.id}
                        className="hover:bg-slate-800/30 transition-colors"
                      >
                        <td className="px-4 py-3">
                          <div>
                            <div className="text-sm font-medium text-white">
                              {user.name || "Unknown"}
                            </div>
                            <div className="text-xs text-slate-400">
                              {user.email}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <select
                            value={user.role}
                            onChange={(e) =>
                              handleRoleChange(user.id, e.target.value)
                            }
                            className={`px-3 py-1 rounded-lg text-xs font-medium border bg-slate-800 cursor-pointer ${
                              user.role === "admin"
                                ? "text-purple-400 border-purple-500/20"
                                : "text-blue-400 border-blue-500/20"
                            }`}
                          >
                            <option value="member" className="bg-slate-800 text-white">
                              member
                            </option>
                            <option value="admin" className="bg-slate-800 text-white">
                              admin
                            </option>
                          </select>
                        </td>
                        <td className="px-4 py-3 text-center text-sm text-slate-300">
                          {user._count.polls}
                        </td>
                        <td className="px-4 py-3 text-center text-sm text-slate-300">
                          {user._count.votes}
                        </td>
                        <td className="px-4 py-3 text-center text-xs text-slate-400">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() =>
                              handleDeleteUser(user.id, user.name || user.email)
                            }
                            className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                            title="Delete user"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Most Voted Polls */}
          <div className="bg-slate-900 rounded-xl p-6 border border-slate-800 fade-in" style={{ animationDelay: "0.2s" }}>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <span>🔥</span>
              Most Voted Polls
            </h2>
            <div className="space-y-3">
              {mostVotedPolls.length > 0 ? (
                mostVotedPolls.map((poll, index) => (
                  <div key={poll.id} className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-lg hover:bg-slate-800 transition-colors">
                    <div className="w-8 h-8 bg-blue-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-blue-400 font-bold text-sm">#{index + 1}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium truncate">{poll.title}</p>
                      <p className="text-xs text-slate-500">
                        {new Date(poll.expiresAt) > new Date() ? "Active" : "Expired"}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-blue-400">{poll.voteCount}</div>
                      <div className="text-xs text-slate-500">votes</div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-slate-500 text-sm text-center py-4">No polls yet</p>
              )}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-slate-900 rounded-xl p-6 border border-slate-800 fade-in" style={{ animationDelay: "0.25s" }}>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <span>⚡</span>
              Recent Activity
            </h2>
            <div className="space-y-3 max-h-[400px] overflow-y-auto">
              {recentActivity.length > 0 ? (
                recentActivity.map((activity) => (
                  <div key={activity.id} className="p-3 bg-slate-800/50 rounded-lg">
                    <div className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-1.5 flex-shrink-0"></div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white">
                          <span className="font-medium">{activity.userName}</span>
                          <span className="text-slate-400"> voted on </span>
                          <span className="font-medium">{activity.pollTitle}</span>
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                          Selected: {activity.optionText}
                        </p>
                        <p className="text-xs text-slate-600 mt-1">
                          {new Date(activity.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-slate-500 text-sm text-center py-4">No recent activity</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
