/* eslint-disable @next/next/no-img-element -- Immich ya sirve los tamaños redimensionados */
import ProgressivePhoto from "./progressivePhoto"
import type { Photo } from "@/lib/immich"

interface focusProps {
    photo: Photo,
    index: number,
    active: boolean,
    expanded: boolean,
    onToggleFullscreen: () => void
}

export default function Focus({ photo, index, active, expanded, onToggleFullscreen }: focusProps) {
    // Sólo la primera foto se carga de inmediato; el resto, al acercarse con el scroll
    const loading = index === 0 ? "eager" : "lazy"
    return (
        // photo-slot (globals.css) define el hueco libre para la foto según el tamaño de pantalla
        <section data-index={index} data-expanded={expanded}
            className="photo-slot relative flex h-dvh snap-start items-center justify-center overflow-hidden bg-neutral-900 z-10">

            {/* El resto de la pantalla se rellena con la propia foto, desenfocada y oscurecida */}
            <img src={photo.lowSrc} alt="" aria-hidden loading={loading}
                className="absolute inset-0 h-full w-full scale-125 object-cover blur-3xl brightness-50 saturate-150" />

            {/* Caja con la proporción de la foto, lo más grande que quepa en el hueco: la foto nunca se recorta */}
            {/* Al pasar a ser la foto activa se acerca y se aclara, como al enfocar */}
            <div onClick={onToggleFullscreen}
                className={`relative overflow-hidden transition-[height,scale,opacity] duration-700 ease-out motion-reduce:transition-none ${expanded ? "cursor-zoom-out" : "cursor-zoom-in"} ${active ? "scale-100 opacity-100" : "scale-[.96] opacity-40"}`}
                style={{
                    aspectRatio: `${photo.width} / ${photo.height}`,
                    height: `min(var(--photo-max-h), calc(var(--photo-max-w) * ${photo.height / photo.width}))`,
                }}>
                <ProgressivePhoto lowSrc={photo.lowSrc} highSrc={photo.highSrc} loading={loading} />

                {/* El marco usa inset-0: siempre coincide con la foto */}
                <div className={`pointer-events-none absolute inset-0 text-[#EDEDE6] transition-opacity duration-500 ${expanded ? "opacity-0" : "opacity-100"}`}>
                    <span className="absolute inset-y-0 left-1/3 w-px bg-current/15" />
                    <span className="absolute inset-y-0 left-2/3 w-px bg-current/15" />
                    <span className="absolute inset-x-0 top-1/3 h-px bg-current/15" />
                    <span className="absolute inset-x-0 top-2/3 h-px bg-current/15" />
                    <span className="absolute left-0 top-0 size-5 border-l-2 border-t-2 border-current md:size-8" />
                    <span className="absolute right-0 top-0 size-5 border-r-2 border-t-2 border-current md:size-8" />
                    <span className="absolute bottom-0 left-0 size-5 border-b-2 border-l-2 border-current md:size-8" />
                    <span className="absolute bottom-0 right-0 size-5 border-b-2 border-r-2 border-current md:size-8" />
                </div>
            </div>
        </section>
    )
}
