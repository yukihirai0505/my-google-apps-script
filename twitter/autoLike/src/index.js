import { favorite, search, show, listMembersCreateAll, lists, listShow } from './twitter'

const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1) + min)

global.showLists = () => {
  Logger.log(
    lists('yabaiwebyasan').map(list => {
      const { name, id_str: idStr } = list
      return {
        id: idStr,
        name
      }
    })
  )
}

global.autoList = () => {
  function removeDuplicatesSafe(arr) {
    const seen = {}
    const retArr = []
    for (let i = 0; i < arr.length; i += 1) {
      if (!(arr[i] in seen)) {
        retArr.push(arr[i])
        seen[arr[i]] = true
      }
    }
    return retArr
  }

  const data = [
    {
      listId: '1073020721293516801',
      tag: '#駆け出しエンジニアと繋がりたい'
    },
    {
      listId: '1073034480187670528',
      tag: '#Dotinstall'
    },
    {
      listId: '1073034377947271168',
      tag: '#Progate'
    },
    {
      listId: '1073034228093280257',
      tag: '#Qiita'
    },
    {
      listId: '1073372507657330688',
      tag: '#テックキャンプ'
    },
    {
      listId: '1073372604461854720',
      tag: '#Railsチュートリアル'
    }
  ]
  data.forEach(d => {
    const { listId, tag } = d
    const list = listShow(listId)
    if (list.member_count < 5000) {
      const { statuses: tweets } = search(tag)
      const users = tweets.map(tweet => tweet.user.screen_name)
      Utilities.sleep(getRandomInt(1000, 2000))
      listMembersCreateAll(listId, removeDuplicatesSafe(users))
    }
  })
}

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
