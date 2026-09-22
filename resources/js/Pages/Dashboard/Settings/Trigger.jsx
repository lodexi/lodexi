import React, { useState } from 'react';
import SettingsLayout from '@/Layouts/SettingsLayout';
import { Head, usePage } from '@inertiajs/react';
import { CheckCircle2, Copy, MessageSquare } from 'lucide-react';

export default function Trigger() {
    const { current_project } = usePage().props.auth;
    const [webhookCopied, setWebhookCopied] = useState(false);

    // Provide the full URL for the webhook
    const appUrl = window.location.origin;
    const webhookUrl = `${appUrl}/api/webhooks/google-chat/${current_project?.id || ''}`;

    const copyWebhookToClipboard = () => {
        navigator.clipboard.writeText(webhookUrl);
        setWebhookCopied(true);
        setTimeout(() => setWebhookCopied(false), 2000);
    };

    return (
        <SettingsLayout
            header={
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
                    <div>
                        <h2 className="text-2xl font-bold leading-tight text-gray-900 dark:text-white">
                            Trigger
                        </h2>
                        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                            Set up webhooks to connect your workspace to third-party platforms.
                        </p>
                    </div>
                </div>
            }
        >
            <Head title="Trigger - Settings" />

            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300 pb-12">
                <div className="bg-white/40 dark:bg-slate-900/50 backdrop-blur-xl overflow-hidden shadow-sm sm:rounded-2xl border border-gray-200/50 dark:border-slate-800 p-8">
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Google Chat Card */}
                        <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-green-500/10 rounded-bl-full -z-10 transition-transform group-hover:scale-110"></div>
                            
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center space-x-3">
                                    <div className="w-12 h-12 rounded-lg bg-green-50 dark:bg-green-900/20 flex items-center justify-center">
                                        <MessageSquare className="w-6 h-6 text-green-500" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-900 dark:text-white">Google Chat</h4>
                                        <span className="text-xs font-semibold text-green-500 bg-green-50 dark:bg-green-500/10 px-2 py-1 rounded-md">Webhook</span>
                                    </div>
                                </div>
                            </div>
                            
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 h-10">
                                Receive answers from LODEXI directly within your Google Chat spaces.
                            </p>

                            <div className="space-y-3">
                                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                    Webhook Endpoint
                                </label>
                                <div className="flex rounded-lg overflow-hidden border border-gray-300 dark:border-slate-600 focus-within:ring-2 focus-within:ring-[#F29191] focus-within:border-transparent transition-all">
                                    <input 
                                        type="text" 
                                        readOnly 
                                        value={webhookUrl}
                                        className="w-full text-xs font-mono bg-gray-50 dark:bg-slate-900 border-none px-3 py-2 text-gray-600 dark:text-gray-400 focus:ring-0"
                                    />
                                    <button 
                                        onClick={copyWebhookToClipboard}
                                        className="px-3 bg-white dark:bg-slate-800 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 border-l border-gray-300 dark:border-slate-600 transition-colors flex items-center justify-center"
                                        title="Copy to clipboard"
                                    >
                                        {webhookCopied ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                                    </button>
                                </div>
                                <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                                    Configure this URL as the endpoint for your Google Chat Bot API.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </SettingsLayout>
    );
}
