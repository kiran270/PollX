"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { useSession } from "next-auth/react"

type Theme = "light" | "dark"

interface ThemeContextType {
  theme: Theme
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession()
  const [theme, setTheme] = useState<Theme>("dark")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const savedTheme = (localStorage.getItem("theme") as Theme) || "dark"
    setTheme(savedTheme)
    
    if (savedTheme === "dark") {
      document.documentElement.classList.add("dark")
      document.body.classList.add("dark-mode")
    } else {
      document.documentElement.classList.remove("dark")
      document.body.classList.remove("dark-mode")
    }
  }, [])

  const toggleTheme = async () => {
    const newTheme = theme === "light" ? "dark" : "light"
    console.log(`🎨 Toggling theme from ${theme} to ${newTheme}`)
    
    setTheme(newTheme)
    localStorage.setItem("theme", newTheme)
    
    if (newTheme === "dark") {
      document.documentElement.classList.add("dark")
      document.body.classList.add("dark-mode")
      console.log("✅ Applied dark mode classes")
    } else {
      document.documentElement.classList.remove("dark")
      document.body.classList.remove("dark-mode")
      console.log("✅ Applied light mode classes")
    }

    if (session?.user) {
      try {
        await fetch("/api/user/theme", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ theme: newTheme }),
        })
        console.log("✅ Theme saved to backend")
      } catch (error) {
        console.error("❌ Failed to save theme preference:", error)
      }
    }
  }

  if (!mounted) {
    return <>{children}</>
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
}
