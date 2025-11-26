"use client"

import Image from "next/image"
import { useTheme } from "./ThemeProvider"

export default function Logo({ className = "w-10 h-10" }: { className?: string }) {
  let theme = "dark"
  
  try {
    const themeContext = useTheme()
    theme = themeContext.theme
  } catch {
    // Theme provider not available, use dark as default
  }

  return (
    <div className={className}>
      <Image 
        src={theme === "dark" 
          ? "/WhatsApp Image 2025-11-21 at 19.35.41.jpeg"
          : "/WhatsApp Image 2025-11-21 at 19.35.47.jpeg"
        }
        alt="PollMitra" 
        width={120} 
        height={120}
        className="hover:opacity-80 transition-opacity cursor-pointer w-full h-full object-contain"
      />
    </div>
  )
}
