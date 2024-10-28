import { ThemeProvider } from "@/components/theme-provider"
import { UiThemeToggle } from './components/theme-toggle'
import Navbar from './components/navbar'

export function App() {
  return (
    <ThemeProvider defaultTheme='dark' storageKey='n2tdbg-ui-theme'>
      <Navbar />
      <div id="editor">
        <textarea name="asm" id="asm"></textarea>
        <button id="run">Run</button>
      </div>
    </ThemeProvider>
  )
}