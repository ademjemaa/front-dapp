import { AiFillHome } from 'react-icons/ai';
import { ButtonLink } from "../components/"

const NotFound = () => {
	return (
		<div className="flex justify-center items-center absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2">
			<div className="flex flex-col gap-6 items-center text-center">
				<div className="flex flex-col gap-1 items-center">
					<h1 className="text-9xl">Error 404</h1>
					<h2 className="text-2xl">Page not Found</h2>
				</div>
				<ButtonLink to='/' text='Home page' type="primary" outline>
					<AiFillHome size={22} />
				</ButtonLink>
			</div>
		</div>
	)
}

export default NotFound