import React from 'react'
import useToastStore from '../../store/toastStore'

export default function Toast() {
    const { message, isVisible, isExiting } = useToastStore()

    if (!isVisible) return null

    return (
        <div className={`fixed bottom-6 right-6 z-[100] bg-green-500 text-white px-6 py-3 rounded-xl shadow-lg shadow-green-500/20 flex items-center gap-3 ${isExiting ? 'animate-slide-down-out' : 'animate-slide-up'}`}>
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"></path>
            </svg>
            <span className="font-medium">{message}</span>
        </div>
    )
}