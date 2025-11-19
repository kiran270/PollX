"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter, useParams } from "next/navigation"

export default function EditPollPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const pollId = params.id as string

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [expiresIn, setExpiresIn] = useState("24")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [poll, setPoll] = useState<any>(null)
  const [options, setOptions] = useState<Array<{ id?: string; text: string; votes?: number; isNew?: boolean }>>([])
  const [deletedOptionIds, setDeletedOptionIds] = useState<string[]>([])

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

    // Fetch poll data
    fetch(`/api/polls/${pollId}`)
      .then((res) => {
        if (!res.ok) throw new Error("Poll not found")
        return res.json()
      })
      .then((pollData) => {
        setPoll(pollData)
        setTitle(pollData.title)
        setDescription(pollData.description || "")
        setOptions(pollData.options.map((opt: any) => ({
          id: opt.id,
          text: opt.text,
          votes: opt._count.votes,
        })))
        
        // Calculate hours until expiration
        const now = new Date()
        const expires = new Date(pollData.expiresAt)
        const hoursLeft = Math.max(1, Math.round((expires.getTime() - now.getTime()) / (1000 * 60 * 60)))
        setExpiresIn(hoursLeft.toString())
        setLoading(false)
      })
      .catch((error) => {
        console.error("Failed to load poll:", error)
        alert("Poll not found")
        setLoading(false)
        router.push("/")
      })
  }, [session, status, pollId, router])

  const addOption = () => {
    if (options.length >= 10) {
      alert("Maximum 10 options allowed")
      return
    }
    setOptions([...options, { text: "", isNew: true }])
  }

  const removeOption = (index: number) => {
    const option = options[index]
    if (option.id && !option.isNew) {
      // Mark existing option for deletion
      setDeletedOptionIds([...deletedOptionIds, option.id])
    }
    setOptions(options.filter((_, i) => i !== index))
  }

  const updateOption = (index: number, text: string) => {
    const newOptions = [...options]
    newOptions[index].text = text
    setOptions(newOptions)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate options
    const validOptions = options.filter(opt => opt.text.trim())
    if (validOptions.length < 2) {
      alert("Please provide at least 2 options")
      return
    }

    setSaving(true)

    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + parseInt(expiresIn))

    try {
      const response = await fetch(`/api/polls/${pollId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          expiresAt: expiresAt.toISOString(),
          options: validOptions.map(opt => ({
            id: opt.id,
            text: opt.text,
            isNew: opt.isNew,
          })),
          deletedOptionIds,
        }),
      })

      if (response.ok) {
        router.push("/")
      } else {
        const data = await response.json()
        alert(data.error || "Failed to update poll")
      }
    } catch (error) {
      alert("Failed to update poll")
    } finally {
      setSaving(false)
    }
  }

  if (loading || status === "loading") {
    return (
      <div className="lg:ml-64 min-h-screen bg-slate-950 flex items-center justify-center pt-16 lg:pt-0">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-slate-700 border-t-blue-500 mb-4"></div>
          <p className="text-slate-400">Loading...</p>
        </div>
      </div>
    )
  }

  if (!session || session.user?.role !== "admin") {
    return null
  }

  return (
    <div className="lg:ml-64 min-h-screen bg-slate-950 p-4 sm:p-6 lg:p-8 pt-20 lg:pt-8 grid-bg">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8 fade-in">
          <h1 className="text-4xl font-bold text-white mb-2">Edit Poll</h1>
          <p className="text-slate-400">Update poll details</p>
        </div>

        {poll && (
          <div className="bg-slate-900 rounded-xl p-4 sm:p-6 border border-slate-800 mb-6 fade-in">
            <h2 className="text-lg font-semibold text-white mb-4">Current Poll Details</h2>
            <div className="space-y-3">
              <div>
                <span className="text-sm text-slate-400">Total Votes:</span>
                <span className="ml-2 text-white font-medium">{poll._count.votes}</span>
              </div>
              <div>
                <span className="text-sm text-slate-400">Created:</span>
                <span className="ml-2 text-white font-medium">
                  {new Date(poll.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div>
                <span className="text-sm text-slate-400">Expires:</span>
                <span className="ml-2 text-white font-medium text-xs sm:text-sm break-words">
                  {new Date(poll.expiresAt).toLocaleString()}
                </span>
              </div>
              <div className="pt-3 border-t border-slate-800">
                <span className="text-sm text-slate-400 block mb-2">Options & Votes:</span>
                <div className="space-y-2">
                  {poll.options.map((option: any) => (
                    <div key={option.id} className="flex items-center justify-between gap-2 bg-slate-800/50 rounded-lg px-3 py-2">
                      <span className="text-white text-sm flex-1 break-words">{option.text}</span>
                      <span className="text-blue-400 font-medium text-sm whitespace-nowrap">{option._count.votes} votes</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-slate-900 rounded-xl p-4 sm:p-6 lg:p-8 border border-slate-800 space-y-6">
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
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-slate-300">
                Poll Options (min 2, max 10)
              </label>
              <button
                type="button"
                onClick={addOption}
                disabled={options.length >= 10}
                className="px-3 py-1.5 bg-green-600 hover:bg-green-700 disabled:bg-slate-700 disabled:text-slate-500 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Option
              </button>
            </div>
            <div className="space-y-2">
              {options.map((option, index) => (
                <div key={index} className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={option.text}
                    onChange={(e) => updateOption(index, e.target.value)}
                    required
                    className="flex-1 px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg focus:border-blue-500 focus:outline-none text-white transition-colors"
                    placeholder={`Option ${index + 1}`}
                  />
                  <div className="flex items-center gap-2">
                    {option.votes !== undefined && !option.isNew && (
                      <span className="text-xs text-slate-400 bg-slate-800 px-3 py-2 rounded-lg whitespace-nowrap">
                        {option.votes} votes
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => removeOption(index)}
                      disabled={options.length <= 2}
                      className="p-2.5 text-red-400 hover:bg-red-500/10 disabled:text-slate-600 disabled:hover:bg-transparent rounded-lg transition-colors flex-shrink-0"
                      title="Remove option"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
            {deletedOptionIds.length > 0 && (
              <p className="text-xs text-amber-400 mt-2">
                ⚠️ {deletedOptionIds.length} option(s) will be deleted (including their votes)
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-3">
              Extend Poll Duration (hours from now)
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

          <div className="pt-4 flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={() => router.push("/")}
              className="flex-1 px-6 py-3 border border-slate-700 text-slate-300 font-medium rounded-lg hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg disabled:bg-slate-800 disabled:text-slate-600 disabled:cursor-not-allowed transition-colors"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
