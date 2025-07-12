"use client";

import {
  useEditor,
  EditorContent,
  BubbleMenu,
  FloatingMenu,
} from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import TextStyle from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import Highlight from "@tiptap/extension-highlight";
import TextAlign from "@tiptap/extension-text-align";
import Table from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import Dropcursor from "@tiptap/extension-dropcursor";
import Gapcursor from "@tiptap/extension-gapcursor";
import Placeholder from "@tiptap/extension-placeholder";
import CharacterCount from "@tiptap/extension-character-count";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Toggle } from "@/components/ui/toggle";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Code,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
  Link as LinkIcon,
  Image as ImageIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Palette,
  Highlighter,
  Table as TableIcon,
  Plus,
  Minus,
  RotateCcw,
  Eye,
  EyeOff,
} from "lucide-react";
import { useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface RichTextEditorEnhancedProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  showWordCount?: boolean;
  maxLength?: number;
}

export function RichTextEditorEnhanced({
  value,
  onChange,
  placeholder = "Start writing your post...",
  className = "",
  showWordCount = true,
  maxLength,
}: RichTextEditorEnhancedProps) {
  const [linkUrl, setLinkUrl] = useState("");
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showToolbar, setShowToolbar] = useState(true);
  const { toast } = useToast();
  const supabase = createClient();

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Placeholder.configure({
        placeholder: placeholder,
        showOnlyWhenEditable: true,
        showOnlyCurrent: false,
      }),
      Image.configure({
        HTMLAttributes: {
          class:
            "max-w-full h-auto rounded-lg cursor-pointer transition-all hover:shadow-md",
        },
        allowBase64: true,
        inline: false,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-blue-500 underline cursor-pointer hover:text-blue-600",
        },
      }),
      TextStyle,
      Color.configure({
        types: ["textStyle"],
      }),
      Highlight.configure({
        multicolor: true,
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Table.configure({
        resizable: true,
        HTMLAttributes: {
          class: "table-auto w-full border-collapse",
        },
      }),
      TableRow,
      TableHeader.configure({
        HTMLAttributes: {
          class: "bg-gray-50 font-semibold",
        },
      }),
      TableCell.configure({
        HTMLAttributes: {
          class: "border border-gray-300 px-3 py-2",
        },
      }),
      Dropcursor.configure({
        color: "#3b82f6",
        width: 3,
      }),
      Gapcursor,
      CharacterCount.configure({
        limit: maxLength,
      }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class:
          "prose prose-sm sm:prose lg:prose-lg xl:prose-xl mx-auto focus:outline-none min-h-[500px] p-6 max-w-none",
      },
      handleDrop: (view, event, slice, moved) => {
        if (
          !moved &&
          event.dataTransfer &&
          event.dataTransfer.files &&
          event.dataTransfer.files[0]
        ) {
          const file = event.dataTransfer.files[0];
          if (file.type.startsWith("image/")) {
            handleImageUpload(file);
            return true;
          }
        }
        return false;
      },
      handlePaste: (view, event, slice) => {
        const items = Array.from(event.clipboardData?.items || []);
        const imageItem = items.find((item) => item.type.startsWith("image/"));

        if (imageItem) {
          const file = imageItem.getAsFile();
          if (file) {
            handleImageUpload(file);
            return true;
          }
        }
        return false;
      },
    },
  });

  const handleImageUpload = useCallback(
    async (file: File) => {
      if (!editor || uploading) return;

      // Validate file type
      const validTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
      if (!validTypes.includes(file.type)) {
        toast({
          variant: "destructive",
          description:
            "Please select a valid image file (JPEG, PNG, WebP, or GIF).",
        });
        return;
      }

      // Validate file size (max 10MB)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        toast({
          variant: "destructive",
          description: "File size must be less than 10MB.",
        });
        return;
      }

      setUploading(true);

      try {
        // Generate unique filename
        const fileExt = file.name.split(".").pop();
        const fileName = `${Date.now()}-${Math.random()
          .toString(36)
          .substring(2)}.${fileExt}`;
        const filePath = `editor-images/${fileName}`;

        // Upload to Supabase Storage
        const { data, error } = await supabase.storage
          .from("blog-images")
          .upload(filePath, file, {
            cacheControl: "3600",
            upsert: false,
          });

        if (error) {
          throw error;
        }

        // Get public URL
        const {
          data: { publicUrl },
        } = supabase.storage.from("blog-images").getPublicUrl(filePath);

        // Insert image into editor at current position
        editor
          .chain()
          .focus()
          .setImage({ src: publicUrl, alt: file.name.split(".")[0] })
          .run();

        toast({
          description: "Image uploaded successfully!",
        });
      } catch (error: any) {
        console.error("Upload error:", error);
        toast({
          variant: "destructive",
          description: "Failed to upload image. Please try again.",
        });
      } finally {
        setUploading(false);
      }
    },
    [editor, uploading, supabase, toast]
  );

  const addImageFromUrl = () => {
    const url = prompt("Enter image URL:");
    if (url && editor) {
      const alt = prompt("Enter image description (optional):") || "";
      editor.chain().focus().setImage({ src: url, alt }).run();
    }
  };

  const addImageFromFile = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        handleImageUpload(file);
      }
    };
    input.click();
  };

  const addLink = () => {
    const url = editor?.getAttributes("link").href || "";
    const newUrl = prompt("Enter URL:", url);

    if (newUrl === null) {
      return;
    }

    if (newUrl === "") {
      editor?.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }

    editor
      ?.chain()
      .focus()
      .extendMarkRange("link")
      .setLink({ href: newUrl })
      .run();
  };

  const addTable = () => {
    if (editor) {
      editor
        .chain()
        .focus()
        .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
        .run();
    }
  };

  const getWordCount = () => {
    if (!editor) return 0;
    return editor.storage.characterCount?.words() || 0;
  };

  const getCharacterCount = () => {
    if (!editor) return 0;
    return editor.storage.characterCount?.characters() || 0;
  };

  if (!editor) {
    return (
      <div className="border rounded-lg p-6 min-h-[500px] flex items-center justify-center">
        <div className="text-muted-foreground">Loading editor...</div>
      </div>
    );
  }

  return (
    <div className={`border rounded-lg ${className}`}>
      {/* Toolbar Toggle */}
      <div className="border-b p-2 flex justify-between items-center bg-muted/50">
        <div className="text-sm text-muted-foreground">Rich Text Editor</div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowToolbar(!showToolbar)}
        >
          {showToolbar ? (
            <EyeOff className="h-4 w-4" />
          ) : (
            <Eye className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Main Toolbar */}
      {showToolbar && (
        <div className="border-b p-3">
          <div className="flex flex-wrap items-center gap-2">
            {/* Undo/Redo */}
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().undo().run()}
                disabled={!editor.can().undo()}
                title="Undo"
              >
                <Undo className="h-4 w-4" />
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().redo().run()}
                disabled={!editor.can().redo()}
                title="Redo"
              >
                <Redo className="h-4 w-4" />
              </Button>
            </div>

            <Separator orientation="vertical" className="h-6" />

            {/* Text formatting */}
            <div className="flex items-center gap-1">
              <Toggle
                size="sm"
                pressed={editor.isActive("bold")}
                onPressedChange={() =>
                  editor.chain().focus().toggleBold().run()
                }
                title="Bold"
              >
                <Bold className="h-4 w-4" />
              </Toggle>

              <Toggle
                size="sm"
                pressed={editor.isActive("italic")}
                onPressedChange={() =>
                  editor.chain().focus().toggleItalic().run()
                }
                title="Italic"
              >
                <Italic className="h-4 w-4" />
              </Toggle>

              <Toggle
                size="sm"
                pressed={editor.isActive("strike")}
                onPressedChange={() =>
                  editor.chain().focus().toggleStrike().run()
                }
                title="Strikethrough"
              >
                <Strikethrough className="h-4 w-4" />
              </Toggle>

              <Toggle
                size="sm"
                pressed={editor.isActive("code")}
                onPressedChange={() =>
                  editor.chain().focus().toggleCode().run()
                }
                title="Inline Code"
              >
                <Code className="h-4 w-4" />
              </Toggle>
            </div>

            <Separator orientation="vertical" className="h-6" />

            {/* Headings */}
            <div className="flex items-center gap-1">
              <Toggle
                size="sm"
                pressed={editor.isActive("heading", { level: 1 })}
                onPressedChange={() =>
                  editor.chain().focus().toggleHeading({ level: 1 }).run()
                }
                title="Heading 1"
              >
                <Heading1 className="h-4 w-4" />
              </Toggle>

              <Toggle
                size="sm"
                pressed={editor.isActive("heading", { level: 2 })}
                onPressedChange={() =>
                  editor.chain().focus().toggleHeading({ level: 2 }).run()
                }
                title="Heading 2"
              >
                <Heading2 className="h-4 w-4" />
              </Toggle>

              <Toggle
                size="sm"
                pressed={editor.isActive("heading", { level: 3 })}
                onPressedChange={() =>
                  editor.chain().focus().toggleHeading({ level: 3 }).run()
                }
                title="Heading 3"
              >
                <Heading3 className="h-4 w-4" />
              </Toggle>
            </div>

            <Separator orientation="vertical" className="h-6" />

            {/* Lists */}
            <div className="flex items-center gap-1">
              <Toggle
                size="sm"
                pressed={editor.isActive("bulletList")}
                onPressedChange={() =>
                  editor.chain().focus().toggleBulletList().run()
                }
                title="Bullet List"
              >
                <List className="h-4 w-4" />
              </Toggle>

              <Toggle
                size="sm"
                pressed={editor.isActive("orderedList")}
                onPressedChange={() =>
                  editor.chain().focus().toggleOrderedList().run()
                }
                title="Numbered List"
              >
                <ListOrdered className="h-4 w-4" />
              </Toggle>

              <Toggle
                size="sm"
                pressed={editor.isActive("blockquote")}
                onPressedChange={() =>
                  editor.chain().focus().toggleBlockquote().run()
                }
                title="Quote"
              >
                <Quote className="h-4 w-4" />
              </Toggle>
            </div>

            <Separator orientation="vertical" className="h-6" />

            {/* Alignment */}
            <div className="flex items-center gap-1">
              <Toggle
                size="sm"
                pressed={editor.isActive({ textAlign: "left" })}
                onPressedChange={() =>
                  editor.chain().focus().setTextAlign("left").run()
                }
                title="Align Left"
              >
                <AlignLeft className="h-4 w-4" />
              </Toggle>

              <Toggle
                size="sm"
                pressed={editor.isActive({ textAlign: "center" })}
                onPressedChange={() =>
                  editor.chain().focus().setTextAlign("center").run()
                }
                title="Align Center"
              >
                <AlignCenter className="h-4 w-4" />
              </Toggle>

              <Toggle
                size="sm"
                pressed={editor.isActive({ textAlign: "right" })}
                onPressedChange={() =>
                  editor.chain().focus().setTextAlign("right").run()
                }
                title="Align Right"
              >
                <AlignRight className="h-4 w-4" />
              </Toggle>
            </div>

            <Separator orientation="vertical" className="h-6" />

            {/* Media and Links */}
            <div className="flex items-center gap-1">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="sm" title="Insert Image">
                    <ImageIcon className="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-48">
                  <div className="space-y-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start"
                      onClick={addImageFromFile}
                      disabled={uploading}
                    >
                      {uploading ? "Uploading..." : "Upload Image"}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start"
                      onClick={addImageFromUrl}
                    >
                      Image from URL
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>

              <Button
                variant="ghost"
                size="sm"
                onClick={addLink}
                title="Add Link"
              >
                <LinkIcon className="h-4 w-4" />
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={addTable}
                title="Insert Table"
              >
                <TableIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Bubble Menu for Selection */}
      {editor && (
        <BubbleMenu
          editor={editor}
          tippyOptions={{ duration: 100 }}
          className="flex items-center gap-1 p-2 bg-background border rounded-lg shadow-md"
        >
          <Toggle
            size="sm"
            pressed={editor.isActive("bold")}
            onPressedChange={() => editor.chain().focus().toggleBold().run()}
          >
            <Bold className="h-4 w-4" />
          </Toggle>
          <Toggle
            size="sm"
            pressed={editor.isActive("italic")}
            onPressedChange={() => editor.chain().focus().toggleItalic().run()}
          >
            <Italic className="h-4 w-4" />
          </Toggle>
          <Button variant="ghost" size="sm" onClick={addLink}>
            <LinkIcon className="h-4 w-4" />
          </Button>
        </BubbleMenu>
      )}

      {/* Floating Menu for Empty Lines */}
      {editor && (
        <FloatingMenu
          editor={editor}
          tippyOptions={{ duration: 100 }}
          className="flex items-center gap-1 p-2 bg-background border rounded-lg shadow-md"
        >
          <Button
            variant="ghost"
            size="sm"
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 1 }).run()
            }
          >
            <Heading1 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={addImageFromFile}
            disabled={uploading}
          >
            <ImageIcon className="h-4 w-4" />
          </Button>
        </FloatingMenu>
      )}

      {/* Editor Content */}
      <div className="relative">
        <EditorContent
          editor={editor}
          className="min-h-[500px] focus-within:outline-none"
        />

        {uploading && (
          <div className="absolute inset-0 bg-background/50 flex items-center justify-center">
            <div className="text-sm text-muted-foreground">
              Uploading image...
            </div>
          </div>
        )}
      </div>

      {/* Footer with Stats */}
      <div className="border-t p-3 flex justify-between items-center text-xs text-muted-foreground bg-muted/25">
        <div className="flex items-center gap-4">
          <span>
            💡 Drag & drop images, paste from clipboard, or use the toolbar
          </span>
        </div>

        {showWordCount && (
          <div className="flex items-center gap-4">
            <span>{getWordCount()} words</span>
            <span>{getCharacterCount()} characters</span>
            {maxLength && (
              <span
                className={
                  getCharacterCount() > maxLength ? "text-destructive" : ""
                }
              >
                {maxLength - getCharacterCount()} remaining
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
