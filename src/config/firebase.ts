export const ANDROID_FCM_CONFIG = {
  ttl: 3600 * 1000,
  priority: 'high',
  // sound: 'request.mp3',
  notification: {
    // icon: 'stock_ticker_update',
    color: '#f45342'
  }
}
export const getApnsFcmConfig = (title, body) => {
  return {
    payload: {
      aps: {
        alert: {
          title,
          body
        },
        badge: 0,
        sound: 'default'
      }
    }
  }
}
