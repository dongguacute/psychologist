import { app } from '@/app/registry'
import defaultTopicLogo from '@/assets/photo/depression.png'

app.route({
  topicId: 'depression',
  name: '抑郁症',
  logo: defaultTopicLogo,
  chapterIds: [1],
})
