/* eslint-disable @next/next/no-img-element -- Immich ya sirve los tamaños redimensionados */
import ProgressivePhoto from "./progressivePhoto"
import type { Photo } from "@/lib/immich"

interface focusProps {
    photo: Photo,
    index: number,
    active: boolean
}

// Hueco máximo para la foto: deja libre el texto de la cabecera y del pie.
// A los lados sólo queda un margen pequeño: el panel de datos se superpone a la foto.
const MAX_HEIGHT = "(100vh - 128px)"
const MAX_WIDTH = "(100vw - 2 * clamp(24px, 5vw, 72px))"

export default function Focus({ photo, index, active }: focusProps) {
    // Sólo la primera foto se carga de inmediato; el resto, al acercarse con el scroll
    const loading = index === 0 ? "eager" : "lazy"
    return (
        <section data-index={index} className="relative flex h-screen snap-start items-center justify-center overflow-hidden bg-neutral-900 z-10">

            {/* El resto de la pantalla se rellena con la propia foto, desenfocada y oscurecida */}
            <img src={photo.lowSrc} alt="" aria-hidden loading={loading}
                className="absolute inset-0 h-full w-full scale-125 object-cover blur-3xl brightness-50 saturate-150" />

            {/* Caja con la proporción de la foto, lo más grande que quepa en el hueco: la foto nunca se recorta */}
            {/* Al pasar a ser la foto activa se acerca y se aclara, como al enfocar */}
            <div className={`relative overflow-hidden transition duration-700 ease-out motion-reduce:transition-none ${active ? "scale-100 opacity-100" : "scale-[.96] opacity-40"}`}
                style={{
                    aspectRatio: `${photo.width} / ${photo.height}`,
                    height: `min(calc(${MAX_HEIGHT}), calc(${MAX_WIDTH} * ${photo.height / photo.width}))`,
                }}>
                <ProgressivePhoto lowSrc={photo.lowSrc} highSrc={photo.highSrc} loading={loading} />

                {/* El marco usa inset-0: siempre coincide con la foto */}
                <div className="pointer-events-none absolute inset-0 text-[#EDEDE6]">
                    <span className="absolute inset-y-0 left-1/3 w-px bg-current/15" />
                    <span className="absolute inset-y-0 left-2/3 w-px bg-current/15" />
                    <span className="absolute inset-x-0 top-1/3 h-px bg-current/15" />
                    <span className="absolute inset-x-0 top-2/3 h-px bg-current/15" />
                    <span className="absolute left-0 top-0 size-8 border-l-2 border-t-2 border-current" />
                    <span className="absolute right-0 top-0 size-8 border-r-2 border-t-2 border-current" />
                    <span className="absolute bottom-0 left-0 size-8 border-b-2 border-l-2 border-current" />
                    <span className="absolute bottom-0 right-0 size-8 border-b-2 border-r-2 border-current" />
                </div>
            </div>
        </section>
    )
}
