import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarSeparator,
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarTrigger,
} from './components/ui/menubar';
import MonacoEditor from '@monaco-editor/react';

export default function EditorPanel() {
  return (
    <>
      <Menubar className='border-none h-6 p-0'>
        <MenubarMenu>
          <MenubarTrigger>File</MenubarTrigger>
          <MenubarContent>
            <MenubarItem>New File</MenubarItem>
            <MenubarSeparator />
            <MenubarItem disabled>Open File</MenubarItem>
            <MenubarItem disabled>Save File</MenubarItem>
          </MenubarContent>
        </MenubarMenu>
        <MenubarMenu>
          <MenubarTrigger>Options</MenubarTrigger>
          <MenubarContent>
            <MenubarSub>
              <MenubarSubTrigger>Set Editor Theme</MenubarSubTrigger>
              <MenubarSubContent>
                <MenubarRadioGroup value="vs-dark">
                  <MenubarRadioItem value="light">Light</MenubarRadioItem>
                  <MenubarRadioItem value="vs-dark">Dark</MenubarRadioItem>
                </MenubarRadioGroup>
              </MenubarSubContent>
            </MenubarSub>
            <MenubarSub>
              <MenubarSubTrigger>Set Language</MenubarSubTrigger>
              <MenubarSubContent>
                <MenubarRadioGroup value="asm">
                  <MenubarRadioItem value="hdl" disabled>HDL</MenubarRadioItem>
                  <MenubarRadioItem value="asm">ASM</MenubarRadioItem>
                </MenubarRadioGroup>
              </MenubarSubContent>
            </MenubarSub>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>
      <MonacoEditor theme='vs-dark' options={{ padding: { top: '2.5rem' } }} />
    </>
  )
}