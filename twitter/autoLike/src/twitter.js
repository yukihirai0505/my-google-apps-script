import { getProperty } from './props'

const getTwitterService = () =>
  OAuth1.createService('Twitter')
    .setAccessTokenUrl('https://api.twitter.com/oauth/access_token')
    .setRequestTokenUrl('https://api.twitter.com/oauth/request_token')
    .setAuthorizationUrl('https://api.twitter.com/oauth/authorize')
    .setConsumerKey(getProperty('TWITTER_COMSUMER_KEY'))
    .setConsumerSecret(getProperty('TWITTER_COMSUMER_SECRET'))
    .setAccessToken(getProperty('TWITTER_ACCESS_TOKEN'), getProperty('TWITTER_ACCESS_SECRET'))

const urls = []
const keywords = ['#Progate', '#Dotinstall', '#テックキャンプ', '#Qiita']
const twitterService = getTwitterService()

export const autoLike = () => {
  keywords.forEach(keyword => {
    const res = twitterService.fetch(
      `https://api.twitter.com/1.1/search/tweets.json?q=${encodeURIComponent(
        `${keyword} exclude:retweets`
      )}&lang=ja&result_type=recent&count=100`
    )
    const { statuses: tweets } = JSON.parse(res)

    tweets.forEach(tweet => {
      // 1000/24 hour
      if (urls.length > 40) {
        return
      }

      const diff = Math.abs(new Date() - new Date(tweet.created_at))
      const minutes = Math.floor(diff / 1000 / 60)
      if (minutes < 60) {
        const url = `https://twitter.com/${tweet.user.screen_name}/status/${tweet.id_str}`
        if (urls.filter(e => e === url).length === 0) {
          urls.push(url)
          twitterService.fetch(
            `https://api.twitter.com/1.1/favorites/create.json?id=${tweet.id_str}`,
            { method: 'post' }
          )
        }
      }
    })
  })
}
