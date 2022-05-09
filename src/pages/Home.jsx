// React
import { useEffect, useState } from "react";
import { Button, ButtonLink, Card } from "../components";

// API
import axiosClient from '../axiosClient';
import { useWallet } from "@solana/wallet-adapter-react";

const Home = () => {
	const [raffles, setRaffles] = useState([]);
	const [type, setType] = useState(1);
	const wallet = useWallet();

	useEffect(() => {
		(async () => {
			try {
				let response;
				if (wallet.publicKey)
					response = await axiosClient.get(`/raffles/${wallet?.publicKey.toBase58()}`);
				else
					response = await axiosClient.get(`/raffles/`);

				const sortedData = response.data.data.sort((a, b) => a.registerTime - b.registerTime)
					.sort((a, b) => a.status - b.status);

				setRaffles(sortedData);
			} catch (err) {}
		})()
	}, [wallet.publicKey]);

	const handleClick = (e) => {
		setType(Number(e.target.id));
	}

	return (
		<div className="flex flex-col items-center gap-20 w-full h-full p-16">
			<div className="flex gap-4">
				<Button
					id={0}
					onClick={handleClick}
					noBackground={!(type === 0)}
				>
					All
				</Button>
				<Button
					id={1}
					onClick={handleClick}
					noBackground={!(type === 1)}
				>
					Ongoing
				</Button>
				<Button
					id={2}
					onClick={handleClick}
					noBackground={!(type === 2)}
				>
					Closed
				</Button>
			</div>

			<div className="flex w-full h-full justify-center flex-wrap gap-20">
				{raffles.filter(e => {
					if (!type) return e;
					else if (type === 1) {
						if (e.status === 0 || e.status === 1)
							return e;
					}
					else if (type === e.status) return e;
					return false;
				})
				.map((item, id) => (
					<Card
						key={item._id}
						name={item.name}
						status={item.status}
						registerTime={item.registerTime}
						endTime={item.endTime}
						id={item._id}
						image={item.image}
						winner={item.winner}
						stakedNFT={item?.gemCount || false}
					>
						<ButtonLink
							to={`/raffles/${item?._id}`} 
							type="primary"
							className={` font-bold ${item?.status >= 1 && "bg-[#17242F]"}`}
						>
							{item?.status === 0 ? "Register" : item?.status === 1 ? "View" : "Withdraw"}
						</ButtonLink>
					</Card>
				))}
			</div>
		</div>
	)
}

export default Home