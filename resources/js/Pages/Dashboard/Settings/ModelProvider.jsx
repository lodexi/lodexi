import React, { useState, useEffect } from 'react';
import SettingsLayout from '@/Layouts/SettingsLayout';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { Key, Copy, PlusCircle, CheckCircle2, Shield, Clock, AlertCircle, Trash2, X } from 'lucide-react';
import ApiQuickStart from '../Partials/ApiQuickStart';
import Modal from '@/Components/Modal';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import UpdateLlmSettingsForm from '../../Profile/Partials/UpdateLlmSettingsForm';

export default function ModelProvider({ analytics }) {

    return (
        <SettingsLayout
            header={
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
                    <div>
                        <h2 className="text-2xl font-bold leading-tight text-gray-900 dark:text-white">
                            Model Provider
                        </h2>
                        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                            Configure your Bring-Your-Own-Key (BYOK) AI provider settings for this project.
                        </p>
                    </div>
                </div>
            }
        >
            <Head title="Model Provider - Settings" />

            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300 pb-12">
                
                {/* LLM Configuration Placeholder */}
                <div className="bg-white/80 dark:bg-slate-900/50 backdrop-blur-xl border border-slate-200/60 dark:border-slate-700/50 shadow-sm sm:rounded-2xl p-6 sm:p-8 transition-all hover:shadow-md">
                    <UpdateLlmSettingsForm className="max-w-xl" />
                </div>

            </div>
        </SettingsLayout>
    );
}
