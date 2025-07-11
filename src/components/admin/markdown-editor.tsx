'use client';

import { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { Eye, Edit3, Upload, Bold, Italic, Link, Code, List, ListOrdered } from 'lucide-react';

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  height?: string;
}

export function MarkdownEditor({ 
  value, 
  onChange, 
  placeholder = "Write your post content here...",
  height = "h-96"
}: MarkdownEditorProps) {
  const [activeTab, setActiveTab] = useState('write');

  const insertText = (before: string, after: string = '') => {
    const textarea = document.querySelector('textarea[data-markdown-editor]') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    const beforeText = value.substring(0, start);
    const afterText = value.substring(end);
    
    const newText = `${beforeText}${before}${selectedText}${after}${afterText}`;
    onChange(newText);
    
    // Reset cursor position
    setTimeout(() => {
      textarea.focus();
      const newPosition = start + before.length + selectedText.length;
      textarea.setSelectionRange(newPosition, newPosition);
    }, 0);
  };

  const toolbarButtons = [
    { icon: Bold, action: () => insertText('**', '**'), tooltip: 'Bold' },
    { icon: Italic, action: () => insertText('*', '*'), tooltip: 'Italic' },
    { icon: Link, action: () => insertText('[', '](url)'), tooltip: 'Link' },
    { icon: Code, action: () => insertText('`', '`'), tooltip: 'Inline Code' },
    { icon: List, action: () => insertText('\n- ', ''), tooltip: 'Bullet List' },
    { icon: ListOrdered, action: () => insertText('\n1. ', ''), tooltip: 'Numbered List' },
  ];

  return (
    <div className="border rounded-lg">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex items-center justify-between border-b px-3 py-2">
          <TabsList className="grid w-fit grid-cols-2">
            <TabsTrigger value="write" className="flex items-center gap-2">
              <Edit3 className="h-4 w-4" />
              Write
            </TabsTrigger>
            <TabsTrigger value="preview" className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Preview
            </TabsTrigger>
          </TabsList>
          
          {activeTab === 'write' && (
            <div className="flex items-center gap-1">
              {toolbarButtons.map(({ icon: Icon, action, tooltip }, index) => (
                <Button
                  key={index}
                  variant="ghost"
                  size="sm"
                  onClick={action}
                  title={tooltip}
                  type="button"
                >
                  <Icon className="h-4 w-4" />
                </Button>
              ))}
            </div>
          )}
        </div>

        <TabsContent value="write" className="mt-0">
          <Textarea
            data-markdown-editor
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className={`${height} resize-none rounded-none border-0 focus-visible:ring-0`}
          />
        </TabsContent>

        <TabsContent value="preview" className="mt-0">
          <div className={`${height} overflow-auto p-4`}>
            {value ? (
              <div className="prose prose-sm max-w-none dark:prose-invert">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeHighlight]}
                  components={{
                    code({ className, children, ...props }) {
                      const match = /language-(\w+)/.exec(className || '');
                      return (
                        <code className={match ? className : "bg-muted px-1 py-0.5 rounded text-sm"} {...props}>
                          {children}
                        </code>
                      );
                    },
                  }}
                >
                  {value}
                </ReactMarkdown>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                Nothing to preview
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}