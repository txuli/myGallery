import Image from "next/image"
import photo from "../../../public/mocI.jpg"
import photo2 from "../../../public/vertical.jpg"
/* interface imgProps{
    imgSrc:
}
interface focusProps{

} */
export default async  function Focus() {
    const isLandscape = photo2.width > photo2.height
    return (
        <section className="relative flex h-screen items-center justify-center overflow-hidden bg-black z-10">
            
            {!isLandscape && (
                <Image src={photo2} alt="" aria-hidden
                    className="absolute inset-0 h-full w-full scale-110 object-cover blur-3xl brightness-[.35]" />
            )}

            
            <div className={isLandscape ? "absolute inset-0" : "relative inline-block"}>
                <Image src={photo2} alt=""
                    className={isLandscape
                        ? "h-full w-full object-cover"
                        : "block h-auto w-auto max-h-[calc(100vh-176px)] max-w-[calc(100vw-112px)]"} />

                
                <div className={`pointer-events-none absolute text-[#EDEDE6] ${isLandscape ? "inset-x-[clamp(56px,7vw,120px)] inset-y-24" : "inset-0"}`}>
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
