import { getProperty } from './props'

const getTwitterService = () =>
  OAuth1.createService('Twitter')
    .setAccessTokenUrl('https://api.twitter.com/oauth/access_token')
    .setRequestTokenUrl('https://api.twitter.com/oauth/request_token')
    .setAuthorizationUrl('https://api.twitter.com/oauth/authorize')
    .setConsumerKey(getProperty('TWITTER_COMSUMER_KEY'))
    .setConsumerSecret(getProperty('TWITTER_COMSUMER_SECRET'))
    .setAccessToken(getProperty('TWITTER_ACCESS_TOKEN'), getProperty('TWITTER_ACCESS_SECRET'))

const keywords = [
  '#Progate',
  '#Dotinstall',
  '#テックキャンプ',
  '#Qiita',
  '#駆け出しエンジニアと繋がりたい',
  '#Railsチュートリアル'
]
const twitterService = getTwitterService()

const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1) + min)

export const autoLike = () => {
  keywords.forEach(keyword => {
    const res = twitterService.fetch(
      `https://api.twitter.com/1.1/search/tweets.json?q=${encodeURIComponent(
        `${keyword} exclude:retweets`
      )}&lang=ja&result_type=recent&count=100`
    )
    const { statuses: tweets } = JSON.parse(res)
    const ids = []
    tweets.forEach(tweet => {
      // 1000/24 hour
      if (ids.length > 40) {
        return
      }

      const diff = Math.abs(new Date() - new Date(tweet.created_at))
      const minutes = Math.floor(diff / 1000 / 60)
      if (minutes < 60) {
        const { id_str: idStr } = tweet
        // search result tweet.favorited is not correct somthimes, so fetch it again
        const status = JSON.parse(
          twitterService.fetch(`https://api.twitter.com/1.1/statuses/show.json?id=${idStr}`)
        )
        if (ids.filter(e => e === idStr).length === 0 && status.favorited === false) {
          twitterService.fetch(`https://api.twitter.com/1.1/favorites/create.json?id=${idStr}`, {
            method: 'post'
          })
          Utilities.sleep(getRandomInt(1000, 2000))
          ids.push(idStr)
        }
      }
    })
  })
}
