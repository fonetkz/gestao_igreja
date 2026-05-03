import useToastStore from '../../store/toastStore'

export default function Toast() {
    const { message, type = 'success', isVisible, isExiting } = useToastStore()

    if (!isVisible) return null

    const isError = type === 'error'

    return (
        <div className="fixed top-[72px] right-4 z-[300] pointer-events-none">
            <div
                style={{
                    animation: isExiting
                        ? 'toastOut 0.25s cubic-bezier(0.4, 0, 1, 1) forwards'
                        : 'toastIn 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards'
                }}
                className="pointer-events-auto bg-white dark:bg-[#2C2C2E] border border-gray-200 dark:border-gray-700 shadow-xl rounded-2xl px-4 py-3 flex items-center gap-3 min-w-[220px] max-w-sm"
            >
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${isError ? 'bg-red-100 dark:bg-red-900/30 text-red-500' : 'bg-green-100 dark:bg-green-900/30 text-green-600'}`}>
                    {isError ? (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    ) : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                        </svg>
                    )}
                </div>
                <span className="text-sm font-medium text-gray-900 dark:text-white">{message}</span>
            </div>
        </div>
    )
}
