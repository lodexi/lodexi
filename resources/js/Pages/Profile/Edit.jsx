import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import DeleteUserForm from './Partials/DeleteUserForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';
import { useState, useEffect } from 'react';

export default function Edit({ mustVerifyEmail, status }) {
    const [activeTab, setActiveTab] = useState('profile');

    useEffect(() => {
        const handleScroll = () => {
            const sections = ['profile', 'password', 'llm', 'persona', 'danger'];
            const scrollPosition = window.scrollY + 200; // Offset for header

            for (const section of sections) {
                const element = document.getElementById(section);
                if (element && element.offsetTop <= scrollPosition && (element.offsetTop + element.offsetHeight) > scrollPosition) {
                    setActiveTab(section);
                }
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToSection = (id) => {
        const element = document.getElementById(id);
        if (element) {
            window.scrollTo({
                top: element.offsetTop - 100, // Offset for sticky header
                behavior: 'smooth'
            });
            setActiveTab(id);
        }
    };

    const NavLink = ({ id, title, isDanger = false }) => {
        const isActive = activeTab === id;
        
        if (isDanger) {
            return (
                <button 
                    onClick={() => scrollToSection(id)} 
                    className={`w-full text-left block px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-300 ${
                        isActive 
                        ? 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300' 
                        : 'text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20'
                    }`}
                >
                    {title}
                </button>
            );
        }

        return (
            <button 
                onClick={() => scrollToSection(id)} 
                className={`w-full text-left block px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-300 ${
                    isActive 
                    ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white drop-shadow-sm' 
                    : 'text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white'
                }`}
            >
                {title}
            </button>
        );
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-slate-900 dark:text-gray-100">
                    Account Settings
                </h2>
            }
        >
            <Head title="Account Settings" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row gap-8 lg:gap-12">
                        {/* Sidebar Navigation */}
                        <div className="w-full md:w-64 shrink-0">
                            <div className="sticky top-24 space-y-1">
                                <h3 className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-3 mb-4">Settings Menu</h3>
                                <nav className="space-y-1.5">
                                    <NavLink id="profile" title="Profile Information" />
                                    <NavLink id="password" title="Update Password" />
                                    <NavLink id="llm" title="LLM Configuration" />
                                    <NavLink id="persona" title="AI Persona" />
                                    <div className="pt-4 mt-4 border-t border-slate-200 dark:border-slate-700">
                                        <NavLink id="danger" title="Danger Zone" isDanger={true} />
                                    </div>
                                </nav>
                            </div>
                        </div>

                        {/* Main Content Area */}
                        <div className="flex-1 space-y-10">
                            {/* Profile Information */}
                            <div id="profile" className="scroll-mt-24 bg-white/80 dark:bg-slate-900/50 backdrop-blur-xl border border-slate-200/60 dark:border-slate-700/50 shadow-sm sm:rounded-2xl p-6 sm:p-8 transition-all hover:shadow-md">
                                <UpdateProfileInformationForm
                                    mustVerifyEmail={mustVerifyEmail}
                                    status={status}
                                    className="max-w-xl"
                                />
                            </div>

                            {/* Password */}
                            <div id="password" className="scroll-mt-24 bg-white/80 dark:bg-slate-900/50 backdrop-blur-xl border border-slate-200/60 dark:border-slate-700/50 shadow-sm sm:rounded-2xl p-6 sm:p-8 transition-all hover:shadow-md">
                                <UpdatePasswordForm className="max-w-xl" />
                            </div>

                            {/* LLM Configuration Placeholder */}
                            <div id="llm" className="scroll-mt-24 bg-white/80 dark:bg-slate-900/50 backdrop-blur-xl border border-slate-200/60 dark:border-slate-700/50 shadow-sm sm:rounded-2xl p-6 sm:p-8 transition-all hover:shadow-md">
                                <section>
                                    <header>
                                        <h2 className="text-lg font-medium text-slate-900 dark:text-gray-100">LLM API Key (BYOK)</h2>
                                        <p className="mt-1 text-sm text-slate-600 dark:text-gray-400">Configure your custom Language Model API keys to use your own credits.</p>
                                    </header>
                                    <div className="mt-8 flex flex-col items-center justify-center h-40 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30">
                                        <svg className="w-8 h-8 text-slate-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                                        </svg>
                                        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Coming Soon</p>
                                    </div>
                                </section>
                            </div>

                            {/* AI Persona Placeholder */}
                            <div id="persona" className="scroll-mt-24 bg-white/80 dark:bg-slate-900/50 backdrop-blur-xl border border-slate-200/60 dark:border-slate-700/50 shadow-sm sm:rounded-2xl p-6 sm:p-8 transition-all hover:shadow-md">
                                <section>
                                    <header>
                                        <h2 className="text-lg font-medium text-slate-900 dark:text-gray-100">AI Persona</h2>
                                        <p className="mt-1 text-sm text-slate-600 dark:text-gray-400">Customize the behavior, tone, and personality of your AI assistant.</p>
                                    </header>
                                    <div className="mt-8 flex flex-col items-center justify-center h-40 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30">
                                        <svg className="w-8 h-8 text-slate-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Coming Soon</p>
                                    </div>
                                </section>
                            </div>

                            {/* Danger Zone */}
                            <div id="danger" className="scroll-mt-24 bg-red-50/50 dark:bg-red-950/20 backdrop-blur-xl border border-red-200 dark:border-red-900/50 shadow-sm sm:rounded-2xl p-6 sm:p-8 transition-all hover:shadow-md">
                                <DeleteUserForm className="max-w-xl" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
