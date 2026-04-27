import { useMemo } from 'react'
import useMembersStore from '../store/membersStore'

const safeParseBool = (value) => {
  if (value === true || value === 'true' || value === 'Ativo') return true
  if (value === false || value === 'false' || value === 'Desativado') return false
  return null
}

export function useMembers(filter) {
  const members = useMembersStore((s) => s.members)
  const getMembersBySection = useMembersStore((s) => s.getMembersBySection)

  const filtered = useMemo(() => {
    return getMembersBySection(filter)
  }, [members, filter, getMembersBySection])

  return {
    members: filtered,
    allMembers: members,
    totalActive: members.filter(m => m.status === 'Ativo').length,
    totalProbation: members.filter(m => m.status === 'Licença').length,
    total: members.length,
  }
}
