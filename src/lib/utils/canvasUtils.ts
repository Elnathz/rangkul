export const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image()
    image.addEventListener('load', () => resolve(image))
    image.addEventListener('error', (error) => reject(error))
    image.setAttribute('crossOrigin', 'anonymous')
    image.src = url
  })

export async function getCroppedImg(
  imageSrc: string,
  pixelCrop: { x: number; y: number; width: number; height: number },
  rotation = 0,
  flip = { horizontal: false, vertical: false }
): Promise<File | null> {
  const image = await createImage(imageSrc)
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')

  if (!ctx) {
    return null
  }

  // Calculate bounding box of the rotated image
  const rotRad = (rotation * Math.PI) / 180
  const width = image.width
  const height = image.height

  canvas.width = pixelCrop.width
  canvas.height = pixelCrop.height

  ctx.translate(
    -pixelCrop.x,
    -pixelCrop.y
  )

  ctx.drawImage(
    image,
    0,
    0
  )

  return new Promise((resolve, reject) => {
    canvas.toBlob((file) => {
      if (file) {
        resolve(new File([file], 'cropped.jpg', { type: 'image/jpeg' }))
      } else {
        reject(new Error('Canvas is empty'))
      }
    }, 'image/jpeg')
  })
}
