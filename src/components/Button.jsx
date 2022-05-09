const Button = ({noBackground, children, className, onClick, id }) => {
	return (
		<button id={id} className={`flex items-center justify-center rounded-md px-4 py-3 gap-4 text-center text-lg duration-300 ease-in ${!noBackground ? "bg-[#C99F59] hover:bg-[#E3B466]" : "hover:bg-[#C99F59]" } ${className}`} onClick={onClick}>
			{children}
		</button>
	)
}

export default Button