import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { Key, Copy, PlusCircle, CheckCircle2, Shield, Clock, AlertCircle, Webhook, BrainCircuit, MessageSquareText, Trash2, X, MessageSquare, Blocks } from 'lucide-react';
import ApiQuickStart from './Partials/ApiQuickStart';
import Modal from '@/Components/Modal';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';

export default function Integrations({ analytics, tokens, new_token, active_tab }) {
    const { current_project } = usePage().props.auth;
    const [activeTab, setActiveTab] = useState(active_tab || 'api-keys');
    const [copiedKey, setCopiedKey] = useState(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [showNewTokenModal, setShowNewTokenModal] = useState(false);
    const [keyToDelete, setKeyToDelete] = useState(null);
    const [webhookCopied, setWebhookCopied] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
    });

    // Provide the full URL for the webhook
    const appUrl = window.location.origin;
    const webhookUrl = `${appUrl}/api/webhooks/google-chat/${current_project?.id || ''}`;

    const copyWebhookToClipboard = () => {
        navigator.clipboard.writeText(webhookUrl);
        setWebhookCopied(true);
        setTimeout(() => setWebhookCopied(false), 2000);
    };

    useEffect(() => {
        if (new_token) {
            setShowNewTokenModal(true);
            setActiveTab('api-keys'); // Ensure we're on the right tab when a token is created
        }
    }, [new_token]);

    const handleTabChange = (tab) => {
        setActiveTab(tab);
        router.get(route('dashboard.integrations'), { tab }, { preserveState: true, preserveScroll: true, replace: true });
    };

    const handleCopy = (id, keyString) => {
        navigator.clipboard.writeText(keyString);
        setCopiedKey(id);
        setTimeout(() => setCopiedKey(null), 2000);
    };

    const createKey = (e) => {
        e.preventDefault();
        post(route('dashboard.apikeys.store'), {
            preserveScroll: true,
            onSuccess: () => {
                setIsCreateModalOpen(false);
                reset();
            },
        });
    };

    const confirmDelete = (id) => {
        setKeyToDelete(id);
    };

    const deleteKey = () => {
        if (!keyToDelete) return;
        router.delete(route('dashboard.apikeys.destroy', keyToDelete), {
            preserveScroll: true,
            onSuccess: () => setKeyToDelete(null),
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
                    <div>
                        <h2 className="text-2xl font-bold leading-tight text-gray-900 dark:text-white flex items-center">
                            <Blocks className="w-6 h-6 mr-3 text-[#F29191]" />
                            Integrations Hub
                        </h2>
                        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                            Manage API Keys, Webhooks, and external bots connected to your workspace.
                        </p>
                    </div>
                    {activeTab === 'api-keys' && (
                        <button 
                            onClick={() => setIsCreateModalOpen(true)}
                            className="flex items-center px-5 py-2.5 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-gray-100 text-white dark:text-slate-900 rounded-xl transition-all font-semibold shadow-sm text-sm"
                        >
                            <PlusCircle className="w-4 h-4 mr-2" />
                            Create new secret key
                        </button>
                    )}
                </div>
            }
        >
            <Head title="Integrations" />

            <div className="py-8">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    
                    {/* Tabs Navigation */}
                    <div className="border-b border-gray-200 dark:border-slate-700 mb-8">
                        <nav className="-mb-px flex space-x-8">
                            <button
                                onClick={() => handleTabChange('api-keys')}
                                className={`${
                                    activeTab === 'api-keys'
                                        ? 'border-[#F29191] text-[#F29191]'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                                } whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm flex items-center transition-colors`}
                            >
                                <Key className="w-4 h-4 mr-2" />
                                API Keys
                            </button>
                            <button
                                onClick={() => handleTabChange('webhooks')}
                                className={`${
                                    activeTab === 'webhooks'
                                        ? 'border-[#F29191] text-[#F29191]'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                                } whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm flex items-center transition-colors`}
                            >
                                <Webhook className="w-4 h-4 mr-2" />
                                Webhooks & Bots
                            </button>
                        </nav>
                    </div>

                    {/* API Keys Tab Content */}
                    {activeTab === 'api-keys' && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                            {/* Security Warning Alert */}
                            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700/50 rounded-2xl p-4 flex items-start space-x-3">
                                <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-500 flex-shrink-0 mt-0.5" />
                                <div>
                                    <h4 className="text-sm font-semibold text-yellow-800 dark:text-yellow-400">Keep your keys secure</h4>
                                    <p className="text-sm text-yellow-700 dark:text-yellow-500/80 mt-1">
                                        Do not share your API keys in publicly accessible areas such as GitHub, client-side code, and so forth.
                                        We will automatically disable keys that we find have been leaked.
                                    </p>
                                </div>
                            </div>

                            {/* Analytics Dashboard Widgets */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {/* Total Requests */}
                                <div className="bg-white/80 dark:bg-slate-900/50 backdrop-blur-xl border border-slate-200/60 dark:border-slate-700/50 shadow-sm sm:rounded-2xl p-5 flex flex-col hover:shadow-md hover:border-[#F29191]/30 transition-all duration-300 group">
                                    <div className="flex items-center space-x-3 mb-4">
                                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500/20 to-blue-400/10 flex items-center justify-center group-hover:scale-105 transition-transform">
                                            <Webhook className="w-5 h-5 text-indigo-500" />
                                        </div>
                                        <h3 className="text-base font-medium text-slate-900 dark:text-gray-100">Total API Requests</h3>
                                    </div>
                                    <div className="mt-auto">
                                        <p className="text-3xl font-bold text-slate-900 dark:text-white">{analytics?.total_requests || 0}</p>
                                    </div>
                                </div>

                                {/* Prompt Tokens */}
                                <div className="bg-white/80 dark:bg-slate-900/50 backdrop-blur-xl border border-slate-200/60 dark:border-slate-700/50 shadow-sm sm:rounded-2xl p-5 flex flex-col hover:shadow-md hover:border-[#F29191]/30 transition-all duration-300 group">
                                    <div className="flex items-center space-x-3 mb-4">
                                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#F29191]/20 to-orange-400/10 flex items-center justify-center group-hover:scale-105 transition-transform">
                                            <MessageSquareText className="w-5 h-5 text-[#F29191]" />
                                        </div>
                                        <h3 className="text-base font-medium text-slate-900 dark:text-gray-100">Prompt Tokens</h3>
                                    </div>
                                    <div className="mt-auto">
                                        <p className="text-3xl font-bold text-slate-900 dark:text-white">{analytics?.prompt_tokens?.toLocaleString() || 0}</p>
                                    </div>
                                </div>

                                {/* Completion Tokens */}
                                <div className="bg-white/80 dark:bg-slate-900/50 backdrop-blur-xl border border-slate-200/60 dark:border-slate-700/50 shadow-sm sm:rounded-2xl p-5 flex flex-col hover:shadow-md hover:border-[#F29191]/30 transition-all duration-300 group">
                                    <div className="flex items-center space-x-3 mb-4">
                                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500/20 to-pink-400/10 flex items-center justify-center group-hover:scale-105 transition-transform">
                                            <BrainCircuit className="w-5 h-5 text-rose-500" />
                                        </div>
                                        <h3 className="text-base font-medium text-slate-900 dark:text-gray-100">Completion Tokens</h3>
                                    </div>
                                    <div className="mt-auto">
                                        <p className="text-3xl font-bold text-slate-900 dark:text-white">{analytics?.completion_tokens?.toLocaleString() || 0}</p>
                                    </div>
                                </div>
                            </div>

                            {/* API Keys Table */}
                            <div className="overflow-hidden bg-white shadow-sm sm:rounded-2xl dark:bg-slate-900 border border-gray-200 dark:border-slate-800">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400">
                                        <thead className="bg-gray-50/50 dark:bg-slate-800/50 text-xs uppercase text-gray-500 dark:text-gray-400 font-semibold tracking-wider">
                                            <tr>
                                                <th className="px-4 py-3">Name</th>
                                                <th className="px-4 py-3">Secret Key Prefix</th>
                                                <th className="px-4 py-3">Created</th>
                                                <th className="px-4 py-3">Last Used</th>
                                                <th className="px-4 py-3 text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                                            {tokens && tokens.length > 0 ? tokens.map((item) => (
                                                <tr key={item.id} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/30 transition-colors group">
                                                    <td className="px-4 py-3.5">
                                                        <div className="font-medium text-gray-900 dark:text-white flex items-center">
                                                            {item.name}
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3.5">
                                                        <div className="flex items-center space-x-2">
                                                            <code className="bg-gray-100 dark:bg-slate-800 px-2.5 py-1 rounded-md text-slate-800 dark:text-gray-300 font-mono text-xs border border-gray-200 dark:border-slate-700">
                                                                [Hidden]
                                                            </code>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3.5 text-gray-500 dark:text-gray-400">
                                                        {item.created_at}
                                                    </td>
                                                    <td className="px-4 py-3.5">
                                                        <div className="flex items-center text-gray-500 dark:text-gray-400">
                                                            {item.last_used_at !== "Never" && <Clock className="w-3.5 h-3.5 mr-1.5 opacity-70" />}
                                                            {item.last_used_at}
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3.5 text-right">
                                                        <button 
                                                            onClick={() => confirmDelete(item.id)}
                                                            className="text-gray-400 hover:text-red-500 transition-colors focus:outline-none p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20"
                                                            title="Revoke Key"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </td>
                                                </tr>
                                            )) : (
                                                <tr>
                                                    <td colSpan="5" className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                                                        No API keys found. Create one to get started.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>


                            {/* Developer Quick Start */}
                            <div className="bg-white/40 dark:bg-slate-900/50 backdrop-blur-xl p-4 shadow-sm sm:rounded-2xl sm:p-8 border border-gray-200/50 dark:border-slate-800">
                                <ApiQuickStart />
                            </div>
                        </div>
                    )}

                    {/* Webhooks Tab Content */}
                    {activeTab === 'webhooks' && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <div className="bg-white/40 dark:bg-slate-900/50 backdrop-blur-xl overflow-hidden shadow-sm sm:rounded-2xl border border-gray-200/50 dark:border-slate-800 p-8">
                                <div className="mb-8">
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Connect to your Workspace</h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        Extend the power of Lodexi to your team's chat platform.
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                    )}
                </div>
            </div>

            {/* Modals for API Keys */}
            {/* Create Key Modal */}
            <Modal show={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)}>
                <form onSubmit={createKey} className="p-6">
                    <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                        Create new secret key
                    </h2>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                        Give your key a descriptive name to remember what it's used for.
                    </p>

                    <div className="mt-6">
                        <InputLabel htmlFor="name" value="Key Name" />
                        <TextInput
                            id="name"
                            className="mt-1 block w-full"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            placeholder="e.g. My AppScript Bot"
                            required
                            isFocused
                        />
                        <InputError message={errors.name} className="mt-2" />
                    </div>

                    <div className="mt-6 flex justify-end">
                        <SecondaryButton onClick={() => setIsCreateModalOpen(false)}>Cancel</SecondaryButton>
                        <PrimaryButton className="ms-3 bg-[#F29191] hover:bg-[#e06b6b] text-white" disabled={processing}>
                            Create secret key
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>

            {/* Display New Key Modal */}
            <Modal show={showNewTokenModal} onClose={() => setShowNewTokenModal(false)}>
                <div className="p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100 flex items-center">
                            <CheckCircle2 className="w-5 h-5 mr-2 text-green-500" />
                            Save your secret key
                        </h2>
                        <button onClick={() => setShowNewTokenModal(false)} className="text-gray-400 hover:text-gray-500">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                    
                    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
                        <p className="text-sm text-yellow-700">
                            Please save this secret key somewhere safe and accessible. For security reasons, <strong>you won't be able to view it again</strong> through your Lodexi account. If you lose this secret key, you'll need to generate a new one.
                        </p>
                    </div>

                    <div className="flex items-center space-x-2 mt-4">
                        <code className="flex-1 bg-gray-100 dark:bg-slate-800 p-3 rounded-lg text-slate-800 dark:text-gray-200 font-mono text-sm border border-gray-200 dark:border-slate-700 break-all">
                            {new_token}
                        </code>
                        <button
                            onClick={() => handleCopy('new_token', new_token)}
                            className="p-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg hover:opacity-90 transition-opacity flex-shrink-0"
                            title="Copy Key"
                        >
                            {copiedKey === 'new_token' ? <CheckCircle2 className="w-5 h-5 text-green-400" /> : <Copy className="w-5 h-5" />}
                        </button>
                    </div>

                    <div className="mt-6 flex justify-end">
                        <PrimaryButton onClick={() => setShowNewTokenModal(false)}>
                            I saved my secret key
                        </PrimaryButton>
                    </div>
                </div>
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal show={keyToDelete !== null} onClose={() => setKeyToDelete(null)}>
                <div className="p-6">
                    <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                        Revoke API Key
                    </h2>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                        Are you sure you want to revoke this API key? Any applications using this key will immediately lose access. This action cannot be undone.
                    </p>
                    <div className="mt-6 flex justify-end">
                        <SecondaryButton onClick={() => setKeyToDelete(null)}>Cancel</SecondaryButton>
                        <PrimaryButton onClick={deleteKey} className="ms-3 bg-red-600 hover:bg-red-500 text-white">
                            Revoke Key
                        </PrimaryButton>
                    </div>
                </div>
            </Modal>

        </AuthenticatedLayout>
    );
}
