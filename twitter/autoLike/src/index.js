import {
  favorite,
  search,
  show,
  listMembersCreateAll,
  listMembers,
  lists,
  listShow,
  getFollowerIds
} from './twitter'

const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1) + min)
export const chunkArr = (array, size) => {
  const chunkedArr = []
  const copied = array
  const numOfChild = Math.ceil(copied.length / size)
  for (let i = 0; i < numOfChild; i += 1) {
    chunkedArr.push(copied.splice(0, size))
  }
  return chunkedArr
}

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

global.autoFollowersList = () => {
  // 対象のリストを取得
  const myLists = lists('yabaiwebyasan').filter(list => list.name.match(/情報感度の高い方々/))
  // リストに追加済みのメンバーを取得
  let listMemberIds = []
  myLists.forEach(list => {
    const { id_str: idStr, member_count: memberCount } = list
    if (memberCount > 0) {
      listMemberIds = listMemberIds.concat(listMembers(idStr).users.map(user => user.id_str))
    }
  })
  // 上限に達していないリストを取得
  const targetLists = myLists.filter(list => {
    const { member_count: memberCount } = list
    return memberCount < 5000
  })
  const screenName = 'yabaiwebyasan'

  // フォロワーIDを取得
  function getIds(_ids = [], _nextCursor = -1) {
    const { next_cursor_str: nextCursor, ids } = getFollowerIds(screenName, _nextCursor)
    if (Number(nextCursor) > 0) {
      return getIds(_ids.concat(ids), nextCursor)
    }
    return _ids.concat(ids)
  }

  let listIndex = 0
  let idsCount = 0
  let allIds = getIds()
  // フォロワーIDとリストに追加済みのメンバーで重複があれば除去
  allIds = allIds.filter(id => listMemberIds.indexOf(id) === -1)
  // 5000を100人ずつに分割してリストに追加
  chunkArr(allIds.slice(0, 5000), 100).forEach(ids => {
    const list = targetLists[listIndex]
    const { id_str: idStr, member_count: memberCount } = list
    const params = {
      list_id: idStr,
      user_id: removeDuplicatesSafe(ids).join(',')
    }
    listMembersCreateAll(params)
    // リストがいっぱになれば新しいリストを使う
    idsCount += ids.length
    if (memberCount + idsCount > 5000) {
      listIndex += 1
      idsCount = 0
    }
  })
}

global.autoHashTagList = () => {
  const data = [
    {
      listId: '1073020721293516801',
      tags: ['#駆け出しエンジニアと繋がりたい']
    },
    {
      listId: '1073034480187670528',
      tags: ['#Dotinstall', '#ドットインストール']
    },
    {
      listId: '1073034377947271168',
      tags: ['#Progate']
    },
    {
      listId: '1073034228093280257',
      tags: ['#Qiita']
    },
    {
      listId: '1073372507657330688',
      tags: ['#テックキャンプ']
    },
    {
      listId: '1073372604461854720',
      tags: ['#Railsチュートリアル']
    },
    {
      listId: '1074967929324621826',
      tags: ['#ウェブカツ']
    },
    {
      listId: '1075389735751667717',
      tags: ['#100DaysOfCode']
    }
  ]
  data.forEach(d => {
    const { listId, tags } = d
    const list = listShow(listId)
    if (list.member_count < 5000) {
      tags.forEach(tag => {
        const { statuses: tweets } = search(tag)
        const users = tweets.map(tweet => tweet.user.screen_name)
        Utilities.sleep(getRandomInt(1000, 2000))
        const params = {
          list_id: listId,
          screen_name: removeDuplicatesSafe(users).join(',')
        }
        listMembersCreateAll(params)
      })
    }
  })
}

global.autoLike = () => {
  const ids = []
  const keywords = [
    // '#ウェブカツ',
    // '#テックキャンプ',
    // '#Progate',
    // '#駆け出しエンジニアと繋がりたい',
    // '#ドットインストール',
    // '#Dotinstall',
    // '#Qiita',
    // '#Railsチュートリアル',
    '#WomenWhoCode',
    '#CodeNewbie',
    '#100DaysOfCode'
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
