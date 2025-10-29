import { createAvatar } from '@dicebear/core'
import { thumbs } from '@dicebear/collection'

export const generateAvatarDataUri = (seed: string) => {
  const svg = createAvatar(thumbs, {
    seed,
    backgroundType: ['gradientLinear'],
    backgroundRotation: [0, 45, 90, 135],
    radius: 50
  }).toString()

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
}
