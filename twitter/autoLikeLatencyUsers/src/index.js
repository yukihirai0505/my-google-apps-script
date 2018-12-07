import { getFollowerIds, getUserTimeLine, favorite } from './twitter'

const bk = SpreadsheetApp.getActiveSpreadsheet()
const followersSheet = bk.getSheetByName('followers')

// global.clean = () => {
//   function removeDuplicatesSafe(arr) {
//     const seen = {}
//     const retArr = []
//     for (let i = 0; i < arr.length; i += 1) {
//       if (!(arr[i] in seen)) {
//         retArr.push(arr[i])
//         seen[arr[i]] = true
//       }
//     }
//     return retArr
//   }
//
//   const userIds = followersSheet.getRange(2, 1, followersSheet.getLastRow(), 1).getValues()
//   const pureUserIds = removeDuplicatesSafe(userIds)
//   followersSheet.getRange(2, 2, pureUserIds.length, 1).setValues(pureUserIds)
// }

global.saveFollowers = () => {
  const screenName = 'yabaiwebyasan'

  function getIds(_ids = [], _nextCursor = -1) {
    const { next_cursor_str: nextCursor, ids } = getFollowerIds(screenName, _nextCursor)
    Logger.log(nextCursor)
    if (Number(nextCursor) > 0) {
      return getIds(_ids.concat(ids), nextCursor)
    }
    return _ids.concat(ids)
  }

  const ids = getIds().map(id => [id])
  const savedIds = followersSheet
    .getRange(2, 1, followersSheet.getLastRow(), 1)
    .getValues()
    .filter(e => e[0])
  followersSheet.getRange(savedIds.length + 2, 1, ids.length, 1).setValues(ids)
}

global.getUserTweet = () => {
  const range = followersSheet.getRange(2, 1, followersSheet.getLastRow(), 3)
  let apiRequestCount = 0
  const data = range.getValues().map(e => {
    const row = e
    const userId = row[0]
    const tweetId = row[1]
    // 50 request per 30 min
    if (userId && !tweetId && apiRequestCount < 50) {
      try {
        const tweets = getUserTimeLine(userId)
        apiRequestCount += 1
        if (tweets.length > 0) {
          const tweet = tweets[0]
          row[1] = tweet.id_str
          row[2] = tweet.favorited
        } else {
          row[1] = 'no tweet'
        }
      } catch (err) {
        row[1] = err.message
      }
    }
    return row
  })
  range.setValues(data)
}

// 1000/24 hour ref: https://developer.twitter.com/en/docs/basics/rate-limits.html
global.autoLike = () => {
  const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1) + min)

  let favoriteCount = 0
  const values = followersSheet
    .getRange(2, 1, followersSheet.getLastRow(), 3)
    .getValues()
    .filter(e => e[1])
  const data = values.map(e => {
    const row = e
    const tweetId = row[1]
    const favorited = row[2]
    // 10 request per 15min
    if (tweetId && favorited === false && favoriteCount < 10) {
      try {
        favorite(tweetId)
        row[2] = true
        favoriteCount += 1
        Utilities.sleep(getRandomInt(1000, 2000))
      } catch (err) {
        row[2] = err.message
      }
    }
    return row
  })
  followersSheet.getRange(2, 1, data.length, 3).setValues(data)
}
