import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Link, usePage } from '@inertiajs/react';
import { Cpu, Wrench, Database, Zap, BrainCircuit, Blocks, Webhook } from 'lucide-react';

export default function SettingsLayout({ children, header }) {
    const { url } = usePage();
    const currentPath = url.split('?')[0];

    const menuItems = [
        {
            name: 'Model Provider',
            href: route('dashboard.settings.model'),
            icon: Cpu,
            active: currentPath.startsWith('/dashboard/settings/model'),
            comingSoon: false
        },
        {
            name: 'Data Source',
            href: route('dashboard.knowledge'), // Points directly to KB
            icon: Database,
            active: false,
            comingSoon: false
        },
        {
            name: 'Tools',
            href: '#',
            icon: Wrench,
            active: false,
            comingSoon: true
        },
        {
            name: 'Trigger',
            href: route('dashboard.settings.trigger'),
            icon: Zap,
            active: currentPath.startsWith('/dashboard/settings/trigger'),
            comingSoon: false
        },
        {
            name: 'Agent Strategy',
            href: route('dashboard.settings.strategy'),
            icon: BrainCircuit,
            active: currentPath.startsWith('/dashboard/settings/strategy'),
            comingSoon: false
        },
        {
            name: 'Extension',
            href: '#',
            icon: Blocks,
            active: false,
            comingSoon: true
        },
        {
            name: 'Custom Endpoint',
            href: '#',
            icon: Webhook,
            active: false,
            comingSoon: true
        },
    ];

    return (
        <AuthenticatedLayout header={header}>
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-8 py-4">
                
                {/* Level 2 Sidebar */}
                <div className="w-full md:w-64 shrink-0">
                    <nav className="flex flex-col space-y-1">
                        {menuItems.map((item, index) => (
                            item.comingSoon ? (
                                <div 
                                    key={index}
                                    className="flex items-center justify-between px-4 py-3 rounded-xl text-gray-400 dark:text-gray-500 cursor-not-allowed select-none"
                                >
                                    <div className="flex items-center">
                                        <item.icon className="w-5 h-5 mr-3" />
                                        <span className="font-medium text-sm">{item.name}</span>
                                    </div>
                                    <span className="text-[10px] font-bold tracking-wider uppercase bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-gray-400 px-2 py-0.5 rounded-md">
                                        Soon
                                    </span>
                                </div>
                            ) : (
                                <Link
                                    key={index}
                                    href={item.href}
                                    className={`flex items-center px-4 py-3 rounded-xl transition-all font-medium text-sm ${
                                        item.active 
                                        ? 'bg-blue-600/10 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 font-semibold' 
                                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800'
                                    }`}
                                >
                                    <item.icon className={`w-5 h-5 mr-3 ${item.active ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'}`} />
                                    {item.name}
                                </Link>
                            )
                        ))}
                    </nav>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 min-w-0">
                    {children}
                </div>

            </div>
        </AuthenticatedLayout>
    );
}
