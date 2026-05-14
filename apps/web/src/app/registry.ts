import type { RegisteredTopic } from '@psychologist/core'

import { learnTopicLocation } from './routes'

export type TopicRegistryEntry = RegisteredTopic & {
  chapterIds: readonly number[]
  route: ReturnType<typeof learnTopicLocation>
}

export type TopicRouteInput = Omit<TopicRegistryEntry, 'route'>

const rows: TopicRegistryEntry[] = []

export const TOPIC_REGISTRY: readonly TopicRegistryEntry[] = rows

export const app = {
  route(entry: TopicRouteInput): void {
    if (rows.some(r => r.topicId === entry.topicId))
      throw new Error(`duplicate topicId: ${entry.topicId}`)
    rows.push({
      ...entry,
      route: learnTopicLocation(entry.topicId),
    })
  },
}

export function topicById(topicId: string): TopicRegistryEntry | undefined {
  return rows.find(r => r.topicId === topicId)
}

export function topicChapterIds(topicId: string): readonly number[] {
  return topicById(topicId)?.chapterIds ?? []
}
