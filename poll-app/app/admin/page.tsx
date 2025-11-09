"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function AdminPage() {
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 py-12">
      <div className="max-w-3xl mx-auto px-4">
        <div className="text-center mb-10">
          <div className="inline-block p-4 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl mb-4">
            <span className="text-6xl">✨</span>
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent mb-3">
            Create New Poll
          </h1>
          <p className="text-xl text-gray-600">
            Design your poll and engage your audience
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-2xl p-8 space-y-8 border border-gray-100">
          <div>
            <label className="flex items-center gap-2 text-lg font-semibold text-gray-800 mb-3">
              <span className="text-2xl">📝</span>
              Poll Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-lg transition-all"
              placeholder="What's your question?"
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-lg font-semibold text-gray-800 mb-3">
              <span className="text-2xl">💬</span>
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-lg transition-all resize-none"
              placeholder="Add more details about your poll..."
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-lg font-semibold text-gray-800 mb-3">
              <span className="text-2xl">📋</span>
              Poll Options
            </label>
            <div className="space-y-3">
              {options.map((option, index) => (
                <div key={index} className="flex gap-3 items-center group">
                  <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                    {index + 1}
                  </div>
                  <input
                    type="text"
                    value={option}
                    onChange={(e) => updateOption(index, e.target.value)}
                    className="flex-1 px-5 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-lg transition-all"
                    placeholder={`Option ${index + 1}`}
                  />
                  {options.length > 2 && (
                    <button
                      type="button"
                      onClick={() => removeOption(index)}
                      className="px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl font-semibold transition-all transform hover:scale-105"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={addOption}
              className="mt-4 px-6 py-3 text-purple-600 hover:bg-purple-50 rounded-xl font-semibold transition-all flex items-center gap-2 border-2 border-dashed border-purple-300 hover:border-purple-500 w-full justify-center"
            >
              <span className="text-xl">+</span>
              Add Another Option
            </button>
          </div>

          <div>
            <label className="flex items-center gap-2 text-lg font-semibold text-gray-800 mb-3">
              <span className="text-2xl">⏰</span>
              Expires In (hours)
            </label>
            <div className="relative">
              <input
                type="number"
                value={expiresIn}
                onChange={(e) => setExpiresIn(e.target.value)}
                min="1"
                required
                className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-lg transition-all"
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
                hours
              </div>
            </div>
            <div className="mt-3 flex gap-2 flex-wrap">
              {[1, 6, 12, 24, 48, 72].map((hours) => (
                <button
                  key={hours}
                  type="button"
                  onClick={() => setExpiresIn(hours.toString())}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${expiresIn === hours.toString()
                      ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                >
                  {hours}h
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full px-6 py-5 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-xl font-bold rounded-xl hover:from-purple-700 hover:to-blue-700 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center justify-center gap-3"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-white"></div>
                Creating Your Poll...
              </>
            ) : (
              <>
                <span className="text-2xl">🚀</span>
                Create Poll
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
