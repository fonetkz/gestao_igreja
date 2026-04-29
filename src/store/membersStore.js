import { create } from 'zustand'
import api from '../services/api'

const safeParseInt = (value) => {
  if (value === null || value === undefined) return 0
  const parsed = parseInt(value, 10)
  return isNaN(parsed) ? 0 : parsed
}

const useMembersStore = create((set, get) => ({
  members: [],
  attendance: [],
  loading: false,

  fetchMembers: async () => {
    set({ loading: true })
    try {
      const { data } = await api.get('/api/membros')
      set({ members: data })
    } catch (error) {
      console.error('Erro ao buscar membros', error)
    } finally {
      set({ loading: false })
    }
  },

  fetchAttendance: async () => {
    try {
      const { data } = await api.get('/api/chamadas')
      const history = data.map(c => ({
        ...c,
        registros_json: JSON.parse(c.registros_json || '[]')
      }))
      set({ attendance: history })
    } catch (error) {
      console.error('Erro ao buscar histórico de chamadas', error)
    }
  },

  // Adicionar membro
  addMember: async (member) => {
    try {
      const iniciais = member.nome.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
      const payload = {
        ...member,
        iniciais,
        instrumento_voz: member.instrumento_voz || member.secao,
        secao: member.secao || member.instrumento_voz,
        faltas_mes_atual: 0,
        status: member.status || 'Ativo'
      }
      const { data } = await api.post('/api/membros', payload)
      set((state) => ({ members: [...state.members, data] }))
      return data
    } catch (error) {
      console.error('Erro ao adicionar membro', error)
      throw error
    }
  },

  // Atualizar membro
  updateMember: async (id, updates) => {
    try {
      const { data } = await api.patch(`/api/membros/${id}`, updates)
      set((state) => ({
        members: state.members.map(m => m.id === id ? data : m),
      }))
    } catch (error) {
      console.error('Erro ao atualizar membro', error)
      throw error
    }
  },

  // Remover membro
  removeMember: async (id) => {
    try {
      await api.delete(`/api/membros/${id}`)
      set((state) => ({
        members: state.members.filter(m => m.id !== id),
      }))
    } catch (error) {
      console.error('Erro ao remover membro', error)
      throw error
    }
  },

  // Salvar chamada do dia
  saveAttendance: async (data_chamada, contexto, registros) => {
    try {
      const payload = {
        data: data_chamada,
        contexto,
        registros_json: JSON.stringify(registros)
      }
      const { data } = await api.post('/api/chamadas', payload)

      const newEntry = {
        ...data,
        registros_json: JSON.parse(data.registros_json || '[]')
      }

      set((state) => ({
        attendance: [newEntry, ...state.attendance]
      }))

      const absencesToUpdate = registros.filter(r => !r.presente)
      for (const record of absencesToUpdate) {
        const member = get().members.find(m => m.id === record.membro_id)
        if (member) {
          const currentFaltas = safeParseInt(member.faltas_mes_atual)
          await get().updateMember(member.id, { faltas_mes_atual: currentFaltas + 1 })
        }
      }
    } catch (error) {
      console.error('Erro ao salvar chamada', error)
      throw error
    }
  },

  // Atualizar chamada
  updateAttendance: async (chamadaId, updates) => {
    try {
      const payload = {
        registros_json: JSON.stringify(updates.registros_json),
        contexto: updates.contexto
      }
      const { data } = await api.patch(`/api/chamadas/${chamadaId}`, payload)

      set((state) => ({
        attendance: state.attendance.map(c =>
          c.id === chamadaId
            ? { ...data, registros_json: JSON.parse(data.registros_json || '[]') }
            : c
        )
      }))
    } catch (error) {
      console.error('Erro ao atualizar chamada', error)
      throw error
    }
  },

  // Obter membros com problemas de frequência (2+ faltas no mês corrente)
  getProblematicMembers: () => {
    const { members } = get()
    return members.filter(m => safeParseInt(m.faltas_mes_atual) >= 2).sort((a, b) => safeParseInt(b.faltas_mes_atual) - safeParseInt(a.faltas_mes_atual))
  },

  // Obter membros por seção
  getMembersBySection: (secao) => {
    const { members } = get()
    if (!secao || secao === 'all') return members
    if (secao === 'sopranos') return members.filter(m => m.instrumento_voz === 'Soprano')
    if (secao === 'strings') return members.filter(m => ['Violino I', 'Violino II', 'Viola', 'Cello', 'Contrabaixo'].includes(m.instrumento_voz))
    return members.filter(m => (m.secao || '').toLowerCase().includes(secao.toLowerCase()))
  },

  // Contagem de membros ativos
  getActiveCount: () => {
    const { members } = get()
    return members.filter(m => m.status === 'Ativo').length
  },

  // Justificar faltas
  justifyAbsences: async (memberId, justificativa = '', absenceIds = []) => {
    try {
      if (absenceIds.length > 0) {
        const allAttendance = get().attendance;
        for (const absenceId of absenceIds) {
          const [callId] = absenceId.split('-');
          const call = allAttendance.find(c => String(c.id) === String(callId));
          if (call) {
            const registros = JSON.parse(call.registros_json || '[]');
            const updatedRegistros = registros.map(r => {
              if (String(r.membro_id) === String(memberId) && `${call.id}-${r.membro_id}` === absenceId) {
                return { ...r, justificativa: justificativa };
              }
              return r;
            });
            await api.patch(`/api/chamadas/${call.id}`, { registros_json: JSON.stringify(updatedRegistros) });
          }
        }
      }
      await get().updateMember(memberId, {
        data_ultimo_ensaio: new Date().toISOString().split('T')[0]
      })
    } catch (error) {
      console.error('Erro ao justificar faltas', error)
    }
  },

  // Atualizar chamada (presença e justificativa)
  updateCall: async (chamadaId, registros_json) => {
    try {
      const payload = Array.isArray(registros_json) ? JSON.stringify(registros_json) : registros_json
      const { data } = await api.patch(`/api/chamadas/${chamadaId}`, { registros_json: payload })
      let parsed = data.registros_json
      if (typeof parsed === 'string') {
        try { parsed = JSON.parse(parsed) } catch (e) { parsed = [] }
      }
      set((state) => ({
        attendance: state.attendance.map(c =>
          c.id === chamadaId ? { ...c, registros_json: parsed } : c
        )
      }))
      return data
    } catch (error) {
      console.error('Erro ao atualizar chamada', error)
      throw error
    }
  },

  // Reset de faltas
  resetAbsences: async (memberId) => {
    try {
      await get().updateMember(memberId, { faltas_mes_atual: 0 })
    } catch (error) {
      console.error('Erro ao resetar faltas', error)
    }
  },

  // Deletar chamada
  deleteCall: async (chamadaId) => {
    try {
      const call = get().attendance.find(c => String(c.id) === String(chamadaId))
      const response = await api.post(`/api/chamadas/${chamadaId}/deletar`)

      // Estorna a falta do membro caso a chamada seja excluída
      if (call && call.registros_json) {
        const absentees = call.registros_json.filter(r => !r.presente)
        for (const record of absentees) {
          const member = get().members.find(m => String(m.id) === String(record.membro_id))
          if (member) {
            const currentFaltas = safeParseInt(member.faltas_mes_atual)
            if (currentFaltas > 0) {
              await get().updateMember(member.id, { faltas_mes_atual: currentFaltas - 1 })
            }
          }
        }
      }

      set((state) => ({
        attendance: state.attendance.filter(c => String(c.id) !== String(chamadaId))
      }))
      return response.data
    } catch (error) {
      console.error('Erro ao deletar chamada:', error)
      throw error
    }
  },
}))

export default useMembersStore
