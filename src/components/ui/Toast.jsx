import React from 'react'
import useToastStore from '../../store/toastStore'

export default function Toast() {
    const { message, type = 'success', isVisible, isExiting } = useToastStore()

    if (!isVisible) return null

    const isError = type === 'error'
    const bgColor = isError ? 'bg-red-500' : 'bg-green-500'
    const shadowColor = isError ? 'shadow-red-500/20' : 'shadow-green-500/20'

    return (
        <div className={`fixed bottom-6 right-6 z-[100] ${bgColor} text-white px-6 py-3 rounded-xl shadow-lg ${shadowColor} flex items-center gap-3 ${isExiting ? 'animate-slide-down-out' : 'animate-slide-up'}`}>
            {isError ? (
                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
            ) : (
                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"></path>
                </svg>
            )}
            <span className="font-medium">{message}</span>
        </div>
    )
}