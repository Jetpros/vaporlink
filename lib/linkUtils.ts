// Utility functions for link extraction and handling

export function extractLinks(text: string): string[] {
  // Regular expression to match URLs
  const urlRegex = /(https?:\/\/[^\s]+)/g
  const matches = text.match(urlRegex)
  return matches || []
}

export function isValidUrl(text: string): boolean {
  try {
    new URL(text)
    return true
  } catch {
    return false
  }
}

export function getDomain(url: string): string {
  try {
    const urlObj = new URL(url)
    return urlObj.hostname
  } catch {
    return url
  }
}

export function extractAllLinksFromMessages(messages: any[]): Array<{
  url: string
  domain: string
  messageId: string
  createdAt: Date
}> {
  const links: Array<{ url: string; domain: string; messageId: string; createdAt: Date }> = []

  messages.forEach((msg) => {
    if (msg.type === 'text' && msg.content) {
      const extractedLinks = extractLinks(msg.content)
      extractedLinks.forEach((url) => {
        links.push({
          url,
          domain: getDomain(url),
          messageId: msg.id,
          createdAt: msg.createdAt,
        })
      })
    }
  })

  return links
}
