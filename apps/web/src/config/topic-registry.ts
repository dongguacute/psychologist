import { app } from '@/app/registry'
import defaultTopicLogo from '@/assets/topic-default-logo.svg?url'

app.route({
  topicId: 'example',
  name: '示例课题',
  logo: defaultTopicLogo,
  chapterIds: [1],
})
