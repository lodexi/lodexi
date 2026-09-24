import ApplicationLogo from '@/Components/ApplicationLogo';
import { Link, usePage, router, useForm } from '@inertiajs/react';
import { useState, useRef, useEffect } from 'react';
import { Database, Key, MessageSquare, User, LogOut, Menu, X, ChevronDown, Check, Plus, Folder, Blocks, Home, Settings2, ChevronLeft, ChevronRight } from 'lucide-react';

export default function AuthenticatedLayout({ header, children }) {
    const { user, current_project, projects } = usePage().props.auth;
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [projectDropdownOpen, setProjectDropdownOpen] = useState(false);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    
    // Determine if we are on a settings page and should collapse the sidebar on desktop
    const [isCollapsedState, setIsCollapsedState] = useState(route().current('dashboard.settings.*'));
    const isCollapsed = isCollapsedState;

    useEffect(() => {
        setIsCollapsedState(route().current('dashboard.settings.*'));
    }, [usePage().url]);
    
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
    });
    
    const dropdownRef = useRef(null);

    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setProjectDropdownOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [dropdownRef]);

    const switchProject = (projectId) => {
        router.post(route('projects.switch', projectId), {}, {
            preserveScroll: true,
            onSuccess: () => setProjectDropdownOpen(false)
        });
    };

    const submitCreateProject = (e) => {
        e.preventDefault();
        post(route('projects.store'), {
            preserveScroll: true,
            onSuccess: () => {
                setIsCreateModalOpen(false);
                setProjectDropdownOpen(false);
                reset('name');
            }
        });
    };

    const NavItem = ({ href, active, icon: Icon, children }) => (
        <Link
            href={href}
            title={isCollapsed ? children : undefined}
            className={`flex items-center px-4 py-3 mb-2 rounded-xl transition-all duration-300 ease-in-out font-medium ${
                active 
                ? 'bg-[#F29191] text-white shadow-md' 
                : 'text-gray-600 dark:text-gray-400 hover:bg-white/50 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-gray-200'
            } ${isCollapsed ? 'justify-center !px-2' : ''}`}
        >
            <Icon className={`w-5 h-5 shrink-0 transition-all duration-300 ease-in-out ${isCollapsed ? '' : 'mr-3'} ${active ? 'text-white' : 'text-[#F29191]'}`} />
            <span className={`whitespace-nowrap overflow-hidden transition-all duration-300 ease-in-out ${isCollapsed ? 'max-w-0 opacity-0' : 'max-w-[150px] opacity-100'}`}>
                {children}
            </span>
        </Link>
    );

    return (
        <div className="flex h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white via-slate-50 to-[#F29191]/5 dark:bg-none dark:bg-slate-950 transition-colors duration-300 overflow-hidden">
            
            {/* Mobile Sidebar Overlay */}
            {sidebarOpen && (
                <div 
                    className="fixed inset-0 z-40 bg-gray-900/50 backdrop-blur-sm lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                ></div>
            )}

            {/* Sidebar */}
            <aside className={`fixed inset-y-0 left-0 z-50 bg-white/40 dark:bg-slate-900/50 backdrop-blur-xl border-r border-gray-200/50 dark:border-slate-800 flex flex-col transform transition-all duration-300 ease-in-out lg:static lg:translate-x-0 ${
                sidebarOpen ? 'translate-x-0 w-72' : '-translate-x-full w-72'
            } ${isCollapsed ? 'lg:w-20' : 'lg:w-72'}`}>
                
                {/* Header / Logo */}
                <div className={`relative h-20 flex items-center border-b border-gray-200/50 dark:border-slate-800 shrink-0 transition-all duration-300 ease-in-out ${isCollapsed ? 'justify-center px-0' : 'px-8'}`}>
                    <Link href="/">
                        <ApplicationLogo collapsed={isCollapsed} className="h-10" />
                    </Link>

                    {/* Desktop Toggle Button */}
                    <button 
                        onClick={() => setIsCollapsedState(!isCollapsedState)}
                        className="hidden lg:flex absolute -right-3.5 top-6 w-7 h-7 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-full items-center justify-center text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:shadow-md transition-all z-50"
                    >
                        {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                    </button>
                </div>

                {/* Workspace Switcher */}
                <div className={`py-4 border-b border-gray-200/50 dark:border-slate-800 shrink-0 transition-all duration-300 ease-in-out ${isCollapsed ? 'px-2' : 'px-4'}`} ref={dropdownRef}>
                    <div className="relative">
                        <button 
                            onClick={() => setProjectDropdownOpen(!projectDropdownOpen)}
                            title={isCollapsed && current_project ? current_project.name : undefined}
                            className={`flex items-center bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg shadow-sm hover:border-gray-300 dark:hover:border-slate-600 transition-all duration-300 ease-in-out ${
                                isCollapsed ? 'w-full justify-center p-2' : 'w-full justify-between px-3 py-2'
                            }`}
                        >
                            <div className="flex items-center space-x-2 truncate">
                                <div className="w-6 h-6 rounded bg-gray-100 dark:bg-slate-700 flex items-center justify-center shrink-0">
                                    <Folder className="w-3.5 h-3.5 text-gray-600 dark:text-gray-300 shrink-0" />
                                </div>
                                <span className={`text-sm font-semibold text-gray-700 dark:text-gray-200 truncate transition-all duration-300 ease-in-out ${isCollapsed ? 'max-w-0 opacity-0' : 'max-w-[200px] opacity-100'}`}>
                                    {current_project ? current_project.name : 'Loading...'}
                                </span>
                            </div>
                            <ChevronDown className={`w-4 h-4 text-gray-500 shrink-0 transition-all duration-300 ease-in-out overflow-hidden ${isCollapsed ? 'max-w-0 opacity-0 ml-0' : 'max-w-[16px] opacity-100 ml-2'}`} />
                        </button>

                        {/* Dropdown Menu */}
                        {projectDropdownOpen && (
                            <div className={`absolute top-full mt-1 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg shadow-lg py-1 z-50 ${isCollapsed ? 'left-14 w-64' : 'left-0 right-0'}`}>
                                <div className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Your AI Projects
                                </div>
                                <div className="max-h-48 overflow-y-auto">
                                    {projects?.map((project) => (
                                        <button
                                            key={project.id}
                                            onClick={() => switchProject(project.id)}
                                            className="w-full flex items-center justify-between px-3 py-2 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                                        >
                                            <div className="flex items-center space-x-2 truncate">
                                                <div className="w-5 h-5 rounded bg-gray-100 dark:bg-slate-900 flex items-center justify-center shrink-0">
                                                    {project.name.charAt(0).toUpperCase()}
                                                </div>
                                                <span className={`text-sm truncate ${current_project?.id === project.id ? 'font-medium text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-300'}`}>
                                                    {project.name}
                                                </span>
                                            </div>
                                            {current_project?.id === project.id && (
                                                <Check className="w-4 h-4 text-[#F29191] shrink-0" />
                                            )}
                                        </button>
                                    ))}
                                </div>
                                <div className="p-2 border-t border-gray-200 dark:border-slate-700">
                                    <button
                                        onClick={() => {
                                            setIsCreateModalOpen(true);
                                            setProjectDropdownOpen(false);
                                        }}
                                        className="w-full flex items-center px-3 py-2 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-slate-700 rounded-md transition-colors"
                                    >
                                        <Plus className="w-4 h-4 mr-2" /> Create AI Project
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className={`flex-1 overflow-y-auto py-6 transition-all duration-300 ease-in-out ${isCollapsed ? 'px-2' : 'px-4'}`}>
                    <nav className="space-y-1">
                        <NavItem href={route('dashboard')} active={route().current('dashboard')} icon={Home}>
                            Home
                        </NavItem>
                        <NavItem href={route('dashboard.knowledge')} active={route().current('dashboard.knowledge')} icon={Database}>
                            Knowledge Base
                        </NavItem>
                        <NavItem href={route('dashboard.playground')} active={route().current('dashboard.playground')} icon={MessageSquare}>
                            AI Playground
                        </NavItem>
                        <NavItem href={route('dashboard.settings.model')} active={route().current('dashboard.settings.*')} icon={Settings2}>
                            Project Settings
                        </NavItem>
                    </nav>
                </div>

                <div className={`border-t border-gray-200/50 dark:border-slate-800 transition-all duration-300 ease-in-out ${isCollapsed ? 'p-2' : 'p-4'}`}>
                    <div className={`bg-white/50 dark:bg-slate-800/50 rounded-2xl transition-all duration-300 ease-in-out ${isCollapsed ? 'p-2 flex flex-col items-center space-y-2' : 'p-4'}`}>
                        <div className={`flex items-center transition-all duration-300 ease-in-out ${isCollapsed ? 'justify-center' : 'mb-4'}`}>
                            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#F29191] to-orange-300 flex items-center justify-center text-white font-bold text-lg shadow-sm shrink-0" title={user.name}>
                                {user.name.charAt(0)}
                            </div>
                            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isCollapsed ? 'max-w-0 opacity-0 ml-0' : 'max-w-[150px] opacity-100 ml-3'}`}>
                                <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{user.name}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
                            </div>
                        </div>
                        <div className={`transition-all duration-300 ease-in-out ${isCollapsed ? 'space-y-2 w-full' : 'space-y-1'}`}>
                            <Link href={route('profile.edit')} title={isCollapsed ? "Profile Settings" : undefined} className={`flex items-center w-full text-sm text-gray-600 dark:text-gray-400 hover:bg-white dark:hover:bg-slate-700 rounded-lg transition-all duration-300 ease-in-out ${isCollapsed ? 'justify-center p-2' : 'px-3 py-2'}`}>
                                <User className={`w-4 h-4 shrink-0 transition-all duration-300 ease-in-out ${isCollapsed ? '' : 'mr-2'}`} /> 
                                <span className={`whitespace-nowrap overflow-hidden transition-all duration-300 ease-in-out ${isCollapsed ? 'max-w-0 opacity-0' : 'max-w-[150px] opacity-100'}`}>
                                    Profile Settings
                                </span>
                            </Link>
                            <Link href={route('logout')} method="post" as="button" title={isCollapsed ? "Log Out" : undefined} className={`flex items-center w-full text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-all duration-300 ease-in-out ${isCollapsed ? 'justify-center p-2' : 'px-3 py-2'}`}>
                                <LogOut className={`w-4 h-4 shrink-0 transition-all duration-300 ease-in-out ${isCollapsed ? '' : 'mr-2'}`} /> 
                                <span className={`whitespace-nowrap overflow-hidden transition-all duration-300 ease-in-out ${isCollapsed ? 'max-w-0 opacity-0' : 'max-w-[150px] opacity-100'}`}>
                                    Log Out
                                </span>
                            </Link>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Mobile Header */}
                <header className="lg:hidden bg-white/40 dark:bg-slate-900/50 backdrop-blur-md border-b border-gray-200/50 dark:border-slate-800 h-16 flex items-center justify-between px-4">
                    <Link href="/">
                        <ApplicationLogo className="block h-8 w-auto" />
                    </Link>
                    <button 
                        onClick={() => setSidebarOpen(true)}
                        className="p-2 rounded-md text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-800"
                    >
                        <Menu className="w-6 h-6" />
                    </button>
                </header>

                {/* Page Header (if any) */}
                {header && (
                    <div className="bg-white/40 dark:bg-slate-900/50 backdrop-blur-md shadow-sm border-b border-gray-200/50 dark:border-slate-800 hidden lg:block">
                        <div className="px-8 py-6">
                            {header}
                        </div>
                    </div>
                )}
                
                {/* Mobile Page Header */}
                {header && (
                    <div className="bg-white/40 dark:bg-slate-900/50 backdrop-blur-md shadow-sm border-b border-gray-200/50 dark:border-slate-800 lg:hidden">
                        <div className="px-4 py-4">
                            {header}
                        </div>
                    </div>
                )}

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto p-4 sm:p-8 transition-all duration-300 ease-in-out">
                    {children}
                </main>
            </div>

            {/* Create AI Project Modal */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                    <div 
                        className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm"
                        onClick={() => setIsCreateModalOpen(false)}
                    ></div>
                    <div className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-slate-800">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Create AI Project</h3>
                            <button 
                                onClick={() => setIsCreateModalOpen(false)}
                                className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={submitCreateProject} className="p-6">
                            <div className="mb-6">
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    AI Project Name
                                </label>
                                <input
                                    id="name"
                                    type="text"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    placeholder="e.g. Acme Corp Docs"
                                    className="w-full px-4 py-2 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-[#F29191] focus:border-[#F29191] dark:text-white transition-all shadow-sm"
                                    autoFocus
                                />
                                {errors.name && (
                                    <p className="mt-2 text-sm text-red-600">{errors.name}</p>
                                )}
                            </div>
                            <div className="flex justify-end space-x-3">
                                <button
                                    type="button"
                                    onClick={() => setIsCreateModalOpen(false)}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-4 py-2 text-sm font-medium text-white bg-[#F29191] hover:bg-[#e68383] rounded-xl shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                                >
                                    {processing ? 'Creating...' : 'Create AI Project'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
