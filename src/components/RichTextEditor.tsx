'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faBold,
    faItalic,
    faStrikethrough,
    faCode,
    faParagraph,
    faHeading,
    faListUl,
    faListOl,
    faQuoteRight,
    faUndo,
    faRedo,
    faLink,
    faImage,
    faUnlink,
    faCheck,
    faTimes
} from '@fortawesome/free-solid-svg-icons';
import { useCallback, useState } from 'react';

interface RichTextEditorProps {
    content: string;
    onChange: (content: string) => void;
    editable?: boolean;
}

const ToolbarButton = ({
    onClick,
    isActive = false,
    disabled = false,
    children,
    title
}: {
    onClick: () => void;
    isActive?: boolean;
    disabled?: boolean;
    children: React.ReactNode;
    title: string;
}) => (
    <button
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        onClick={onClick}
        disabled={disabled}
        className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors ${isActive
            ? 'bg-gray-200 dark:bg-gray-700 text-blue-600 dark:text-blue-400'
            : 'text-gray-600 dark:text-gray-400'
            } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        title={title}
    >
        {children}
    </button>
);

import { api } from '@/lib/api';

const MenuBar = ({ editor }: { editor: any }) => {
    const [linkUrl, setLinkUrl] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [showLinkInput, setShowLinkInput] = useState(false);
    const [showImageInput, setShowImageInput] = useState(false);

    const openLinkInput = useCallback(() => {
        const previousUrl = editor?.getAttributes('link').href;
        setLinkUrl(previousUrl || '');
        setShowLinkInput(true);
        setShowImageInput(false);
    }, [editor]);

    const setLink = useCallback(() => {
        if (linkUrl === '') {
            editor?.chain().focus().extendMarkRange('link').unsetLink().run();
        } else {
            editor?.chain().focus().extendMarkRange('link').setLink({ href: linkUrl }).run();
        }
        setShowLinkInput(false);
        setLinkUrl('');
    }, [editor, linkUrl]);

    const openImageInput = useCallback(() => {
        setImageUrl('');
        setShowImageInput(true);
        setShowLinkInput(false);
    }, []);

    const addImage = useCallback(() => {
        if (imageUrl) {
            editor?.chain().focus().setImage({ src: imageUrl }).run();
        }
        setShowImageInput(false);
        setImageUrl('');
    }, [editor, imageUrl]);

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            try {
                const response = await api.uploadImage(file);
                editor?.chain().focus().setImage({ src: response.url }).run();
                setShowImageInput(false);
            } catch (error) {
                console.error('Failed to upload image:', error);
                alert('Failed to upload image');
            }
        }
    };

    if (!editor) {
        return null;
    }

    return (
        <div className="border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50 rounded-t-lg flex flex-col">
            <div className="p-2 flex flex-wrap gap-1">
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    disabled={!editor.can().chain().focus().toggleBold().run()}
                    isActive={editor.isActive('bold')}
                    title="Bold"
                >
                    <FontAwesomeIcon icon={faBold} className="w-4 h-4" />
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    disabled={!editor.can().chain().focus().toggleItalic().run()}
                    isActive={editor.isActive('italic')}
                    title="Italic"
                >
                    <FontAwesomeIcon icon={faItalic} className="w-4 h-4" />
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleStrike().run()}
                    disabled={!editor.can().chain().focus().toggleStrike().run()}
                    isActive={editor.isActive('strike')}
                    title="Strike"
                >
                    <FontAwesomeIcon icon={faStrikethrough} className="w-4 h-4" />
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleCode().run()}
                    disabled={!editor.can().chain().focus().toggleCode().run()}
                    isActive={editor.isActive('code')}
                    title="Code"
                >
                    <FontAwesomeIcon icon={faCode} className="w-4 h-4" />
                </ToolbarButton>

                <div className="w-px h-6 bg-gray-300 dark:bg-gray-700 mx-1 self-center" />

                <ToolbarButton
                    onClick={() => editor.chain().focus().setParagraph().run()}
                    isActive={editor.isActive('paragraph')}
                    title="Paragraph"
                >
                    <FontAwesomeIcon icon={faParagraph} className="w-4 h-4" />
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                    isActive={editor.isActive('heading', { level: 1 })}
                    disabled={!editor.can().chain().focus().toggleHeading({ level: 1 }).run()}
                    title="H1"
                >
                    <span className="font-bold text-sm">H1</span>
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                    isActive={editor.isActive('heading', { level: 2 })}
                    disabled={!editor.can().chain().focus().toggleHeading({ level: 2 }).run()}
                    title="H2"
                >
                    <span className="font-bold text-sm">H2</span>
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                    isActive={editor.isActive('heading', { level: 3 })}
                    disabled={!editor.can().chain().focus().toggleHeading({ level: 3 }).run()}
                    title="H3"
                >
                    <span className="font-bold text-sm">H3</span>
                </ToolbarButton>

                <div className="w-px h-6 bg-gray-300 dark:bg-gray-700 mx-1 self-center" />

                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                    isActive={editor.isActive('bulletList')}
                    disabled={!editor.can().chain().focus().toggleBulletList().run()}
                    title="Bullet List"
                >
                    <FontAwesomeIcon icon={faListUl} className="w-4 h-4" />
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                    isActive={editor.isActive('orderedList')}
                    disabled={!editor.can().chain().focus().toggleOrderedList().run()}
                    title="Ordered List"
                >
                    <FontAwesomeIcon icon={faListOl} className="w-4 h-4" />
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleBlockquote().run()}
                    isActive={editor.isActive('blockquote')}
                    disabled={!editor.can().chain().focus().toggleBlockquote().run()}
                    title="Blockquote"
                >
                    <FontAwesomeIcon icon={faQuoteRight} className="w-4 h-4" />
                </ToolbarButton>

                <div className="w-px h-6 bg-gray-300 dark:bg-gray-700 mx-1 self-center" />

                <ToolbarButton
                    onClick={openLinkInput}
                    isActive={editor.isActive('link')}
                    title="Link"
                >
                    <FontAwesomeIcon icon={faLink} className="w-4 h-4" />
                </ToolbarButton>
                {editor.isActive('link') && (
                    <ToolbarButton
                        onClick={() => editor.chain().focus().unsetLink().run()}
                        title="Unlink"
                    >
                        <FontAwesomeIcon icon={faUnlink} className="w-4 h-4" />
                    </ToolbarButton>
                )}
                <ToolbarButton
                    onClick={openImageInput}
                    isActive={showImageInput}
                    title="Image"
                >
                    <FontAwesomeIcon icon={faImage} className="w-4 h-4" />
                </ToolbarButton>

                <div className="w-px h-6 bg-gray-300 dark:bg-gray-700 mx-1 self-center" />

                <ToolbarButton
                    onClick={() => editor.chain().focus().undo().run()}
                    disabled={!editor.can().chain().focus().undo().run()}
                    title="Undo"
                >
                    <FontAwesomeIcon icon={faUndo} className="w-4 h-4" />
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => editor.chain().focus().redo().run()}
                    disabled={!editor.can().chain().focus().redo().run()}
                    title="Redo"
                >
                    <FontAwesomeIcon icon={faRedo} className="w-4 h-4" />
                </ToolbarButton>
            </div>

            {(showLinkInput) && (
                <div className="p-2 border-t border-gray-200 dark:border-gray-800 flex items-center gap-2 bg-gray-100 dark:bg-gray-800 animate-in slide-in-from-top-2">
                    <input
                        type="text"
                        value={linkUrl}
                        onChange={(e) => setLinkUrl(e.target.value)}
                        placeholder="Enter URL..."
                        className="flex-1 px-3 py-1.5 rounded-md border border-gray-300 dark:border-gray-700 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-gray-900"
                        autoFocus
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                e.preventDefault();
                                setLink();
                            }
                        }}
                    />
                    <button
                        type="button"
                        onClick={setLink}
                        className="p-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                        <FontAwesomeIcon icon={faCheck} className="w-3.5 h-3.5" />
                    </button>
                    <button
                        type="button"
                        onClick={() => {
                            setShowLinkInput(false);
                            setLinkUrl('');
                        }}
                        className="p-1.5 bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                    >
                        <FontAwesomeIcon icon={faTimes} className="w-3.5 h-3.5" />
                    </button>
                </div>
            )}

            {(showImageInput) && (
                <div className="p-2 border-t border-gray-200 dark:border-gray-800 bg-gray-100 dark:bg-gray-800 animate-in slide-in-from-top-2">
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                            <input
                                type="text"
                                value={imageUrl}
                                onChange={(e) => setImageUrl(e.target.value)}
                                placeholder="Paste Image URL or upload..."
                                className="flex-1 px-3 py-1.5 rounded-md border border-gray-300 dark:border-gray-700 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-gray-900"
                                autoFocus
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        addImage();
                                    }
                                }}
                            />
                            <div className="relative">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileUpload}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                />
                                <button
                                    type="button"
                                    className="px-3 py-1.5 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-medium rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                                >
                                    Upload
                                </button>
                            </div>
                            <button
                                type="button"
                                onClick={addImage}
                                className="p-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                            >
                                <FontAwesomeIcon icon={faCheck} className="w-3.5 h-3.5" />
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setShowImageInput(false);
                                    setImageUrl('');
                                }}
                                className="p-1.5 bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                            >
                                <FontAwesomeIcon icon={faTimes} className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default function RichTextEditor({ content, onChange, editable = true }: RichTextEditorProps) {
    const editor = useEditor({
        immediatelyRender: false,
        extensions: [
            StarterKit,
            Image.configure({
                inline: true,
                allowBase64: true,
            }),
            Link.configure({
                openOnClick: false,
                HTMLAttributes: {
                    class: 'text-blue-600 hover:text-blue-800 underline',
                },
            }),
            Placeholder.configure({
                placeholder: 'Start writing your amazing story...',
            }),
        ],
        content: content,
        editable: editable,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
        editorProps: {
            attributes: {
                class: 'prose dark:prose-invert max-w-none focus:outline-none min-h-[300px] px-6 py-4',
            },
        },
    });

    return (
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 flex flex-col overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent transition-all">
            {editable && <MenuBar editor={editor} />}
            <EditorContent editor={editor} className="flex-1 cursor-text" />
        </div>
    );
}
