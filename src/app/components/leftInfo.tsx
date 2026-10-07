import Info from "./info"
export default function LeftInfo() {
    return (
        <div>
            <div className=" bg-linear-to-r from-black/75 to-transparent grid grid-rows-3 absolute inset-y-0 left-0 w-40 z-20 pl-5">
                <div className="row-start-2">
                    <Info title="SHUTTER" data="1/50" />
                    <Info title="APERTURE" data="f-8" />
                    <Info title="ISO" data="100" />
                    <Info title="FOCAL" data="50mm" />
                    <Info title="LENS" data="test" />
                </div>

            </div>
            <div className="absolute z-20 bottom-0">
                
            </div>
        </div>
    )
}