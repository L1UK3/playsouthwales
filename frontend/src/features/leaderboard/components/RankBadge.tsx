import { Medal, Trophy } from "lucide-react";

export const renderRankBadge = (pos: number) => {
    const baseClass = 'flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold shadow-xs transition-transform duration-300 hover:scale-110';
    if (pos === 1) {
        return (
            <div className={`${baseClass} bg-linear-to-r from-amber-400 to-yellow-500 text-white border border-yellow-300/40`} title='1st Place'>
                <Trophy className='w-3.5 h-3.5' />
            </div>
        );
    }
    if (pos === 2) {
        return (
            <div className={`${baseClass} bg-linear-to-r from-slate-300 to-slate-400 text-white border border-slate-200/40`} title='2nd Place'>
                <Medal className='w-3.5 h-3.5' />
            </div>
        );
    }
    if (pos === 3) {
        return (
            <div className={`${baseClass} bg-linear-to-r from-amber-600 to-amber-700 text-white border border-amber-500/40`} title='3rd Place'>
                <Medal className='w-3.5 h-3.5 text-amber-100' />
            </div>
        );
    }
    return (
        <div className='flex items-center justify-center w-7 h-7 rounded-full border border-border-color bg-bg-main text-text-muted text-[11px] font-medium'>
            {pos}
        </div>
    );
};