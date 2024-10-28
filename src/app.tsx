import { ThemeProvider, useTheme } from "@/components/theme-provider"
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"
import Navbar from './components/navbar'
import { useEffect, useState } from 'preact/hooks'
import EditorPanel from './editor-panel'
import CPUPanel from './cpu-panel'

type SelectedTab = 'asm' | 'hdl';

export function App() {
  const [ tab, setTab ] = useState<SelectedTab>('asm');

  return (
    <ThemeProvider defaultTheme='dark' storageKey='n2tdbg-ui-theme'>
      <Navbar />
      <ResizablePanelGroup direction='horizontal'>
        <ResizablePanel>
          <EditorPanel />
        </ResizablePanel>
        <ResizableHandle withHandle className='panel-resize-handle' />
        <ResizablePanel>
          {
            {
              asm: <CPUPanel />,
              hdl: <div>hdl panel</div>,
            }[tab] ?? <div>unknown panel</div>
          }
        </ResizablePanel>
      </ResizablePanelGroup>
    </ThemeProvider>
  )
}