"use client"
import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react"
import LeftInfo from "./leftInfo"
import Focus from "./focus"
import AlbumSelector from "./albumSelector"
import type { Photo } from "@/lib/immich"

// Minuto del día (0-1439) en el reloj del visitante, fijado al cargar la página
let minuteAtLoad: number | null = null
const getMinuteAtLoad = () => {
    if (minuteAtLoad === null) {
        const date = new Date()
        minuteAtLoad = date.getHours() * 60 + date.getMinutes()
    }
    return minuteAtLoad
}
const subscribeNever = () => () => { }

// Tiempo sin actividad antes de pasar sola a la siguiente foto, y entre una foto y la siguiente
const AUTO_SCROLL_MS = 7000
// Lo que tarda en deslizarse de una foto a la siguiente
const AUTO_SCROLL_GLIDE_MS = 2200
// Fundido de salida y de entrada al volver de la última foto a la primera
const AUTO_SCROLL_FADE_MS = 900

interface hudProps {
    photos: Photo[]
}

export default function Hud({ photos }: hudProps) {
    // null = todos los álbumes
    const [album, setAlbum] = useState<string | null>(null)
    const [active, setActive] = useState(0)
    const scrollerRef = useRef<HTMLDivElement>(null)

    const albums = useMemo(() => [...new Set(photos.map(photo => photo.album))], [photos])

    // La hora del visitante sólo se conoce en el navegador: en el servidor (y al hidratar) es null
    const now = useSyncExternalStore(subscribeNever, getMinuteAtLoad, () => null)

    // Primero las fotos hechas a una hora parecida a la actual; las que no tienen hora van al final
    const visible = useMemo(() => {
        const list = album ? photos.filter(photo => photo.album === album) : photos
        if (now === null) return list
        const distance = (photo: Photo) => {
            if (photo.minuteOfDay === null) return Infinity
            const diff = Math.abs(photo.minuteOfDay - now)
            return Math.min(diff, 1440 - diff)
        }
        return [...list].sort((a, b) => distance(a) - distance(b))
    }, [photos, album, now])

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

    // Salvapantallas: sin actividad del visitante, pasa sola a la foto siguiente y al llegar al final vuelve a empezar.
    // Cualquier interacción reinicia la cuenta, así que nunca se mueve mientras alguien está usando la página.
    useEffect(() => {
        const scroller = scrollerRef.current
        if (!scroller || visible.length < 2) return
        let timer: number
        let frame = 0
        let fade: Animation | null = null

        // Deslizamiento lento y suavizado. El "smooth" del navegador es demasiado rápido para un salvapantallas
        const glideTo = (target: number) => {
            const start = scroller.scrollTop
            const startTime = performance.now()
            // El anclaje pelearía con cada paso de la animación: se quita mientras dura
            scroller.style.scrollSnapType = "none"
            const step = (time: number) => {
                const progress = Math.min((time - startTime) / AUTO_SCROLL_GLIDE_MS, 1)
                const eased = progress < 0.5 ? 4 * progress ** 3 : 1 - (-2 * progress + 2) ** 3 / 2
                scroller.scrollTop = start + (target - start) * eased
                if (progress < 1) {
                    frame = requestAnimationFrame(step)
                } else {
                    scroller.style.scrollSnapType = ""
                }
            }
            frame = requestAnimationFrame(step)
        }

        // La vuelta al principio no se desliza por todas las fotos: funde a negro, salta y vuelve a aparecer
        const fadeTo = (target: number) => {
            fade = scroller.animate([{ opacity: 1 }, { opacity: 0 }], { duration: AUTO_SCROLL_FADE_MS, easing: "ease-in", fill: "forwards" })
            fade.onfinish = () => {
                scroller.scrollTop = target
                fade?.cancel()
                fade = scroller.animate([{ opacity: 0 }, { opacity: 1 }], { duration: AUTO_SCROLL_FADE_MS, easing: "ease-out" })
            }
        }

        const stopAnimations = () => {
            cancelAnimationFrame(frame)
            scroller.style.scrollSnapType = ""
            if (fade) {
                fade.onfinish = null
                fade.cancel()
                fade = null
            }
        }

        const advance = () => {
            if (!document.hidden) {
                const current = Math.round(scroller.scrollTop / scroller.clientHeight)
                const next = (current + 1) % visible.length
                const target = next * scroller.clientHeight
                if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
                    scroller.scrollTop = target
                } else if (next === 0) {
                    fadeTo(target)
                } else {
                    glideTo(target)
                }
            }
            timer = window.setTimeout(advance, AUTO_SCROLL_MS)
        }
        const restart = () => {
            window.clearTimeout(timer)
            stopAnimations()
            timer = window.setTimeout(advance, AUTO_SCROLL_MS)
        }
        restart()
        const activity = ["wheel", "touchstart", "keydown", "pointerdown", "pointermove"] as const
        for (const event of activity) window.addEventListener(event, restart, { passive: true })
        return () => {
            window.clearTimeout(timer)
            stopAnimations()
            for (const event of activity) window.removeEventListener(event, restart)
        }
    }, [visible])

    const selectAlbum = (next: string | null) => {
        setAlbum(next)
        setActive(0)
    }

    // Pantalla completa: se oculta el HUD y la foto ocupa todo. Se sale con otro click o con Esc
    const [expanded, setExpanded] = useState(false)
    const rootRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const onChange = () => setExpanded(document.fullscreenElement !== null)
        document.addEventListener("fullscreenchange", onChange)
        return () => document.removeEventListener("fullscreenchange", onChange)
    }, [])

    const toggleFullscreen = () => {
        if (document.fullscreenElement) {
            document.exitFullscreen()
        } else if (expanded) {
            setExpanded(false)
        } else if (rootRef.current?.requestFullscreen) {
            // Si el navegador lo rechaza, al menos se amplía dentro de la página
            rootRef.current.requestFullscreen().catch(() => setExpanded(true))
        } else {
            // iPhone no permite pantalla completa de un elemento
            setExpanded(true)
        }
    }

    const hudVisibility = `transition-[opacity,visibility] duration-500 ${expanded || now === null ? "invisible opacity-0" : "visible opacity-100"}`

    const photo = visible[Math.min(active, visible.length - 1)]
    return (

        <div ref={rootRef} className="relative h-dvh bg-black">

            {/* El HUD va por encima sin capturar el ratón, para que la rueda llegue al scroll de fotos */}
            <div className={`z-30 absolute w-full pointer-events-none ${hudVisibility}`}>
                {/* Móvil: título y formato arriba, álbumes debajo. Escritorio: todo en una fila de 4 columnas */}
                <header className="grid grid-cols-2 gap-y-2 font-mono p-5  relative pb-10 md:grid-cols-4 md:h-30">
                    <span className="absolute inset-0 -z-10 bg-linear-to-b from-black/75 to-transparent md:mask-[linear-gradient(to_right,transparent,black_10rem)]"></span>
                    <div className="">
                        <p>[Txuli]</p>
                        <p className="text-white/75 text-sm">Photography Portfolio</p>
                    </div>
                    <AlbumSelector albums={albums} selected={album} onSelect={selectAlbum} />
                    <div className="col-start-2 row-start-1 flex items-baseline justify-self-end text-sm md:col-start-4 md:justify-self-start">
                        <div className="border w-fit p-1 flex  mr-3.5">{photo.stats.format}</div>
                        <div className="col-start-2">
                            {photo.stats.megapixels}
                        </div>
                    </div>
                </header>


            </div>
            {/* La key reinicia el scroll y relanza la entrada al cambiar de álbum */}
            <div key={album ?? "all"} ref={scrollerRef} className="h-dvh overflow-y-auto snap-y snap-mandatory scrollbar-none animate-album-in motion-reduce:animate-none">
                {/* Hasta saber la hora no se pinta ninguna foto, para no cargar una y cambiarla al instante */}
                {now !== null && visible.map((photo, index) => (
                    <Focus key={`${photo.album}/${photo.id}`} photo={photo} index={index} active={index === active}
                        expanded={expanded} onToggleFullscreen={toggleFullscreen} />
                ))}
            </div>
            <div className={hudVisibility}>
                <LeftInfo stats={photo.stats} album={photo.album} frame={active + 1} total={visible.length} />
            </div>
        </div>
    )
}
