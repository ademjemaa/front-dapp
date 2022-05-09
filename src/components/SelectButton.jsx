const SelectButton = ({ className, onClick, id, selected }) => {
	return (
		<button id={id} className={`flex w-full h-full justify-center rounded-md px-7 py-3 gap-2 text-center text-lg duration-300 ease-in border-4 uppercase border-[#C99F59] text-[#C99F59] hover:bg-[#C99F59] hover:text-white ${selected ? "bg-[#C99F59] text-white" : null} ${className}`} onClick={onClick}>
			Select
		</button>
	)
}

export default SelectButton