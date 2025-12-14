"use client"

import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"

export function ThemeToggle() {
  const { setTheme } = useTheme()

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === "dark" ? "light" : "dark"))
  }

  return (
    <Button variant="outline" size="icon" className="w-16" onClick={toggleTheme}>
      <Moon className="text-black h-[1.rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:hidden absolute" fill="currentColor" />
      <Sun className="text-white rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 absolute" fill="currentColor" />
      <span className="sr-only">Tema</span>
    </Button>
  )
}