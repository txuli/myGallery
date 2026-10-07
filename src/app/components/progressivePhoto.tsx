"use client"
/* eslint-disable @next/next/no-img-element -- Immich ya sirve los tamaños redimensionados */
import { useEffect, useRef, useState } from "react"

interface progressivePhotoProps {
    lowSrc: string,
    highSrc: string,
    alt?: string,
    loading?: "eager" | "lazy"
}

// Dos capas que llenan al contenedor: la ligera se ve al instante y la pesada
// aparece encima cuando termina de descargar, pasando de desenfocada a nítida.
export default function ProgressivePhoto({ lowSrc, highSrc, alt = "", loading = "eager" }: progressivePhotoProps) {
    const [loaded, setLoaded] = useState(false)
    const highRef = useRef<HTMLImageElement>(null)

    // Si la imagen ya estaba en caché, onLoad puede dispararse antes de la hidratación
    useEffect(() => {
        const img = highRef.current
        if (img?.complete && img.naturalWidth > 0) setLoaded(true)
    }, [])

    return (
        <>
            {/* La miniatura va desenfocada para que no se vea pixelada; el scale tapa los bordes del blur */}
            <img src={lowSrc} alt="" aria-hidden loading={loading} className="absolute inset-0 h-full w-full scale-110 object-cover blur-xl" />
            <img ref={highRef} src={highSrc} alt={alt} loading={loading} onLoad={() => setLoaded(true)}
                className={`absolute inset-0 h-full w-full object-cover transition duration-1000 ease-out motion-reduce:transition-none ${loaded ? "scale-100 opacity-100 blur-none" : "scale-105 opacity-0 blur-md"}`} />
        </>
    )
}
