interface albumSelectorProps {
    albums: string[],
    selected: string | null,
    onSelect: (album: string | null) => void
}

// Lista de álbumes en la cabecera. El elegido se marca con el mismo recuadro que el formato (ARW)
export default function AlbumSelector({ albums, selected, onSelect }: albumSelectorProps) {
    const options: { label: string, value: string | null }[] = [
        { label: "ALL", value: null },
        ...albums.map(album => ({ label: album, value: album })),
    ]
    return (
        <nav aria-label="Álbumes" className="col-span-2 row-start-2 flex items-baseline justify-start gap-1 md:col-start-2 md:row-start-1 md:justify-center overflow-x-auto scrollbar-none text-sm pointer-events-auto h-fit">
            {options.map(option => {
                const isSelected = option.value === selected
                return (
                    <button key={option.value ?? "all"} type="button" aria-pressed={isSelected} onClick={() => onSelect(option.value)}
                        className={`shrink-0 cursor-pointer border p-1 uppercase transition-colors duration-300 ${isSelected ? "border-current text-white" : "border-transparent text-white/50 hover:text-white"}`}>
                        {option.label}
                    </button>
                )
            })}
        </nav>
    )
}
