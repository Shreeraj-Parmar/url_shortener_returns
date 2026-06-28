export const generateShortUrl = () => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    let shortUrl = ''
    for (let i = 0; i < 6; i++) {
        shortUrl += characters.charAt(Math.floor(Math.random() * characters.length))
    }
    return shortUrl
}