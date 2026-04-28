import { create } from 'zustand'

const useToastStore = create((set, get) => ({
    message: '',
    isVisible: false,
    isExiting: false,
    timeoutId: null,
    exitTimeoutId: null,

    showToast: (msg) => {
        const state = get()

        // Limpa temporizadores antigos caso o usuário clique muito rápido em várias ações
        if (state.timeoutId) clearTimeout(state.timeoutId)
        if (state.exitTimeoutId) clearTimeout(state.exitTimeoutId)

        // Mostra o toast com a nova mensagem
        set({ message: msg, isVisible: true, isExiting: false })

        // Configura o tempo para iniciar a saída (3 segundos)
        const timeoutId = setTimeout(() => {
            set({ isExiting: true })

            // Configura o tempo para remover do DOM após a animação terminar (400ms)
            const exitTimeoutId = setTimeout(() => {
                set({ isVisible: false, message: '' })
            }, 400)

            set({ exitTimeoutId })
        }, 3000)

        set({ timeoutId })
    }
}))

export default useToastStore