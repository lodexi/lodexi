import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Transition } from '@headlessui/react';
import { useForm, usePage } from '@inertiajs/react';

export default function UpdateLlmSettingsForm({ className = '' }) {
    const { current_project } = usePage().props.auth;

    const { data, setData, patch, errors, processing, recentlySuccessful } =
        useForm({
            llm_api_key: current_project?.llm_api_key || '',
            llm_provider: current_project?.llm_provider || 'gemini',
        });

    const submit = (e) => {
        e.preventDefault();

        patch(route('dashboard.ai-settings.update_llm'));
    };

    return (
        <section className={className}>
            <header>
                <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                    AI API Settings (Bring Your Own Key)
                </h2>

                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    Konfigurasi API Key LLM Anda sendiri. Jika dikosongkan, sistem akan menggunakan API Key bawaan secara acak.
                </p>
            </header>

            <form onSubmit={submit} className="mt-6 space-y-6">
                <div>
                    <InputLabel htmlFor="llm_provider" value="AI Provider" />

                    <select
                        id="llm_provider"
                        value={data.llm_provider}
                        onChange={(e) => setData('llm_provider', e.target.value)}
                        className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:focus:border-indigo-600 dark:focus:ring-indigo-600"
                    >
                        <option value="gemini">Google Gemini</option>
                        <option value="openai">OpenAI</option>
                    </select>

                    <InputError className="mt-2" message={errors.llm_provider} />
                </div>

                <div>
                    <InputLabel htmlFor="llm_api_key" value="API Key" />

                    <TextInput
                        id="llm_api_key"
                        type="password"
                        className="mt-1 block w-full"
                        value={data.llm_api_key}
                        onChange={(e) => setData('llm_api_key', e.target.value)}
                        placeholder="sk-..."
                    />

                    <InputError className="mt-2" message={errors.llm_api_key} />
                </div>

                <div className="flex items-center gap-4">
                    <PrimaryButton disabled={processing}>Save API Settings</PrimaryButton>

                    <Transition
                        show={recentlySuccessful}
                        enter="transition ease-in-out"
                        enterFrom="opacity-0"
                        leave="transition ease-in-out"
                        leaveTo="opacity-0"
                    >
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Saved.
                        </p>
                    </Transition>
                </div>
            </form>
        </section>
    );
}
