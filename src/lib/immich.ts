// Cliente de Immich. Sólo para el servidor: usa la API key, que no debe llegar al navegador.
// Los client components sólo pueden importar de aquí los tipos.

export const PHOTO_SIZES = ["thumbnail", "preview", "fullsize"] as const
export type PhotoSize = (typeof PHOTO_SIZES)[number]

export interface ImmichAsset {
    id: string
    type: string
    originalFileName: string
    thumbhash: string | null
    
    localDateTime?: string | null
    exifInfo?: {
        exifImageWidth?: number | null
        exifImageHeight?: number | null
        orientation?: string | null
        make?: string | null
        model?: string | null
        lensModel?: string | null
        fNumber?: number | null
        focalLength?: number | null
        iso?: number | null
        exposureTime?: string | null
    }
}

// Lo que necesita el HUD de cada foto, ya listo para pasar al cliente
export interface Photo {
    id: string
    album: string
    lowSrc: string
    highSrc: string
    width: number
    height: number
    
    minuteOfDay: number | null
    stats: PhotoStats
}


const PUBLIC_TAG = "#portfolio"


const ALBUM_REVALIDATE = 200

export function immichFetch(path: string, init?: RequestInit) {
    const baseUrl = process.env.IMMICH_URL
    const apiKey = process.env.IMMICH_API_KEY
    if (!baseUrl || !apiKey) {
        throw new Error("Faltan IMMICH_URL o IMMICH_API_KEY en el .env")
    }
    return fetch(`${baseUrl.replace(/\/$/, "")}/api${path}`, {
        ...init,
        headers: { ...init?.headers, "x-api-key": apiKey },
    })
}


async function getPublicAlbums() {
    const res = await immichFetch("/albums", {
        headers: { Accept: "application/json" },
        next: { revalidate: ALBUM_REVALIDATE },
    })
    if (!res.ok) {
        throw new Error(`Immich respondió ${res.status} al pedir la lista de álbumes`)
    }
    const albums: { id: string, albumName: string, description: string | null }[] = await res.json()
    return albums.filter(album => album.description?.toLowerCase().includes(PUBLIC_TAG))
}

// GET /albums/{id} ya no trae los assets (Immich 3): se piden con la búsqueda por álbum, página a página
async function getAlbumAssets(albumId: string): Promise<ImmichAsset[]> {
    const assets: ImmichAsset[] = []
    let page: string | null = "1"
    while (page) {
        const res = await immichFetch("/search/metadata", {
            method: "POST",
            headers: { Accept: "application/json", "Content-Type": "application/json" },
            body: JSON.stringify({ albumIds: [albumId], type: "IMAGE", withExif: true, size: 1000, page: Number(page) }),
            next: { revalidate: ALBUM_REVALIDATE },
        })
        if (!res.ok) {
            throw new Error(`Immich respondió ${res.status} al pedir las fotos del álbum ${albumId}`)
        }
        const result: { assets: { items: ImmichAsset[], nextPage: string | null } } = await res.json()
        assets.push(...result.assets.items)
        page = result.assets.nextPage
    }
    return assets
}

// Todas las fotos de los álbumes públicos. Sin Immich configurado no hay ninguna (se usa la foto de prueba)
export async function getPublicPhotos(): Promise<Photo[]> {
    if (!process.env.IMMICH_URL || !process.env.IMMICH_API_KEY) return []
    const albums = await getPublicAlbums()
    const photos = await Promise.all(albums.map(async album => {
        const assets = await getAlbumAssets(album.id)
        return assets.map(asset => toPhoto(asset, album.albumName))
    }))
    return photos.flat()
}

// El proxy de imágenes lo usa para no servir nada que esté fuera de los álbumes públicos
export async function isPublicPhoto(id: string) {
    const photos = await getPublicPhotos()
    return photos.some(photo => photo.id === id)
}

function toPhoto(asset: ImmichAsset, album: string): Photo {
    return {
        id: asset.id,
        album,
        lowSrc: photoUrl(asset.id, "thumbnail"),
        highSrc: photoUrl(asset.id, "preview"),
        ...getDisplaySize(asset),
        minuteOfDay: getMinuteOfDay(asset),
        stats: getStats(asset),
    }
}

function getMinuteOfDay(asset: ImmichAsset) {
    const time = asset.localDateTime?.match(/T(\d{2}):(\d{2})/)
    return time ? Number(time[1]) * 60 + Number(time[2]) : null
}

// Dimensiones tal y como se ve la foto. El EXIF guarda las del archivo en bruto:
// con orientación 5-8 la imagen está girada 90° y hay que intercambiar ancho y alto.
function getDisplaySize(asset: ImmichAsset) {
    const width = asset.exifInfo?.exifImageWidth ?? 3
    const height = asset.exifInfo?.exifImageHeight ?? 2
    const rotated = Number(asset.exifInfo?.orientation) >= 5
    return rotated ? { width: height, height: width } : { width, height }
}

// Datos de la toma ya formateados para el HUD. Si la foto no trae un dato, se pone una broma en su lugar
function getStats(asset: ImmichAsset) {
    const exif = asset.exifInfo ?? {}
    const megapixels = exif.exifImageWidth && exif.exifImageHeight
        ? Math.round(exif.exifImageWidth * exif.exifImageHeight / 1e6)
        : null
    const extension = asset.originalFileName.includes(".") ? asset.originalFileName.split(".").pop() : null
    return {
        time: asset.localDateTime?.match(/T(\d{2}:\d{2})/)?.[1] ?? "who knows",
        shutter: exif.exposureTime ?? "one blink",
        aperture: exif.fNumber ? `f/${exif.fNumber}` : "f/pupil",
        iso: exif.iso ? String(exif.iso) : "pure vibes",
        focal: exif.focalLength ? `${Math.round(exif.focalLength)}mm` : "arm's length",
        lens: exif.lensModel ?? "your own eye",
        format: extension?.toUpperCase() ?? "???",
        megapixels: megapixels ? `${megapixels} MP` : "∞ MP",
    }
}

export type PhotoStats = ReturnType<typeof getStats>

// URL del proxy propio (src/app/api/photo/[id]/route.ts), válida en el navegador.
function photoUrl(id: string, size: PhotoSize) {
    return `/api/photo/${id}?size=${size}`
}
