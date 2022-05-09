import React from 'react'
import { Link } from 'react-router-dom'

const ButtonLink = ({ to, outline, type, noBackground, children, className }) => {
	let baseClass = "flex rounded-md px-7 py-4 gap-2 text-center text-lg duration-300 ease-in";

	let typeClass;
	switch (type) {
		case "primary":
			if (outline)
				typeClass = ` border-4 font-bold border-[#C99F59] text-[#C99F59] hover:bg-[#C99F59] hover:text-white `;
			else
				typeClass = ` ${!noBackground ? "bg-[#C99F59] hover:bg-[#E3B466]" : "hover:bg-[#C99F59]" } `
			break;
	
			default:
				break;
	};
	baseClass += typeClass;

	return (
		<Link to={to} className={baseClass + " " + className}>
			{children}
		</Link>
	)
}

export default ButtonLink