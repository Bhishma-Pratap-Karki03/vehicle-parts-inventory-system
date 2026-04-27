const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME as string | undefined

type CloudinaryImageOptions = {
  width?: number
  height?: number
  crop?: string
  quality?: string | number
  format?: string
}

export function getCloudinaryImageUrl(publicId?: null | string, options: CloudinaryImageOptions = {}) {
  if (!publicId || !cloudName) {
    return null
  }

  const {
    width = 1200,
    height = 800,
    crop = 'fill',
    quality = 'auto',
    format = 'auto',
  } = options

  const transformations = [`w_${width}`, `h_${height}`, `c_${crop}`, `q_${quality}`, `f_${format}`].join(',')

  return `https://res.cloudinary.com/${cloudName}/image/upload/${transformations}/${publicId}`
}
