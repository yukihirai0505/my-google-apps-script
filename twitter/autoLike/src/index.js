import { favorite, search, show } from './twitter'

const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1) + min)

global.autoLike = () => {
  const ids = []
  const keywords = [
    '#Progate',
    '#Dotinstall',
    '#テックキャンプ',
    '#Qiita',
    '#駆け出しエンジニアと繋がりたい',
    '#Railsチュートリアル'
  ]
  const validate = (idStr, status) =>
    ids.filter(e => e === idStr).length === 0 &&
    status.favorited === false &&
    !status.text.match(/エッチ|エロ/)

  keywords.forEach(keyword => {
    const { statuses: tweets } = search(keyword)
    tweets.forEach(tweet => {
      // 1000/24 hour ref: https://developer.twitter.com/en/docs/basics/rate-limits.html
      if (ids.length > 40) {
        return
      }
      const diff = Math.abs(new Date() - new Date(tweet.created_at))
      const minutes = Math.floor(diff / 1000 / 60)
      if (minutes < 60) {
        const { id_str: idStr } = tweet
        // search result tweet.favorited is not correct somthimes, so fetch it again
        const status = show(idStr)
        if (validate(idStr, status)) {
          favorite(idStr)
          Utilities.sleep(getRandomInt(1000, 2000))
          ids.push(idStr)
        }
      }
    })
  })
}
