import Info from "./info"
import type { PhotoStats } from "@/lib/immich"

interface leftInfoProps {
    stats: PhotoStats,
    album: string,
    frame: number,
    total: number
}
export default function LeftInfo({ stats, album, frame, total }: leftInfoProps) {
    const digits = String(total).length
    return (
        <div className="pointer-events-none">
            {/* Escritorio: datos de la toma en un panel a la izquierda */}
            <div className=" bg-linear-to-r  hidden md:grid grid-rows-3 absolute inset-y-0 left-0 w-40 z-20 pl-5">
                <div className="row-start-2">
                    <Info title="SHUTTER" data={stats.shutter} />
                    <Info title="APERTURE" data={stats.aperture} />
                    <Info title="ISO" data={stats.iso} />
                    <Info title="FOCAL" data={stats.focal} />
                    <Info title="LENS" data={stats.lens} />
                </div>

            </div>
            {/* Pie. En móvil no cabe el panel lateral: los datos de la toma bajan aquí, en una rejilla sobre un degradado */}
            <div className="absolute z-20 bottom-0 left-0 w-full px-5 pt-6 pb-2 grid grid-cols-4 gap-x-3 bg-linear-to-t from-black/75 to-transparent md:w-auto md:pt-0 md:pr-0 md:flex md:gap-10 md:bg-none">
                <Info title="SHUTTER" data={stats.shutter} className="md:hidden" />
                <Info title="APERTURE" data={stats.aperture} className="md:hidden" />
                <Info title="ISO" data={stats.iso} className="md:hidden" />
                <Info title="FOCAL" data={stats.focal} className="md:hidden" />
                <Info title="LENS" data={stats.lens} className="col-span-4 *:truncate md:hidden" />
                <Info title="ALBUM" data={album} className="col-span-2 *:truncate" />
                <Info title="FRAME" data={`${String(frame).padStart(digits, "0")} / ${total}`} />
                <Info title="TIME" data={stats.time} />
            </div>
        </div>
    )
}
