import React from "react";

interface infoProps{
    title:string,
    data:string,
    className?:string
}
const  Info:React.FC<infoProps>=({title,data,className=""}) => {
    return (
        <div className={`font-mono mb-1 min-w-0 md:mb-3 ${className}`}>
            <h4 className="text-[10px] text-gray-400/50 md:text-[13px]">
                {title}
            </h4>
            {/* La key relanza la animación cada vez que cambia el dato */}
            <p key={data} className="animate-hud-in motion-reduce:animate-none wrap-break-word text-sm md:text-base">
                {data}
            </p>
        </div>
    )
}
export default Info
