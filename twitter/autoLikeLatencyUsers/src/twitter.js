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

export const getFollowerIds = (screenName, nextCursor = -1) =>
  JSON.parse(
    twitterService.fetch(
      `https://api.twitter.com/1.1/followers/ids.json?screen_name=${screenName}&count=5000&cursor=${nextCursor}&stringify_ids=true`
    )
  )

// Requests / 15-min window (user auth)	900 ref: https://developer.twitter.com/en/docs/tweets/timelines/api-reference/get-statuses-user_timeline.html
export const getUserTimeLine = userId =>
  JSON.parse(
    twitterService.fetch(
      `https://api.twitter.com/1.1/statuses/user_timeline.json?user_id=${userId}&exclude_replies=true&include_rts=false`
    )
  )

export const show = idStr =>
  JSON.parse(twitterService.fetch(`https://api.twitter.com/1.1/statuses/show.json?id=${idStr}`))

export const favorite = idStr =>
  twitterService.fetch(`https://api.twitter.com/1.1/favorites/create.json?id=${idStr}`, {
    method: 'post'
  })
