import type { NextRequest } from "next/server"
import { immichFetch, isPublicPhoto, PHOTO_SIZES, type PhotoSize } from "@/lib/immich"

const PHOTO_REVALIDATE = 86400

const UUID =/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

// Proxy de imágenes: añade la API key en el servidor y reenvía la respuesta de Immich.
export async function GET(req: NextRequest, ctx: RouteContext<"/api/photo/[id]">) {
    const { id } = await ctx.params
    const size = req.nextUrl.searchParams.get("size") ?? "preview"

    if (!UUID.test(id) || !PHOTO_SIZES.includes(size as PhotoSize)) {
        return new Response("Petición no válida", { status: 400 })
    }

    // La API key ve toda la galería: sólo se sirven las fotos de los álbumes públicos
    if (!(await isPublicPhoto(id))) {
        return new Response(null, { status: 404 })
    }

    // La imagen se guarda en la caché de datos de Next: Immich sólo la sirve una vez al día por foto y tamaño
    const res = await immichFetch(`/assets/${id}/thumbnail?size=${size}`, {
        next: { revalidate: PHOTO_REVALIDATE },
    })
    if (!res.ok) {
        console.error(`Immich respondió ${res.status} al pedir la foto ${id} (${size})`)
        return new Response(null, { status: res.status })
    }

    return new Response(res.body, {
        headers: {
            "Content-Type": res.headers.get("Content-Type") ?? "image/jpeg",
            "Cache-Control": `public, max-age=${PHOTO_REVALIDATE}, stale-while-revalidate=604800`,
        },
    })
}
