import LeftInfo from "./leftInfo"
import Focus from "./focus"

export default function Hud() {
    return (

        <div className="relative h-screen">
            
            
            <div className="z-30 absolute w-full ">
                <header className="grid grid-cols-4 font-mono p-5  relative pb-10 h-30">
                    <span className="absolute inset-0 -z-10 bg-linear-to-b from-black/75 to-transparent mask-[linear-gradient(to_right,transparent,black_10rem)]"></span>
                    <div className="">
                        <p>[Txuli]</p>
                        <p className="text-white/75 text-sm">Photography Portfolio</p>
                    </div>
                    <div className="col-start-4 flex grid-cols-10 items-baseline text-sm ">
                        <div className="border w-fit p-1 flex  mr-3.5">ARW</div>
                        <div className="col-start-2">
                            23 MP
                        </div>
                    </div>
                </header>
                

            </div>
            <Focus />
            <LeftInfo />
        </div>
    )
}