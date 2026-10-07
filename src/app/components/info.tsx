import React from "react";

interface infoProps{
    title:string,
    data:string
}
const  Info:React.FC<infoProps>=({title,data}) => {
    return (
        <div className="font-mono mb-3">
            <h4 className="text-[13px] text-gray-400/50">
                {title}
            </h4>
            {/* La key relanza la animación cada vez que cambia el dato */}
            <p key={data} className="animate-hud-in motion-reduce:animate-none">
                {data}
            </p>
        </div>
    )
}
export default Info