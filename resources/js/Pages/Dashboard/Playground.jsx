import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { useState } from 'react';
import { Send } from 'lucide-react';

export default function Playground() {
    const [query, setQuery] = useState('');
    const [chatHistory, setChatHistory] = useState([
        { role: 'assistant', content: 'Halo! Saya adalah Asisten AI LODEXI. Silakan uji coba saya dengan bertanya seputar dokumen yang telah Anda unggah.' }
    ]);
    const [isLoading, setIsLoading] = useState(false);

    const handleAsk = async (e) => {
        e.preventDefault();
        if (!query.trim()) return;

        const userMsg = query;
        setChatHistory(prev => [...prev, { role: 'user', content: userMsg }]);
        setQuery('');
        setIsLoading(true);

        try {
            // Memanggil API Backend Laravel yang akan diteruskan ke Python
            const response = await fetch('/portal/ask', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
                },
                body: JSON.stringify({ question: userMsg, limit: 3 })
            });
            const data = await response.json();
            
            setChatHistory(prev => [...prev, { role: 'assistant', content: data.answer || "Maaf, tidak ada jawaban dari dokumen." }]);
        } catch (error) {
            setChatHistory(prev => [...prev, { role: 'assistant', content: "Terjadi kesalahan saat menghubungi server AI." }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-bold leading-tight text-gray-800 dark:text-gray-200">
                        AI Playground
                    </h2>
                </div>
            }
        >
            <Head title="AI Playground" />

            <div className="py-8">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="max-w-4xl mx-auto">
                        <div className="overflow-hidden bg-white shadow-xl sm:rounded-2xl dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex flex-col h-[70vh]">
                            
                            <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 flex justify-between items-center">
                                <div>
                                    <h3 className="font-bold text-gray-800 dark:text-gray-200">AI Testing Playground</h3>
                                    <p className="text-xs text-gray-500">Test your ingested documents here before deploying your API</p>
                                </div>
                                <div className="flex items-center">
                                    <span className="flex h-3 w-3 relative">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                                    </span>
                                    <span className="ml-2 text-xs font-semibold text-gray-600 dark:text-gray-300">Core Connected</span>
                                </div>
                            </div>

                            {/* Chat History Area */}
                            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50/50 dark:bg-gray-900/50">
                                {chatHistory.map((chat, idx) => (
                                    <div key={idx} className={`flex ${chat.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[75%] p-4 rounded-2xl shadow-sm ${chat.role === 'user' ? 'bg-slate-800 dark:bg-gray-200 text-white dark:text-gray-900 rounded-br-sm' : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700 rounded-bl-sm'}`}>
                                            <p className="whitespace-pre-wrap text-sm md:text-base leading-relaxed">{chat.content}</p>
                                        </div>
                                    </div>
                                ))}
                                {isLoading && (
                                    <div className="flex justify-start">
                                        <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl rounded-bl-sm border border-gray-200 dark:border-gray-700 flex space-x-2 items-center">
                                            <div className="w-2 h-2 bg-[#F29191] rounded-full animate-bounce"></div>
                                            <div className="w-2 h-2 bg-[#F29191] rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                            <div className="w-2 h-2 bg-[#F29191] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Input Area */}
                            <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-800">
                                <form onSubmit={handleAsk} className="flex space-x-4">
                                    <input
                                        type="text"
                                        value={query}
                                        onChange={(e) => setQuery(e.target.value)}
                                        placeholder="Ask your knowledge base..."
                                        className="flex-1 rounded-xl bg-gray-100 dark:bg-gray-700 border-transparent focus:border-slate-800 focus:ring-slate-800 text-gray-900 dark:text-white placeholder-gray-500"
                                    />
                                    <button
                                        type="submit"
                                        disabled={isLoading || !query.trim()}
                                        className="inline-flex items-center justify-center rounded-xl bg-slate-800 dark:bg-gray-200 px-6 py-3 text-sm font-bold text-white dark:text-gray-900 shadow-sm hover:opacity-90 disabled:opacity-50 transition-colors"
                                    >
                                        <Send className="w-4 h-4" />
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
