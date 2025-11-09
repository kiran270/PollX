"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"

export default function Page() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [options, setOptions] = useState(["", ""])
  const [expiresIn, setExpiresIn] = useState("24")
  const [loading, setLoading] = useState(false)

  const addOption = () => {
    setOptions([...options, ""])
  }

  const removeOption = (index: number) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index))
    }
  }

  const updateOption = (index: number, value: string) => {
    const newOptions = [...options]
    newOptions[index] = value
    setOptions(newOptions)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const filteredOptions = options.filter((opt) => opt.trim() !== "")
    
    if (filteredOptions.length < 2) {
      alert("Please provide at least 2 options")
      setLoading(false)
      return
    }

    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + parseInt(expiresIn))

    try {
      const response = await fetch("/api/polls", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          options: filteredOptions,
          expiresAt: expiresAt.toISOString(),
        }),
      })

      if (response.ok) {
        router.push("/")
      } else {
        const data = await response.json()
        alert(data.error)
      }
    } catch (error) {
      alert("Failed to create poll")
    } finally {
      setLoading(false)
    }
  }

  if (status === "loading") {
    return (
      <div className="lg:ml-64 min-h-screen bg-slate-950 flex items-center justify-center pt-16 lg:pt-0">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-slate-700 border-t-blue-500 mb-4"></div>
          <p className="text-slate-400">Loading...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="lg:ml-64 min-h-screen bg-slate-950 flex items-center justify-center pt-16 lg:pt-0">
        <div className="text-center max-w-md bg-slate-900 rounded-xl p-12 border border-slate-800">
          <div className="w-20 h-20 bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl">🔒</span>
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">Sign in required</h2>
          <p className="text-slate-400 mb-6">Please sign in to create polls</p>
        </div>
      </div>
    )
  }

  if (session.user?.role !== "ADMIN") {
    return (
      <div className="lg:ml-64 min-h-screen bg-slate-950 flex items-center justify-center pt-16 lg:pt-0">
        <div className="text-center max-w-md bg-slate-900 rounded-xl p-12 border border-slate-800">
          <div className="w-20 h-20 bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl">⛔</span>
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">Admin access required</h2>
          <p className="text-slate-400 mb-6">Only admins can create polls</p>
          <button
            onClick={() => router.push("/")}
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
          >
            Back to Polls
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="lg:ml-64 min-h-screen bg-slate-950 p-4 sm:p-6 lg:p-8 pt-20 lg:pt-8 grid-bg">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8 fade-in">
          <h1 className="text-4xl font-bold text-white mb-2">Create New Poll</h1>
          <p className="text-slate-400">Design your poll and start collecting votes</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-slate-900 rounded-xl p-8 border border-slate-800 space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Poll Question
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg focus:border-blue-500 focus:outline-none text-white transition-colors"
              placeholder="What would you like to ask?"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Description (Optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg focus:border-blue-500 focus:outline-none text-white transition-colors resize-none"
              placeholder="Add more context..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-3">
              Answer Options
            </label>
            <div className="space-y-3">
              {options.map((option, index) => (
                <div key={index} className="flex gap-3 items-center">
                  <div className="flex-shrink-0 w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center text-slate-400 font-medium text-sm">
                    {index + 1}
                  </div>
                  <input
                    type="text"
                    value={option}
                    onChange={(e) => updateOption(index, e.target.value)}
                    className="flex-1 px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg focus:border-blue-500 focus:outline-none text-white transition-colors"
                    placeholder={`Option ${index + 1}`}
                  />
                  {options.length > 2 && (
                    <button
                      type="button"
                      onClick={() => removeOption(index)}
                      className="flex-shrink-0 w-10 h-10 flex items-center justify-center text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={addOption}
              className="mt-3 w-full px-4 py-3 border-2 border-dashed border-slate-700 text-slate-400 font-medium rounded-lg hover:border-slate-600 hover:text-slate-300 transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Add Option
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-3">
              Poll Duration
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {[1, 6, 12, 24, 48, 72].map((hours) => (
                <button
                  key={hours}
                  type="button"
                  onClick={() => setExpiresIn(hours.toString())}
                  className={`px-4 py-2.5 rounded-lg font-medium transition-colors ${
                    expiresIn === hours.toString()
                      ? "bg-blue-600 text-white"
                      : "bg-slate-800 text-slate-400 hover:bg-slate-700"
                  }`}
                >
                  {hours}h
                </button>
              ))}
            </div>
          </div>

          <div className="pt-4 flex gap-3">
            <button
              type="button"
              onClick={() => router.push("/")}
              className="flex-1 px-6 py-3 border border-slate-700 text-slate-300 font-medium rounded-lg hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg disabled:bg-slate-800 disabled:text-slate-600 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? "Creating..." : "Create Poll"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
