import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import UpdateLlmSettingsForm from '../Profile/Partials/UpdateLlmSettingsForm';
import UpdateAiPersonaForm from '../Profile/Partials/UpdateAiPersonaForm';
import { Bot, Settings2 } from 'lucide-react';

export default function AiSettings({ project }) {
    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
                    <div>
                        <h2 className="text-2xl font-bold leading-tight text-gray-900 dark:text-white flex items-center">
                            <Settings2 className="w-6 h-6 mr-3 text-[#F29191]" />
                            Project AI Settings
                        </h2>
                        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                            Configure AI behavior and LLM provider settings for <strong>{project?.name}</strong>.
                        </p>
                    </div>
                </div>
            }
        >
            <Head title="AI Settings" />

            <div className="py-8">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8 space-y-8">
                    
                    {/* AI Persona */}
                    <div className="bg-white/80 dark:bg-slate-900/50 backdrop-blur-xl border border-slate-200/60 dark:border-slate-700/50 shadow-sm sm:rounded-2xl p-6 sm:p-8 transition-all hover:shadow-md">
                        <UpdateAiPersonaForm className="max-w-2xl" />
                    </div>

                    {/* LLM Configuration Placeholder */}
                    <div className="bg-white/80 dark:bg-slate-900/50 backdrop-blur-xl border border-slate-200/60 dark:border-slate-700/50 shadow-sm sm:rounded-2xl p-6 sm:p-8 transition-all hover:shadow-md">
                        <UpdateLlmSettingsForm className="max-w-xl" />
                    </div>

                </div>
            </div>
        </AuthenticatedLayout>
    );
}
