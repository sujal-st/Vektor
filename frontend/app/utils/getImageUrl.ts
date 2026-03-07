export function getImageUrl(img: string): string {
    if (!img) return ""
    if (img.startsWith("https")) {
        return img  
    }
    return `${import.meta.env.VITE_API_URL}${img}`  // local URL
}