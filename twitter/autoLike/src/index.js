import { favorite, search } from './twitter'

global.autoLike = () => {
  const urls = []
  const keywords = [
    '#Progate',
    '#Dotinstall',
    '#テックキャンプ',
    '#Qiita',
    '#駆け出しエンジニアと繋がりたい',
    '#Railsチュートリアル'
  ]

  keywords.forEach(keyword => {
    const res = search(keyword)
    const { statuses: tweets } = JSON.parse(res)

    tweets.forEach(tweet => {
      // 1000/24 hour ref: https://developer.twitter.com/en/docs/basics/rate-limits.html
      if (urls.length > 40) {
        return
      }

      const diff = Math.abs(new Date() - new Date(tweet.created_at))
      const minutes = Math.floor(diff / 1000 / 60)
      if (minutes < 60) {
        const url = `https://twitter.com/${tweet.user.screen_name}/status/${tweet.id_str}`
        if (urls.filter(e => e === url).length === 0) {
          urls.push(url)
          favorite(tweet.id_str)
        }
      }
    })
  })
}
