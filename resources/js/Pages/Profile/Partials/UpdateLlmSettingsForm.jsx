import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Transition } from '@headlessui/react';
import { useForm, usePage } from '@inertiajs/react';
import { CheckCircle2 } from 'lucide-react';

export default function UpdateLlmSettingsForm({ className = '' }) {
    const { current_project } = usePage().props.auth;

    const { data, setData, put, errors, processing, recentlySuccessful } =
        useForm({
            llm_api_key: current_project?.llm_api_key || '',
            llm_provider: current_project?.llm_provider || 'gemini',
        });

    const submit = (e) => {
        e.preventDefault();

        put(route('dashboard.settings.update_llm'));
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

            <form onSubmit={submit} className="mt-6 space-y-8">
                <div>
                    <InputLabel value="Select AI Provider" className="mb-4 text-base font-semibold text-gray-800 dark:text-gray-200" />
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {[
                            { id: 'gemini', name: 'Google Gemini', desc: 'Fast, multimodal reasoning', iconSrc: '/images/logos/gemini.webp', color: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500' },
                            { id: 'openai', name: 'OpenAI', desc: 'Powerful GPT models', iconSrc: '/images/logos/openai.webp', color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500' },
                            { id: 'anthropic', name: 'Anthropic', desc: 'Advanced Claude models', iconSrc: '/images/logos/anthropic.webp', color: 'text-orange-900 dark:text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500' }
                        ].map((provider) => (
                            <div 
                                key={provider.id}
                                onClick={() => setData('llm_provider', provider.id)}
                                className={`relative cursor-pointer rounded-2xl border-2 p-5 transition-all duration-200 ${
                                    data.llm_provider === provider.id 
                                    ? `${provider.border} bg-white dark:bg-slate-800 shadow-md ring-4 ring-opacity-20 ring-${provider.color.split('-')[1]}-500` 
                                    : 'border-gray-200 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-900/50 hover:border-gray-300 dark:hover:border-slate-600'
                                }`}
                            >
                                {data.llm_provider === provider.id && (
                                    <div className="absolute top-3 right-3">
                                        <CheckCircle2 className={`w-5 h-5 ${provider.color}`} />
                                    </div>
                                )}
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 ${provider.bg}`}>
                                    <img src={provider.iconSrc} alt={`${provider.name} logo`} className="w-8 h-8 object-contain" onError={(e) => { e.target.onerror = null; e.target.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJjdXJyZW50Q29sb3IiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48Y2lyY2xlIGN4PSIxMiIgY3k9IjEyIiByPSIxMCIvPjxsaW5lIHgxPSIxMiIgeTE9IjgiIHgyPSIxMiIgeTI9IjEyIi8+PGxpbmUgeDE9IjEyIiB5MT0iMTYiIHgyPSIxMi4wMSIgeTI9IjE2Ii8+PC9zdmc+' }} />
                                </div>
                                <h3 className="font-bold text-gray-900 dark:text-white mb-1">{provider.name}</h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400 leading-tight">{provider.desc}</p>
                            </div>
                        ))}
                    </div>
                    <InputError className="mt-2" message={errors.llm_provider} />
                </div>

                <div className="bg-gray-50 dark:bg-slate-900/50 p-5 rounded-2xl border border-gray-200 dark:border-slate-800">
                    <InputLabel htmlFor="llm_api_key" value="Secret API Key" className="font-semibold mb-2" />
                    
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                        Enter your private API key from the selected provider. This key is encrypted and stored securely.
                    </p>

                    <TextInput
                        id="llm_api_key"
                        type="password"
                        className="block w-full"
                        value={data.llm_api_key}
                        onChange={(e) => setData('llm_api_key', e.target.value)}
                        placeholder={
                            data.llm_provider === 'gemini' ? 'AIzaSy...' :
                            data.llm_provider === 'openai' ? 'sk-proj-...' :
                            'sk-ant-...'
                        }
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
