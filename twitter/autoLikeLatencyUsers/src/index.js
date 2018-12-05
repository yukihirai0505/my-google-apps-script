import { getFollowerIds, getUserTimeLine, favorite } from './twitter'

const bk = SpreadsheetApp.getActiveSpreadsheet()
const followersSheet = bk.getSheetByName('followers')

global.saveFollowers = () => {
  const screenName = 'rrrr_fx'
  // never_be_a_pm, prog_8, manabubannai, yuki_99_s

  function getIds(_ids = [], _nextCursor = -1) {
    const { next_cursor_str: nextCursor, ids } = getFollowerIds(screenName, _nextCursor)
    Logger.log(nextCursor)
    if (Number(nextCursor) > 0) {
      return getIds(_ids.concat(ids), nextCursor)
    }
    return _ids.concat(ids)
  }

  const ids = getIds().map(id => [id])
  followersSheet.getRange(2, 1, ids.length, 1).setValues(ids)
}

global.getUserTweet = () => {
  const range = followersSheet.getRange(2, 1, followersSheet.getLastRow(), 3)
  let apiRequestCount = 0
  const data = range.getValues().map(e => {
    const row = e
    const userId = row[0]
    const tweetId = row[1]
    if (userId && !tweetId && apiRequestCount < 300) {
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
  const range = followersSheet.getRange(2, 1, followersSheet.getLastRow(), 3)
  const data = range.getValues().map(e => {
    const row = e
    const tweetId = row[1]
    const favorited = row[2]
    if (tweetId && favorited === false && favoriteCount < 40) {
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
  range.setValues(data)
}
