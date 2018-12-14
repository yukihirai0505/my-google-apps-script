import { getProperty } from './props'

const getTwitterService = () =>
  OAuth1.createService('Twitter')
    .setAccessTokenUrl('https://api.twitter.com/oauth/access_token')
    .setRequestTokenUrl('https://api.twitter.com/oauth/request_token')
    .setAuthorizationUrl('https://api.twitter.com/oauth/authorize')
    .setConsumerKey(getProperty('TWITTER_COMSUMER_KEY'))
    .setConsumerSecret(getProperty('TWITTER_COMSUMER_SECRET'))
    .setAccessToken(getProperty('TWITTER_ACCESS_TOKEN'), getProperty('TWITTER_ACCESS_SECRET'))

const twitterService = getTwitterService()

export const search = keyword =>
  JSON.parse(
    twitterService.fetch(
      `https://api.twitter.com/1.1/search/tweets.json?q=${encodeURIComponent(
        `${keyword} exclude:retweets`
      )}&lang=ja&result_type=recent&count=100`
    )
  )

export const show = idStr =>
  JSON.parse(twitterService.fetch(`https://api.twitter.com/1.1/statuses/show.json?id=${idStr}`))

export const favorite = idStr =>
  twitterService.fetch(`https://api.twitter.com/1.1/favorites/create.json?id=${idStr}`, {
    method: 'post'
  })

export const lists = screenName =>
  JSON.parse(
    twitterService.fetch(`https://api.twitter.com/1.1/lists/list.json?screen_name=${screenName}`)
  )

export const listShow = listId =>
  JSON.parse(twitterService.fetch(`https://api.twitter.com/1.1/lists/show.json?list_id=${listId}`))

export const listMembersCreateAll = (listId, screenNames) => {
  Logger.log(screenNames.length)
  twitterService.fetch(`https://api.twitter.com/1.1/lists/members/create_all.json`, {
    method: 'post',
    payload: {
      list_id: listId,
      screen_name: screenNames.join(',')
    }
  })
}
