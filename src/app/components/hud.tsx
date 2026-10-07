"use client"
import { useEffect, useMemo, useRef, useState } from "react"
import LeftInfo from "./leftInfo"
import Focus from "./focus"
import AlbumSelector from "./albumSelector"
import type { Photo } from "@/lib/immich"

interface hudProps {
    photos: Photo[]
}

export default function Hud({ photos }: hudProps) {
    // null = todos los álbumes
    const [album, setAlbum] = useState<string | null>(null)
    const [active, setActive] = useState(0)
    const scrollerRef = useRef<HTMLDivElement>(null)

    const albums = useMemo(() => [...new Set(photos.map(photo => photo.album))], [photos])
    const visible = useMemo(() => album ? photos.filter(photo => photo.album === album) : photos, [photos, album])

    // La foto activa es la que ocupa la mayor parte de la pantalla: el HUD muestra sus datos
    useEffect(() => {
        const scroller = scrollerRef.current
        if (!scroller) return
        const observer = new IntersectionObserver(entries => {
            for (const entry of entries) {
                if (entry.isIntersecting) setActive(Number((entry.target as HTMLElement).dataset.index))
            }
        }, { root: scroller, threshold: 0.6 })
        for (const section of scroller.children) observer.observe(section)
        return () => observer.disconnect()
    }, [visible])

    const selectAlbum = (next: string | null) => {
        setAlbum(next)
        setActive(0)
    }

    const photo = visible[Math.min(active, visible.length - 1)]
    return (

        <div className="relative h-screen">

            {/* El HUD va por encima sin capturar el ratón, para que la rueda llegue al scroll de fotos */}
            <div className="z-30 absolute w-full pointer-events-none">
                <header className="grid grid-cols-4 font-mono p-5  relative pb-10 h-30">
                    <span className="absolute inset-0 -z-10 bg-linear-to-b from-black/75 to-transparent mask-[linear-gradient(to_right,transparent,black_10rem)]"></span>
                    <div className="">
                        <p>[Txuli]</p>
                        <p className="text-white/75 text-sm">Photography Portfolio</p>
                    </div>
                    <AlbumSelector albums={albums} selected={album} onSelect={selectAlbum} />
                    <div className="col-start-4 flex grid-cols-10 items-baseline text-sm ">
                        <div className="border w-fit p-1 flex  mr-3.5">{photo.stats.format}</div>
                        <div className="col-start-2">
                            {photo.stats.megapixels}
                        </div>
                    </div>
                </header>


            </div>
            {/* La key reinicia el scroll y relanza la entrada al cambiar de álbum */}
            <div key={album ?? "all"} ref={scrollerRef} className="h-screen overflow-y-auto snap-y snap-mandatory scrollbar-none animate-album-in motion-reduce:animate-none">
                {visible.map((photo, index) => (
                    <Focus key={`${photo.album}/${photo.id}`} photo={photo} index={index} active={index === active} />
                ))}
            </div>
            <LeftInfo stats={photo.stats} album={photo.album} frame={active + 1} total={visible.length} />
        </div>
    )
}
