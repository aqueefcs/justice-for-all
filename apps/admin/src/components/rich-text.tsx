import { useEffect } from 'react';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { Bold, Heading2, Heading3, Italic, Link2, List, ListOrdered, Quote, Undo2, Redo2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface RichTextProps {
  id: string;
  value: string;
  onChange: (html: string) => void;
  disabled?: boolean;
  placeholder?: string;
  /** Extra toolbar buttons that insert text at the cursor, e.g. `{{fullName}}` for letters. */
  insertables?: { label: string; text: string }[];
  insertLabel?: string;
  invalid?: boolean;
}

/**
 * TipTap editor for article bodies and letter text. The server sanitises the HTML again,
 * so only structure (headings, lists, emphasis, https links) survives.
 */
export function RichText({ id, value, onChange, disabled, placeholder, insertables, insertLabel, invalid }: RichTextProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3] }, link: { openOnClick: false, protocols: ['https', 'mailto', 'tel'] } }),
      Placeholder.configure({ placeholder: placeholder ?? '' }),
    ],
    content: value,
    editable: !disabled,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        id,
        class: 'prose-sm min-h-48 max-w-none px-3 py-2 focus:outline-none [&_h2]:text-xl [&_h2]:font-semibold [&_h3]:text-lg [&_h3]:font-semibold [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_a]:text-primary [&_a]:underline [&_blockquote]:border-l-4 [&_blockquote]:pl-3',
        'aria-multiline': 'true',
        role: 'textbox',
      },
    },
    onUpdate: ({ editor: e }) => onChange(e.getHTML()),
  });

  // Keep in sync when the form loads a document or resets.
  useEffect(() => {
    if (editor && value !== editor.getHTML()) editor.commands.setContent(value || '', { emitUpdate: false });
  }, [editor, value]);
  useEffect(() => {
    editor?.setEditable(!disabled);
  }, [editor, disabled]);

  if (!editor) return <div className="min-h-48 rounded-md border" />;

  const tool = (label: string, active: boolean, onClick: () => void, Icon: typeof Bold) => (
    <Button type="button" size="icon" variant={active ? 'secondary' : 'ghost'} aria-label={label} aria-pressed={active} disabled={disabled} onClick={onClick}>
      <Icon className="size-4" />
    </Button>
  );

  return (
    <div className={cn('rounded-md border bg-background', invalid && 'border-destructive', disabled && 'opacity-80')}>
      <div className="flex flex-wrap items-center gap-1 border-b p-1" role="toolbar" aria-label="Formatting">
        {tool('Bold', editor.isActive('bold'), () => editor.chain().focus().toggleBold().run(), Bold)}
        {tool('Italic', editor.isActive('italic'), () => editor.chain().focus().toggleItalic().run(), Italic)}
        {tool('Heading', editor.isActive('heading', { level: 2 }), () => editor.chain().focus().toggleHeading({ level: 2 }).run(), Heading2)}
        {tool('Subheading', editor.isActive('heading', { level: 3 }), () => editor.chain().focus().toggleHeading({ level: 3 }).run(), Heading3)}
        {tool('Bulleted list', editor.isActive('bulletList'), () => editor.chain().focus().toggleBulletList().run(), List)}
        {tool('Numbered list', editor.isActive('orderedList'), () => editor.chain().focus().toggleOrderedList().run(), ListOrdered)}
        {tool('Quote', editor.isActive('blockquote'), () => editor.chain().focus().toggleBlockquote().run(), Quote)}
        {tool('Link', editor.isActive('link'), () => {
          const previous = editor.getAttributes('link').href as string | undefined;
          const url = window.prompt('https:// link', previous ?? 'https://');
          if (url === null) return;
          if (url === '') editor.chain().focus().unsetLink().run();
          else if (/^(https:|mailto:|tel:)/.test(url)) editor.chain().focus().setLink({ href: url }).run();
        }, Link2)}
        <span className="mx-1 h-5 w-px bg-border" aria-hidden />
        {tool('Undo', false, () => editor.chain().focus().undo().run(), Undo2)}
        {tool('Redo', false, () => editor.chain().focus().redo().run(), Redo2)}
        {insertables && insertables.length > 0 ? (
          <>
            <span className="mx-1 h-5 w-px bg-border" aria-hidden />
            <span className="px-1 text-xs text-muted-foreground">{insertLabel}</span>
            {insertables.map((i) => (
              <Button key={i.text} type="button" size="xs" variant="outline" disabled={disabled} onClick={() => editor.chain().focus().insertContent(i.text).run()}>
                {i.label}
              </Button>
            ))}
          </>
        ) : null}
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
