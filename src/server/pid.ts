'use server'
import { DataGetter } from '../lib/DataGetter'
import type { Service } from '../types'

const dataGetter = new DataGetter()

interface CacheEntry {
  data: Service[]
  timestamp: number
}

// In-memory server cache with 10-second TTL
const cache = new Map<string, CacheEntry>()
const TTL_MS = 10 * 1000

export async function getPidData(
  stopId: string,
  servicesLimit = 2,
): Promise<Service[] | null> {
  const cacheKey = `${stopId}-${servicesLimit}`
  const now = Date.now()

  if (cache.has(cacheKey)) {
    const entry = cache.get(cacheKey)!
    if (now - entry.timestamp < TTL_MS) {
      return entry.data
    }
  }

  try {
    const result = await dataGetter.fetchPid(stopId, servicesLimit)
    if (result) {
      cache.set(cacheKey, { data: result, timestamp: now })
    }
    return result as Service[]
  } catch (err: unknown) {
    const error = err as Error & { status?: number }
    if (error?.status === 404 || error?.message?.includes('404')) {
      throw err
    }
    console.error('Error fetching PID data:', err)
    return null
  }
}
