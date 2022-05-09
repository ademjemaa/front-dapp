import { Home, Admin, NotFound, Register } from "./pages";

const routes = [
	{ path: '/', element: Home },
	{ path: '/raffles/:id', element: Register },
	{ admin: true, path: '/admin', element: Admin },
	{ path: '/*', element: NotFound }
]

export default routes;