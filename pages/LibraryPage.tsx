
import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Book as BookIcon, Plus, Quote, MoreVertical, Trash2, Check, BookOpen, Upload, X, FileText, Highlighter } from 'lucide-react';
import { Book, BookStatus } from '../types';

export const LibraryPage: React.FC = () => {
    const { books, addBook, updateBookProgress, updateBookStatus, addQuoteToBook, deleteQuoteFromBook, deleteBook } = useApp();
    
    // Modal States
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [activeBook, setActiveBook] = useState<Book | null>(null);
    const [isReaderOpen, setIsReaderOpen] = useState(false);
    
    const [quoteInput, setQuoteInput] = useState('');
    const [pageInput, setPageInput] = useState('');

    // Add Form
    const [newTitle, setNewTitle] = useState('');
    const [newAuthor, setNewAuthor] = useState('');
    const [newTopic, setNewTopic] = useState('');
    const [newPages, setNewPages] = useState('');
    const [newColor, setNewColor] = useState('bg-blue-500');
    const [newContent, setNewContent] = useState('');
    const [fileName, setFileName] = useState('');

    const colors = ['bg-red-500', 'bg-orange-500', 'bg-amber-500', 'bg-green-500', 'bg-emerald-500', 'bg-teal-500', 'bg-cyan-500', 'bg-blue-500', 'bg-indigo-500', 'bg-violet-500', 'bg-purple-500', 'bg-fuchsia-500', 'bg-pink-500', 'bg-rose-500'];

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setFileName(file.name);
            const reader = new FileReader();
            reader.onload = (ev) => {
                if (ev.target?.result) {
                    setNewContent(ev.target.result as string);
                    if (!newTitle) setNewTitle(file.name.replace('.txt', ''));
                }
            };
            reader.readAsText(file);
        }
    };

    const handleAddBook = (e: React.FormEvent) => {
        e.preventDefault();
        addBook(newTitle, newAuthor, newTopic, parseInt(newPages) || 100, newColor, newContent);
        setIsAddOpen(false);
        setNewTitle(''); setNewAuthor(''); setNewTopic(''); setNewPages(''); setNewContent(''); setFileName('');
    };

    const handleAddQuote = (e: React.FormEvent) => {
        e.preventDefault();
        if(activeBook && quoteInput) {
            addQuoteToBook(activeBook.id, quoteInput, pageInput);
            setQuoteInput('');
            setPageInput('');
        }
    };

    // --- Reader Logic ---
    const [selectionRect, setSelectionRect] = useState<DOMRect | null>(null);
    const [selectedText, setSelectedText] = useState('');
    const contentRef = useRef<HTMLDivElement>(null);

    const handleTextSelection = () => {
        const selection = window.getSelection();
        if (selection && selection.toString().length > 0) {
            const range = selection.getRangeAt(0);
            const rect = range.getBoundingClientRect();
            setSelectionRect(rect);
            setSelectedText(selection.toString());
        } else {
            setSelectionRect(null);
            setSelectedText('');
        }
    };

    const saveHighlight = () => {
        if (activeBook && selectedText) {
            // Estimate page number based on scroll position logic in a real app, 
            // here just use current progress page
            addQuoteToBook(activeBook.id, selectedText, activeBook.currentPage.toString());
            setSelectionRect(null);
            window.getSelection()?.removeAllRanges();
        }
    };

    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        if (!activeBook) return;
        const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
        const scrollPercentage = scrollTop / (scrollHeight - clientHeight);
        
        // Map scroll percentage to page numbers
        const newPage = Math.min(activeBook.totalPages, Math.max(1, Math.round(scrollPercentage * activeBook.totalPages)));
        
        // Debounce update to avoid spamming updates
        if (Math.abs(newPage - activeBook.currentPage) >= 1) {
            updateBookProgress(activeBook.id, newPage);
        }
    };

    // Derived active book from context (so it updates live)
    const currentActiveBook = activeBook ? books.find(b => b.id === activeBook.id) : null;

    return (
        <div className="p-4 md:p-8 pb-24 md:pb-8 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Library</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Track reading, save wisdom.</p>
                </div>
                <button 
                    onClick={() => setIsAddOpen(true)}
                    className="bg-primary hover:bg-violet-700 text-white px-4 py-2 rounded-lg shadow-lg shadow-violet-500/20 flex items-center gap-2"
                >
                    <Plus size={20} />
                    <span className="hidden sm:inline">Add Book</span>
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {books.map(book => {
                    const percent = Math.round((book.currentPage / book.totalPages) * 100);
                    return (
                        <div 
                            key={book.id} 
                            onClick={() => { setActiveBook(book); setIsReaderOpen(false); }}
                            className="glass-panel group rounded-2xl p-4 transition-all hover:-translate-y-1 hover:shadow-lg cursor-pointer flex flex-col h-full relative overflow-hidden"
                        >
                            <div className="flex gap-4 mb-4 relative z-10">
                                <div className={`w-20 h-28 rounded-md shadow-md shrink-0 ${book.coverColor} flex items-center justify-center text-white/50`}>
                                    <BookIcon size={32} />
                                </div>
                                <div className="min-w-0">
                                    <h3 className="font-bold text-gray-900 dark:text-white leading-tight mb-1 truncate">{book.title}</h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{book.author}</p>
                                    <span className="inline-block mt-2 text-[10px] px-2 py-0.5 rounded-full bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-gray-300">
                                        {book.topic || 'General'}
                                    </span>
                                </div>
                            </div>

                            <div className="mt-auto relative z-10">
                                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                                    <span>{percent}% Read</span>
                                    <span>{book.currentPage} / {book.totalPages} p</span>
                                </div>
                                <div className="w-full h-2 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                    <div className={`h-full ${book.coverColor} transition-all duration-500`} style={{ width: `${percent}%` }}></div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Add Book Modal */}
            {isAddOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-900/90 backdrop-blur-xl rounded-2xl w-full max-w-lg p-6 border border-gray-200 dark:border-slate-700 animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
                        <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">Add New Book</h2>
                        <form onSubmit={handleAddBook} className="space-y-4">
                            <input 
                                required placeholder="Book Title" 
                                value={newTitle} onChange={e => setNewTitle(e.target.value)}
                                className="w-full bg-gray-50 dark:bg-slate-950/50 border border-gray-300 dark:border-slate-700 rounded-lg p-2.5 outline-none dark:text-white"
                            />
                            <input 
                                required placeholder="Author" 
                                value={newAuthor} onChange={e => setNewAuthor(e.target.value)}
                                className="w-full bg-gray-50 dark:bg-slate-950/50 border border-gray-300 dark:border-slate-700 rounded-lg p-2.5 outline-none dark:text-white"
                            />
                            <div className="flex gap-4">
                                <input 
                                    placeholder="Topic/Genre" 
                                    value={newTopic} onChange={e => setNewTopic(e.target.value)}
                                    className="flex-1 bg-gray-50 dark:bg-slate-950/50 border border-gray-300 dark:border-slate-700 rounded-lg p-2.5 outline-none dark:text-white"
                                />
                                <input 
                                    type="number" placeholder="Pages" 
                                    value={newPages} onChange={e => setNewPages(e.target.value)}
                                    className="w-24 bg-gray-50 dark:bg-slate-950/50 border border-gray-300 dark:border-slate-700 rounded-lg p-2.5 outline-none dark:text-white"
                                />
                            </div>
                            
                            <div>
                                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 block">Upload Content (Optional)</label>
                                <div className="border-2 border-dashed border-gray-300 dark:border-slate-700 rounded-lg p-4 text-center hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors cursor-pointer relative">
                                    <input type="file" accept=".txt" onChange={handleFileUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                                    <Upload className="mx-auto text-gray-400 mb-2" size={24} />
                                    <p className="text-sm text-gray-500 dark:text-gray-400">{fileName || "Click to upload .txt file"}</p>
                                </div>
                                <div className="mt-2 text-center text-xs text-gray-400">OR</div>
                                <textarea 
                                    placeholder="Paste book content here..."
                                    value={newContent}
                                    onChange={e => setNewContent(e.target.value)}
                                    className="w-full mt-2 h-24 bg-gray-50 dark:bg-slate-950/50 border border-gray-300 dark:border-slate-700 rounded-lg p-2.5 outline-none dark:text-white text-xs"
                                />
                            </div>

                            <div>
                                <label className="text-xs text-gray-500 mb-2 block">Cover Color</label>
                                <div className="flex flex-wrap gap-2">
                                    {colors.map(c => (
                                        <button 
                                            key={c} type="button"
                                            onClick={() => setNewColor(c)}
                                            className={`w-8 h-8 rounded-full ${c} ${newColor === c ? 'ring-2 ring-white ring-offset-2 ring-offset-gray-900' : ''}`}
                                        />
                                    ))}
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 mt-6">
                                <button type="button" onClick={() => setIsAddOpen(false)} className="px-4 py-2 text-gray-500 dark:text-gray-300">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-violet-700">Add Book</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Book Details Modal */}
            {currentActiveBook && !isReaderOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-900/90 backdrop-blur-xl rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden border border-gray-200 dark:border-slate-700 flex flex-col md:flex-row shadow-2xl animate-in zoom-in-95">
                        
                        {/* Left: Book Info & Progress */}
                        <div className="w-full md:w-1/3 p-6 bg-gray-50/50 dark:bg-slate-800/30 border-b md:border-b-0 md:border-r border-gray-200 dark:border-slate-700 flex flex-col items-center">
                             <div className={`w-32 h-44 rounded-lg shadow-xl mb-6 ${currentActiveBook.coverColor} flex items-center justify-center text-white/50`}>
                                <BookOpen size={48} />
                            </div>
                            <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-1">{currentActiveBook.title}</h2>
                            <p className="text-center text-gray-500 dark:text-gray-400 mb-6">{currentActiveBook.author}</p>
                            
                            {currentActiveBook.content ? (
                                <button 
                                    onClick={() => setIsReaderOpen(true)}
                                    className="w-full mb-6 bg-primary hover:bg-violet-700 text-white py-3 rounded-lg font-bold shadow-lg shadow-violet-500/30 flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
                                >
                                    <BookOpen size={20} /> Read Now
                                </button>
                            ) : (
                                <div className="w-full mb-6 p-3 bg-gray-100 dark:bg-slate-800 rounded-lg text-center text-xs text-gray-500">
                                    No content uploaded. <br/>Delete and re-add with text to read.
                                </div>
                            )}

                            <div className="w-full space-y-6">
                                <div>
                                    <label className="text-xs font-semibold uppercase text-gray-400 mb-2 block">Manual Progress</label>
                                    <div className="flex items-center justify-between mb-2">
                                        <input 
                                            type="number" 
                                            min="0" max={currentActiveBook.totalPages}
                                            value={currentActiveBook.currentPage}
                                            onChange={(e) => updateBookProgress(currentActiveBook.id, parseInt(e.target.value) || 0)}
                                            className="w-20 bg-transparent border-b border-gray-300 dark:border-slate-600 text-center font-bold text-lg dark:text-white focus:border-primary outline-none"
                                        />
                                        <span className="text-gray-400">/ {currentActiveBook.totalPages} pages</span>
                                    </div>
                                    <input 
                                        type="range" 
                                        min="0" max={currentActiveBook.totalPages}
                                        value={currentActiveBook.currentPage}
                                        onChange={(e) => updateBookProgress(currentActiveBook.id, parseInt(e.target.value))}
                                        className="w-full accent-primary h-2 bg-gray-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer"
                                    />
                                </div>

                                <div className="pt-6 border-t border-gray-200 dark:border-slate-700">
                                    <button 
                                        onClick={() => { deleteBook(currentActiveBook.id); setActiveBook(null); }}
                                        className="w-full py-2 flex items-center justify-center gap-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition-colors"
                                    >
                                        <Trash2 size={18} /> Delete Book
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Right: Quotes & Notes */}
                        <div className="flex-1 p-6 flex flex-col min-h-0 bg-white dark:bg-transparent">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-bold text-gray-800 dark:text-white flex items-center gap-2">
                                    <Quote className="text-primary" size={20} /> Favorite Quotes
                                </h3>
                                <button onClick={() => setActiveBook(null)} className="text-gray-400 hover:text-gray-600 dark:hover:text-white">Close</button>
                            </div>

                            <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar mb-4">
                                {currentActiveBook.quotes.length === 0 && (
                                    <div className="text-center py-12 text-gray-400">
                                        No quotes saved yet. Read the book and highlight text to save quotes automatically!
                                    </div>
                                )}
                                {currentActiveBook.quotes.map(quote => (
                                    <div key={quote.id} className="group relative p-4 bg-yellow-50 dark:bg-slate-800/50 rounded-xl border border-yellow-100 dark:border-slate-700">
                                        <p className="text-gray-800 dark:text-gray-200 font-serif italic mb-2">"{quote.text}"</p>
                                        <div className="flex justify-between items-center text-xs text-gray-400">
                                            <span>Page {quote.page || '?'}</span>
                                            <button 
                                                onClick={() => deleteQuoteFromBook(currentActiveBook.id, quote.id)}
                                                className="opacity-0 group-hover:opacity-100 hover:text-red-500 transition-opacity"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <form onSubmit={handleAddQuote} className="mt-auto bg-gray-50 dark:bg-slate-950/30 p-4 rounded-xl border border-gray-100 dark:border-slate-700">
                                <textarea 
                                    placeholder="Type a quote manually..."
                                    required
                                    value={quoteInput}
                                    onChange={(e) => setQuoteInput(e.target.value)}
                                    className="w-full bg-transparent outline-none resize-none text-sm dark:text-white placeholder-gray-400 mb-2 h-16"
                                />
                                <div className="flex justify-between items-center">
                                    <input 
                                        placeholder="Page #"
                                        value={pageInput}
                                        onChange={(e) => setPageInput(e.target.value)}
                                        className="bg-transparent border-b border-gray-300 dark:border-slate-600 w-20 text-xs py-1 outline-none dark:text-white"
                                    />
                                    <button 
                                        type="submit"
                                        className="bg-primary hover:bg-violet-700 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                                    >
                                        Save Quote
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Immersive Reader View */}
            {isReaderOpen && currentActiveBook && (
                <div className="fixed inset-0 bg-white dark:bg-[#0a0a0a] z-[60] flex flex-col animate-in fade-in duration-300">
                    {/* Reader Header */}
                    <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-slate-800 bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-md sticky top-0 z-10">
                         <div className="flex items-center gap-4">
                             <button onClick={() => setIsReaderOpen(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full">
                                 <X size={24} className="text-gray-600 dark:text-gray-300" />
                             </button>
                             <div>
                                 <h2 className="font-bold text-gray-900 dark:text-white text-sm md:text-base">{currentActiveBook.title}</h2>
                                 <p className="text-xs text-gray-500 dark:text-gray-400">Page {currentActiveBook.currentPage} of {currentActiveBook.totalPages}</p>
                             </div>
                         </div>
                         <div className="flex items-center gap-2">
                             <span className="text-xs font-medium text-primary bg-indigo-50 dark:bg-violet-900/30 px-2 py-1 rounded-md">
                                 {Math.round((currentActiveBook.currentPage / currentActiveBook.totalPages) * 100)}%
                             </span>
                         </div>
                    </div>

                    {/* Reading Area */}
                    <div 
                        className="flex-1 overflow-y-auto relative custom-scrollbar"
                        onScroll={handleScroll}
                        onMouseUp={handleTextSelection}
                    >
                         <div className="max-w-3xl mx-auto p-6 md:p-12 min-h-screen bg-white dark:bg-[#0a0a0a]">
                             {/* Text Content */}
                             <div 
                                ref={contentRef}
                                className="prose prose-lg dark:prose-invert prose-indigo mx-auto font-serif leading-loose"
                                style={{ whiteSpace: 'pre-wrap' }}
                             >
                                 {currentActiveBook.content}
                             </div>
                             
                             {/* Bottom Padding */}
                             <div className="h-32 flex items-center justify-center text-gray-400 text-sm">
                                 --- End of Book ---
                             </div>
                         </div>

                         {/* Floating Highlight Button */}
                         {selectionRect && (
                             <div 
                                 className="fixed bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-4 py-2 rounded-full shadow-xl flex items-center gap-2 cursor-pointer hover:scale-105 transition-transform z-50 animate-in zoom-in-50"
                                 style={{ 
                                     top: selectionRect.top - 50, 
                                     left: selectionRect.left + (selectionRect.width / 2) - 60 
                                 }}
                                 onClick={saveHighlight}
                                 onMouseDown={(e) => e.preventDefault()} // Prevent losing selection
                             >
                                 <Highlighter size={16} />
                                 <span className="text-xs font-bold">Highlight</span>
                             </div>
                         )}
                    </div>
                    
                    {/* Progress Bar at Bottom */}
                    <div className="h-1 bg-gray-100 dark:bg-slate-800 w-full">
                         <div 
                            className="h-full bg-primary transition-all duration-100"
                            style={{ width: `${(currentActiveBook.currentPage / currentActiveBook.totalPages) * 100}%` }}
                         ></div>
                    </div>
                </div>
            )}
        </div>
    );
};
