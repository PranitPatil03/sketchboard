'use client'

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Square,
  Circle,
  Diamond,
  Minus,
  Pencil,
  ArrowRight,
  Type,
  Eraser,
  MousePointer2,
  Hand,
  Trash2,
  Download,
  Upload,
  Sun,
} from "lucide-react";

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectTool?: (tool: string) => void;
  onClearCanvas?: () => void;
  onExportCanvas?: () => void;
  onImportCanvas?: () => void;
  onToggleTheme?: () => void;
}

export function CommandPalette({
  open,
  onOpenChange,
  onSelectTool,
  onClearCanvas,
  onExportCanvas,
  onImportCanvas,
  onToggleTheme,
}: CommandPaletteProps) {
  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Tools">
          <CommandItem onSelect={() => { onSelectTool?.("selection"); onOpenChange(false); }}>
            <MousePointer2 className="mr-2 h-4 w-4" />
            <span>Selection</span>
            <kbd className="ml-auto text-xs text-muted-foreground">1</kbd>
          </CommandItem>
          <CommandItem onSelect={() => { onSelectTool?.("grab"); onOpenChange(false); }}>
            <Hand className="mr-2 h-4 w-4" />
            <span>Grab / Pan</span>
            <kbd className="ml-auto text-xs text-muted-foreground">2</kbd>
          </CommandItem>
          <CommandItem onSelect={() => { onSelectTool?.("rectangle"); onOpenChange(false); }}>
            <Square className="mr-2 h-4 w-4" />
            <span>Rectangle</span>
            <kbd className="ml-auto text-xs text-muted-foreground">3</kbd>
          </CommandItem>
          <CommandItem onSelect={() => { onSelectTool?.("ellipse"); onOpenChange(false); }}>
            <Circle className="mr-2 h-4 w-4" />
            <span>Ellipse</span>
            <kbd className="ml-auto text-xs text-muted-foreground">4</kbd>
          </CommandItem>
          <CommandItem onSelect={() => { onSelectTool?.("diamond"); onOpenChange(false); }}>
            <Diamond className="mr-2 h-4 w-4" />
            <span>Diamond</span>
            <kbd className="ml-auto text-xs text-muted-foreground">5</kbd>
          </CommandItem>
          <CommandItem onSelect={() => { onSelectTool?.("line"); onOpenChange(false); }}>
            <Minus className="mr-2 h-4 w-4" />
            <span>Line</span>
            <kbd className="ml-auto text-xs text-muted-foreground">6</kbd>
          </CommandItem>
          <CommandItem onSelect={() => { onSelectTool?.("free-draw"); onOpenChange(false); }}>
            <Pencil className="mr-2 h-4 w-4" />
            <span>Free Draw</span>
            <kbd className="ml-auto text-xs text-muted-foreground">7</kbd>
          </CommandItem>
          <CommandItem onSelect={() => { onSelectTool?.("arrow"); onOpenChange(false); }}>
            <ArrowRight className="mr-2 h-4 w-4" />
            <span>Arrow</span>
            <kbd className="ml-auto text-xs text-muted-foreground">8</kbd>
          </CommandItem>
          <CommandItem onSelect={() => { onSelectTool?.("text"); onOpenChange(false); }}>
            <Type className="mr-2 h-4 w-4" />
            <span>Text</span>
            <kbd className="ml-auto text-xs text-muted-foreground">9</kbd>
          </CommandItem>
          <CommandItem onSelect={() => { onSelectTool?.("eraser"); onOpenChange(false); }}>
            <Eraser className="mr-2 h-4 w-4" />
            <span>Eraser</span>
            <kbd className="ml-auto text-xs text-muted-foreground">0</kbd>
          </CommandItem>
        </CommandGroup>
        <CommandGroup heading="Actions">
          {onClearCanvas && (
            <CommandItem onSelect={() => { onClearCanvas(); onOpenChange(false); }}>
              <Trash2 className="mr-2 h-4 w-4" />
              <span>Clear canvas</span>
            </CommandItem>
          )}
          {onExportCanvas && (
            <CommandItem onSelect={() => { onExportCanvas(); onOpenChange(false); }}>
              <Download className="mr-2 h-4 w-4" />
              <span>Export drawing</span>
            </CommandItem>
          )}
          {onImportCanvas && (
            <CommandItem onSelect={() => { onImportCanvas(); onOpenChange(false); }}>
              <Upload className="mr-2 h-4 w-4" />
              <span>Import drawing</span>
            </CommandItem>
          )}
          {onToggleTheme && (
            <CommandItem onSelect={() => { onToggleTheme(); onOpenChange(false); }}>
              <Sun className="mr-2 h-4 w-4" />
              <span>Toggle theme</span>
            </CommandItem>
          )}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
