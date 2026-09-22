import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import { useForm, usePage } from '@inertiajs/react';
import { Transition } from '@headlessui/react';
import { Bot } from 'lucide-react';

export default function UpdateAiPersonaForm({ className = '' }) {
    const { current_project } = usePage().props.auth;

    const { data, setData, put, errors, processing, recentlySuccessful } = useForm({
        system_prompt: current_project?.system_prompt || '',
    });

    const submit = (e) => {
        e.preventDefault();
        put(route('dashboard.settings.update_persona'), {
            preserveScroll: true,
        });
    };

    return (
        <section className={className}>
            <header>
                <div className="flex items-center space-x-3 mb-2">
                    <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center">
                        <Bot className="w-5 h-5 text-indigo-500" />
                    </div>
                    <div>
                        <h2 className="text-lg font-medium text-slate-900 dark:text-gray-100">
                            AI Persona
                        </h2>
                        <p className="mt-1 text-sm text-slate-600 dark:text-gray-400">
                            Customize the behavior, tone, and personality of your AI assistant for this workspace.
                        </p>
                    </div>
                </div>
            </header>

            <form onSubmit={submit} className="mt-6 space-y-6">
                <div>
                    <InputLabel htmlFor="system_prompt" value="System Prompt (Instructions)" className="mb-2" />
                    
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                        These instructions will override the default behavior of Lodexi when answering questions in the Playground or Integrations. You can define rules, response formats, or persona (e.g., "Answer like a professional lawyer").
                    </p>

                    <textarea
                        id="system_prompt"
                        className="w-full rounded-xl border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-sm focus:border-[#F29191] focus:ring-[#F29191] min-h-[150px] text-sm"
                        value={data.system_prompt}
                        onChange={(e) => setData('system_prompt', e.target.value)}
                        placeholder="e.g. You are a helpful assistant. Always respond in markdown format and use a friendly tone."
                    />

                    <InputError className="mt-2" message={errors.system_prompt} />
                </div>

                <div className="flex items-center gap-4">
                    <PrimaryButton disabled={processing}>Save Persona</PrimaryButton>

                    <Transition
                        show={recentlySuccessful}
                        enter="transition ease-in-out"
                        enterFrom="opacity-0"
                        leave="transition ease-in-out"
                        leaveTo="opacity-0"
                    >
                        <p className="text-sm text-green-600 dark:text-green-400">Saved.</p>
                    </Transition>
                </div>
            </form>
        </section>
    );
}
