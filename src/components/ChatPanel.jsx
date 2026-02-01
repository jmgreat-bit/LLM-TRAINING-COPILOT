import { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';

export default function ChatPanel({
    messages,
    onSendMessage,
    onClearChat,
    isLoading,
    hasApiKey
}) {
    const [inputValue, setInputValue] = useState('');
    const [selectedImage, setSelectedImage] = useState(null); // { file, preview, base64 }
    const [copiedIndex, setCopiedIndex] = useState(null); // Track which message was copied
    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);
    const inputRef = useRef(null);

    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]);

    // Handle clipboard paste (Ctrl+V) for images
    const handlePaste = (e) => {
        const items = e.clipboardData?.items;
        if (!items) return;

        for (let i = 0; i < items.length; i++) {
            if (items[i].type.startsWith('image/')) {
                e.preventDefault();
                const file = items[i].getAsFile();
                if (file) {
                    const reader = new FileReader();
                    reader.onload = (event) => {
                        setSelectedImage({
                            file,
                            preview: event.target.result,
                            base64: event.target.result.split(',')[1],
                            mimeType: file.type
                        });
                    };
                    reader.readAsDataURL(file);
                }
                break;
            }
        }
    };

    // Copy message content to clipboard
    const handleCopyMessage = async (content, index) => {
        try {
            await navigator.clipboard.writeText(content);
            setCopiedIndex(index);
            setTimeout(() => setCopiedIndex(null), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    const handleImageSelect = (e) => {
        const file = e.target.files[0];
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (event) => {
                setSelectedImage({
                    file,
                    preview: event.target.result,
                    base64: event.target.result.split(',')[1], // Remove data:image/...;base64, prefix
                    mimeType: file.type
                });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemoveImage = () => {
        setSelectedImage(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if ((inputValue.trim() || selectedImage) && !isLoading) {
            onSendMessage(inputValue.trim(), selectedImage);
            setInputValue('');
            setSelectedImage(null);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    return (
        <div className="panel chat-panel">
            <div className="panel-header">
                <h2 className="panel-title">Discussion</h2>
                {messages.length > 0 && (
                    <button
                        className="btn-new-chat"
                        onClick={onClearChat}
                        title="Start new conversation"
                    >
                        New Chat
                    </button>
                )}
            </div>

            <div className="chat-messages">
                {/* No API Key Warning - Only shows when no key */}
                {!hasApiKey && (
                    <div className="no-api-warning">
                        <span className="warning-icon">⚠</span>
                        <div className="warning-content">
                            <strong>No API Key</strong>
                            <p>Add your Gemini API key in the header for real AI responses. Currently using demo mode.</p>
                            <a
                                href="https://aistudio.google.com/apikey"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="get-key-link"
                            >
                                Get a free API key →
                            </a>
                        </div>
                    </div>
                )}

                {/* Hint - Fix #3: Chat boundary clarification */}
                <div className="chat-hint">
                    Use chat to challenge or modify the current configuration. You can also upload screenshots of error logs or configs.
                </div>

                {messages.length === 0 ? (
                    <div className="chat-empty">
                        <p>No messages yet. Try:</p>
                        <ul>
                            <li>"What if I use fp16?"</li>
                            <li>"Explain the OOM error"</li>
                            <li>Upload a screenshot of your error</li>
                        </ul>
                    </div>
                ) : (
                    messages.map((msg, i) => (
                        <div key={i} className={`chat-message ${msg.role}`}>
                            <span className="message-label">
                                {msg.role === 'user' ? 'You' :
                                    msg.role === 'system' ? 'System' : 'AI'}
                            </span>
                            <div className={`message-bubble ${msg.type || ''} markdown-content`}>
                                {/* Copy button */}
                                {msg.content && (
                                    <button
                                        className={`btn-copy-message ${copiedIndex === i ? 'copied' : ''}`}
                                        onClick={() => handleCopyMessage(msg.content, i)}
                                        title="Copy message"
                                    >
                                        {copiedIndex === i ? (
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <polyline points="20 6 9 17 4 12" />
                                            </svg>
                                        ) : (
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                                                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                                            </svg>
                                        )}
                                    </button>
                                )}
                                {/* Display image if present */}
                                {msg.image && (
                                    <img
                                        src={msg.image.preview || `data:${msg.image.mimeType};base64,${msg.image.base64}`}
                                        alt="Uploaded"
                                        className="chat-image"
                                    />
                                )}
                                {/* Display text content */}
                                {msg.content && typeof msg.content === 'string' ? (
                                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                                ) : msg.content ? (
                                    <span>{JSON.stringify(msg.content)}</span>
                                ) : null}
                            </div>
                        </div>
                    ))
                )}

                {isLoading && (
                    <div className="chat-message assistant">
                        <span className="message-label">AI</span>
                        <div className="message-bubble">
                            <div className="typing-indicator">
                                <span></span><span></span><span></span>
                            </div>
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Image Preview */}
            {selectedImage && (
                <div className="image-preview-container">
                    <img src={selectedImage.preview} alt="Preview" className="image-preview" />
                    <button
                        className="image-remove-btn"
                        onClick={handleRemoveImage}
                        type="button"
                    >
                        ✕
                    </button>
                </div>
            )}

            <form className="chat-input-container" onSubmit={handleSubmit}>
                {/* Hidden file input */}
                <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleImageSelect}
                    style={{ display: 'none' }}
                />

                {/* Image upload button */}
                <button
                    type="button"
                    className="btn btn-icon btn-image-upload"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isLoading}
                    title="Upload image"
                >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                        <circle cx="8.5" cy="8.5" r="1.5" />
                        <polyline points="21 15 16 10 5 21" />
                    </svg>
                </button>

                <input
                    type="text"
                    className="chat-input"
                    ref={inputRef}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onPaste={handlePaste}
                    placeholder={selectedImage ? "Describe what you need help with..." : "Ask about your configuration... (Ctrl+V to paste screenshot)"}
                    disabled={isLoading}
                />
                <button
                    type="submit"
                    className="btn btn-primary btn-send"
                    disabled={isLoading || (!inputValue.trim() && !selectedImage)}
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M2 21l21-9L2 3v7l15 2-15 2v7z" />
                    </svg>
                </button>
            </form>
        </div>
    );
}
