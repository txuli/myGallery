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
            <div className=" bg-linear-to-r from-black/75 to-transparent grid grid-rows-3 absolute inset-y-0 left-0 w-40 z-20 pl-5">
                <div className="row-start-2">
                    <Info title="SHUTTER" data={stats.shutter} />
                    <Info title="APERTURE" data={stats.aperture} />
                    <Info title="ISO" data={stats.iso} />
                    <Info title="FOCAL" data={stats.focal} />
                    <Info title="LENS" data={stats.lens} />
                </div>

            </div>
            <div className="absolute z-20 bottom-0 left-0 pl-5 pb-2 flex gap-10">
                <Info title="ALBUM" data={album} />
                <Info title="FRAME" data={`${String(frame).padStart(digits, "0")} / ${total}`} />
            </div>
        </div>
    )
}
