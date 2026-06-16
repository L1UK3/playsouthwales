import type React from "react";

export const SkeletonRow: React.FC = () => (
    <tr className='animate-pulse'>
        <td className='py-4 px-4 flex justify-center items-center'>
            <div className='w-7 h-7 bg-border-color/60 rounded-full' />
        </td>
        <td className='py-4 px-4'>
            <div className='h-4 bg-border-color/60 rounded-sm w-32' />
        </td>
        <td className='py-4 px-4 text-right pr-6 flex justify-end items-center'>
            <div className='h-5 bg-border-color/60 rounded-full w-12' />
        </td>
    </tr>
);
