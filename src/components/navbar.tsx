import { Github } from 'lucide-react'
import { UiThemeToggle } from './theme-toggle'
import { Button } from './ui/button'

export default function Navbar() {
  return (
    <nav className="bg-primary-foreground shadow-md">
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex-shrink-0">
            <span className="font-bold text-xl">N2TDbg</span>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="icon" asChild>
              <a href='https://github.com/sn8to/N2TDbg' target='_blank'>
                <Github className="h-[1.2rem] w-[1.2rem]" />
                {/* <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" /> */}
                <span className="sr-only">View GitHub repo</span>
              </a>
            </Button>
            <UiThemeToggle />
          </div>
        </div>
      </div>
    </nav>
  )
}