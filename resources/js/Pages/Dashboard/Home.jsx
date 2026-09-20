import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { Database, MessageSquare, Files, ArrowRight, Zap, Coins } from 'lucide-react';

export default function Home({ stats }) {
    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-slate-900 dark:text-gray-100">
                    Overview Dashboard
                </h2>
            }
        >
            <Head title="Home" />

            <div className="py-8">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8 space-y-6">
                    
                    {/* Welcome Section */}
                    <div className="bg-white/80 dark:bg-slate-900/50 backdrop-blur-xl border border-slate-200/60 dark:border-slate-700/50 shadow-sm sm:rounded-2xl p-5 sm:p-6 relative overflow-hidden">
                        <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#F29191]/20 rounded-full blur-3xl opacity-50 dark:opacity-20 pointer-events-none"></div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">
                            Welcome back!
                        </h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                            Here's a quick overview of your AI project's status and usage.
                        </p>
                    </div>

                    {/* Analytics Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Documents */}
                        <div className="group bg-white/80 dark:bg-slate-900/50 backdrop-blur-xl border border-slate-200/60 dark:border-slate-700/50 shadow-sm sm:rounded-2xl p-5 flex flex-col hover:shadow-md hover:border-[#F29191]/30 transition-all duration-300">
                            <div className="flex items-center space-x-3 mb-4">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#F29191]/20 to-orange-400/10 flex items-center justify-center group-hover:scale-105 transition-transform">
                                    <Files className="w-5 h-5 text-[#F29191]" />
                                </div>
                                <h3 className="text-base font-medium text-slate-900 dark:text-gray-100">Knowledge Base</h3>
                            </div>
                            <div className="mt-auto">
                                <p className="text-3xl font-bold text-slate-900 dark:text-white">{stats.total_documents}</p>
                                <p className="text-xs text-slate-500 mt-1">Total documents uploaded</p>
                            </div>
                        </div>

                        {/* Requests */}
                        <div className="group bg-white/80 dark:bg-slate-900/50 backdrop-blur-xl border border-slate-200/60 dark:border-slate-700/50 shadow-sm sm:rounded-2xl p-5 flex flex-col hover:shadow-md hover:border-[#F29191]/30 transition-all duration-300">
                            <div className="flex items-center space-x-3 mb-4">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500/20 to-pink-400/10 flex items-center justify-center group-hover:scale-105 transition-transform">
                                    <Zap className="w-5 h-5 text-rose-500" />
                                </div>
                                <h3 className="text-base font-medium text-slate-900 dark:text-gray-100">API Requests</h3>
                            </div>
                            <div className="mt-auto">
                                <p className="text-3xl font-bold text-slate-900 dark:text-white">{stats.total_requests}</p>
                                <p className="text-xs text-slate-500 mt-1">Total queries made</p>
                            </div>
                        </div>

                        {/* Tokens */}
                        <div className="group bg-white/80 dark:bg-slate-900/50 backdrop-blur-xl border border-slate-200/60 dark:border-slate-700/50 shadow-sm sm:rounded-2xl p-5 flex flex-col hover:shadow-md hover:border-[#F29191]/30 transition-all duration-300">
                            <div className="flex items-center space-x-3 mb-4">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-400/10 flex items-center justify-center group-hover:scale-105 transition-transform">
                                    <Coins className="w-5 h-5 text-amber-500" />
                                </div>
                                <h3 className="text-base font-medium text-slate-900 dark:text-gray-100">Token Usage</h3>
                            </div>
                            <div className="mt-auto space-y-2">
                                <div className="flex justify-between items-end">
                                    <span className="text-2xl font-bold text-slate-900 dark:text-white">{stats.total_tokens.toLocaleString()}</span>
                                    <span className="text-xs text-slate-500 mb-1">Total</span>
                                </div>
                                <div className="flex justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-200 dark:border-slate-700">
                                    <span>Prompt: {stats.prompt_tokens.toLocaleString()}</span>
                                    <span>Completion: {stats.completion_tokens.toLocaleString()}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="bg-white/80 dark:bg-slate-900/50 backdrop-blur-xl border border-slate-200/60 dark:border-slate-700/50 shadow-sm sm:rounded-2xl p-5 sm:p-6">
                        <h3 className="text-base font-medium text-slate-900 dark:text-white mb-4">Quick Actions</h3>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Link
                                href={route('dashboard.knowledge')}
                                className="group relative flex items-center p-3 sm:p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800 hover:shadow-md hover:border-[#F29191]/30 dark:hover:border-[#F29191]/30 transition-all duration-300"
                            >
                                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#F29191]/20 to-orange-400/10 flex items-center justify-center mr-4 group-hover:scale-110 transition-transform">
                                    <Database className="w-5 h-5 text-[#F29191]" />
                                </div>
                                <div className="flex-1">
                                    <h4 className="text-sm font-medium text-slate-900 dark:text-white group-hover:text-[#F29191] transition-colors">Manage Knowledge Base</h4>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Upload or manage your project documents</p>
                                </div>
                                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-[#F29191] transform group-hover:translate-x-1 transition-all" />
                            </Link>

                            <Link
                                href={route('dashboard.playground')}
                                className="group relative flex items-center p-3 sm:p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800 hover:shadow-md hover:border-rose-400/30 dark:hover:border-rose-400/30 transition-all duration-300"
                            >
                                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-rose-500/20 to-pink-400/10 flex items-center justify-center mr-4 group-hover:scale-110 transition-transform">
                                    <MessageSquare className="w-5 h-5 text-rose-500" />
                                </div>
                                <div className="flex-1">
                                    <h4 className="text-sm font-medium text-slate-900 dark:text-white group-hover:text-rose-500 transition-colors">Go to AI Playground</h4>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Test and interact with your AI assistant</p>
                                </div>
                                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-rose-500 transform group-hover:translate-x-1 transition-all" />
                            </Link>
                        </div>
                    </div>

                </div>
            </div>
        </AuthenticatedLayout>
    );
}
