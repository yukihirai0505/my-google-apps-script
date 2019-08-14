import { getProperty } from './props'

const YOUTUBE_API_KEY = getProperty('YOUTUBE_API_KEY')
const YOUTUBE_API_URL = 'https://www.googleapis.com/youtube/v3/'

const objectToURLParams = obj =>
  Object.keys(obj)
    .map(key => `${key}=${obj[key]}`)
    .join('&')

const fetchYouTubeAPI = (path, method = 'GET', params = {}) => {
  const effectiveURL = `${YOUTUBE_API_URL}${path}`
  Logger.log(effectiveURL)
  if (method === 'POST') {
    const options = {
      method,
      payload: JSON.stringify(params)
    }
    return JSON.parse(UrlFetchApp.fetch(effectiveURL, options).getContentText())
  }
  return JSON.parse(UrlFetchApp.fetch(effectiveURL).getContentText())
}

// const getPlaylists = () => {
//   const params = {
//     part: 'snippet',
//     channelId: 'UClcWgUnEr79fJBcpqnm4M1w',
//     key: YOUTUBE_API_KEY
//   }
//   return fetchYouTubeAPI(`playlists?${objectToURLParams(params)}`)
// }

const search = keyword => {
  const params = {
    part: 'snippet',
    type: 'video',
    q: keyword,
    key: YOUTUBE_API_KEY
  }
  return fetchYouTubeAPI(`search?${objectToURLParams(params)}`)
}

const addVideoToPlayList = (playlistId, videoId) => {
  const params = {
    part: 'snippet',
    snippet: {
      playlistId,
      resourceId: {
        kind: 'youtube#video',
        videoId
      }
    },
    key: YOUTUBE_API_KEY
  }
  return fetchYouTubeAPI(`playlistItems`, 'POST', params)
}

global.myFunction = () => {
  const playlistId = 'PL6PYiidluarem14O1XMTFeSCZSUvhpIVt'
  const searchKeywords = [
    'ICHIDAIJI'
    // 'DENKOUSEKKA',
    // 'オトシマエ',
    // 'エレクトリック・パブリック',
    // '阿吽',
    // 'ラブコール'
  ]
  searchKeywords.forEach(keyword => {
    const searchResult = search(keyword).items
    if (searchResult && searchResult[0]) {
      const firstVideoId = searchResult[0].id.videoId
      Logger.log(playlistId)
      Logger.log(firstVideoId)
      // TODO: need to OAuth2.0 maybe...
      addVideoToPlayList(playlistId, firstVideoId)
    }
  })
}
