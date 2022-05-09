import { Navbar } from "./../components";

const Layout = ({ children }) => {
	return (
		<div>
			<Navbar />
			<main className="container mx-auto">
				{ children }
			</main>
		</div>
	)
}

export default Layout