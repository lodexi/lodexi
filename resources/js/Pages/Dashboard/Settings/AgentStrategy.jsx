import React from 'react';
import SettingsLayout from '@/Layouts/SettingsLayout';
import { Head } from '@inertiajs/react';
import UpdateAiPersonaForm from '../../Profile/Partials/UpdateAiPersonaForm';

export default function AgentStrategy() {
    return (
        <SettingsLayout
            header={
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
                    <div>
                        <h2 className="text-2xl font-bold leading-tight text-gray-900 dark:text-white">
                            Agent Strategy
                        </h2>
                        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                            Configure the AI Persona and behavior strategy for your workspace.
                        </p>
                    </div>
                </div>
            }
        >
            <Head title="Agent Strategy - Settings" />

            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300 pb-12">
                
                {/* AI Persona Form */}
                <div className="bg-white/80 dark:bg-slate-900/50 backdrop-blur-xl border border-slate-200/60 dark:border-slate-700/50 shadow-sm sm:rounded-2xl p-6 sm:p-8 transition-all hover:shadow-md">
                    <UpdateAiPersonaForm className="max-w-2xl" />
                </div>

            </div>
        </SettingsLayout>
    );
}
