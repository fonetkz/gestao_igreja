import { useMemo } from 'react'
import useHymnsStore from '../store/hymnsStore'

export function useHymns(searchTerm) {
  const hymns = useHymnsStore((s) => s.hymns)
  const searchHymns = useHymnsStore((s) => s.searchHymns)

  const filtered = useMemo(() => {
    return searchHymns(searchTerm)
  }, [hymns, searchTerm, searchHymns])

  return {
    hymns: filtered,
    allHymns: hymns,
    total: hymns.length,
  }
}
