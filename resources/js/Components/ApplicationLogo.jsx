export default function ApplicationLogo({ collapsed = false, className = "h-10", ...props }) {
    return (
        <div className={`flex items-center ${className}`} {...props}>
            <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-full w-auto shrink-0">
                <path d="M 25 15 C 25 15, 25 75, 25 75 C 25 85, 35 85, 35 85 L 85 85" stroke="#F29191" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M 45 35 C 45 35, 45 65, 45 65 C 45 70, 50 70, 50 70 L 75 70" stroke="#F29191" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className={`font-['Plus_Jakarta_Sans',sans-serif] font-extrabold text-3xl ml-1 text-[#F29191] whitespace-nowrap overflow-hidden transition-all duration-300 ease-in-out ${collapsed ? 'max-w-0 opacity-0' : 'max-w-[150px] opacity-100'}`}>
                L<span className="text-slate-900 dark:text-white">O</span>DEXI
            </span>
        </div>
    );
}
