<script setup lang="ts">
import { computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { topicById } from '@/app/registry'
import { ROUTE_NAMES } from '@/app/routes'
import TopicStudyWorkspace from '@/components/learn/TopicStudyWorkspace.vue'

const route = useRoute()
const router = useRouter()

const topicId = computed(() => String(route.params.topicId ?? '').trim())

const topicMeta = computed(() => topicById(topicId.value))

watch(
  () => ({ id: topicId.value, meta: topicMeta.value }),
  ({ id, meta }) => {
    if (!id || !meta)
      router.replace({ name: ROUTE_NAMES.learn })
  },
  { immediate: true },
)
</script>

<template>
  <div
    v-if="topicMeta"
    class="mx-auto max-w-3xl rounded-3xl border-2 border-[var(--app-border)] bg-[var(--app-surface)] p-6 shadow-[0_6px_0_0_var(--app-border)] sm:p-8 lg:max-w-5xl"
  >
    <TopicStudyWorkspace :topic-meta="topicMeta" />
  </div>
</template>
