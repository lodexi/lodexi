import { Head, Link } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import ApplicationLogo from '@/Components/ApplicationLogo';
import { Search, Menu, X, ArrowLeft, MonitorPlay, Sun, Moon, LayoutGrid } from 'lucide-react';

export default function DocsIndex({ content, navigation, currentPage }) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    
    // Close mobile menu when changing page
    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [currentPage]);

    return (
        <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-gray-100 font-sans">
            <Head title={`Documentation - ${currentPage}`} />

            {/* Top Navbar */}
            <header className="sticky top-0 z-50 w-full border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md">
                <div className="flex h-16 items-center px-4 md:px-6 w-full mx-auto justify-between">
                    <div className="flex items-center gap-6">
                        <Link href="/" className="flex items-center gap-2">
                            <ApplicationLogo className="h-7 w-auto" />
                            <span className="bg-[#F29191]/10 text-[#e06a6a] dark:bg-[#F29191]/20 dark:text-[#F29191] font-semibold text-[13px] px-2 py-0.5 rounded-md hidden sm:inline-block ml-1">Docs</span>
                        </Link>
                        
                        {/* Top Nav Links */}
                        <div className="hidden lg:flex items-center gap-6 ml-4 text-[15px] font-medium text-slate-600 dark:text-slate-300">
                            <Link href="#" className="hover:text-[#F29191] transition-colors">Guides</Link>
                            <Link href="#" className="hover:text-[#F29191] transition-colors">Learn</Link>
                            <Link href="#" className="hover:text-[#F29191] transition-colors">AI</Link>
                            <Link href="#" className="hover:text-[#F29191] transition-colors">Reference</Link>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 sm:gap-4">
                        <div className="hidden sm:flex items-center gap-1 sm:gap-2 text-slate-600 dark:text-slate-400">
                            <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                                <Search className="w-5 h-5" />
                            </button>
                            <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                                <Sun className="w-5 h-5" />
                            </button>
                            <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                                <LayoutGrid className="w-5 h-5" />
                            </button>
                        </div>
                        
                        <Link href={route('dashboard')} className="hidden sm:flex items-center justify-center px-5 py-2 text-sm font-bold text-white bg-[#F29191] hover:bg-[#e07a7a] rounded-full transition-colors ml-2">
                            Get started
                        </Link>
                        
                        <button 
                            className="lg:hidden p-2 text-slate-600 dark:text-slate-400"
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        >
                            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content Area */}
            <div className="max-w-8xl mx-auto flex">
                
                {/* Left Sidebar (Navigation) */}
                <aside className={`
                    fixed inset-y-0 left-0 z-40 w-72 bg-white/80 dark:bg-slate-900/50 backdrop-blur-xl border-r border-slate-200/50 dark:border-slate-700/50 pt-20 pb-10 overflow-y-auto transition-transform duration-300 ease-in-out md:translate-x-0 md:sticky md:top-16 md:h-[calc(100vh-4rem)] md:block md:w-64 lg:w-72 md:pt-8 shrink-0
                    ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
                `}>
                    <nav className="px-4 md:px-6">
                        {Object.entries(navigation).map(([category, links]) => (
                            <div key={category} className="mb-8">
                                <h5 className="mb-3 font-semibold text-slate-900 dark:text-gray-200 uppercase tracking-wider text-xs">
                                    {category}
                                </h5>
                                <ul className="space-y-2 border-l border-slate-200/60 dark:border-slate-700/60 ml-2">
                                    {Object.entries(links).map(([slug, title]) => {
                                        const isActive = currentPage === slug;
                                        return (
                                            <li key={slug}>
                                                <Link
                                                    href={route('docs', { page: slug })}
                                                    className={`block pl-4 -ml-[1px] border-l text-sm transition-all duration-300 ${
                                                        isActive 
                                                        ? 'border-[#F29191] text-[#F29191] font-medium drop-shadow-[0_0_8px_rgba(242,145,145,0.6)]' 
                                                        : 'border-transparent text-slate-600 dark:text-slate-400 hover:border-[#F29191]/50 hover:text-[#F29191] hover:drop-shadow-[0_0_5px_rgba(242,145,145,0.4)]'
                                                    }`}
                                                >
                                                    {title}
                                                </Link>
                                            </li>
                                        );
                                    })}
                                </ul>
                            </div>
                        ))}
                    </nav>
                </aside>

                {/* Mobile Overlay */}
                {isMobileMenuOpen && (
                    <div 
                        className="fixed inset-0 z-30 bg-slate-900/50 backdrop-blur-sm md:hidden"
                        onClick={() => setIsMobileMenuOpen(false)}
                    />
                )}

                {/* Center Content Area */}
                <main className="flex-1 min-w-0 px-4 md:px-10 lg:px-12 py-8 lg:py-12">
                    <div 
                        className="prose prose-slate dark:prose-invert max-w-4xl prose-headings:font-bold prose-a:text-[#F29191] hover:prose-a:text-[#f37c7c] prose-a:no-underline hover:prose-a:underline prose-code:text-[#F29191] prose-code:bg-[#F29191]/10 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:before:content-none prose-code:after:content-none prose-pre:bg-slate-900 prose-pre:border prose-pre:border-slate-800"
                        dangerouslySetInnerHTML={{ __html: content }}
                    />
                    
                    <div className="mt-16 pt-8 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center text-sm text-slate-500">
                        <span>Last updated on {new Date().toLocaleDateString()}</span>
                        <a href="https://github.com/lodexi/lodexi-docs" target="_blank" className="hover:text-slate-900 dark:hover:text-gray-300 transition-colors">
                            Edit this page on GitHub
                        </a>
                    </div>
                </main>

                {/* Right Sidebar (Table of Contents - Desktop only) */}
                <div className="hidden xl:block w-64 shrink-0 px-6 pt-12">
                    <div className="sticky top-24">
                        <h5 className="font-semibold text-sm mb-4 text-slate-900 dark:text-gray-200">On this page</h5>
                        {/* We could parse headings from HTML here for a dynamic TOC, but keeping it simple for now */}
                        <div className="text-sm text-slate-500 italic">
                            (Dynamic TOC parsing in progress...)
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
