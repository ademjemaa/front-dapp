import { Link } from "react-router-dom";
import { logo } from '../assets';
import { AiFillHome } from 'react-icons/ai';
import { FaUserTie } from 'react-icons/fa';
import ButtonLink from "./ButtonLink";
import { Wallet } from ".";
import { useEffect, useState } from "react";
import axiosClient from "../axiosClient";
import { useWallet } from "@solana/wallet-adapter-react";

const Navbar = () => {
	const [isAdmin, setIsAdmin] = useState(false);
	const wallet = useWallet()

	useEffect(() => {
		if (!wallet.publicKey) return ;
		(async () => {
			try {
				setIsAdmin(await axiosClient.get(`raffles/admin/${wallet.publicKey.toBase58()}`));
			} catch(err) {
				console.log(err);
			}
		})()
	}, [wallet])

	return (
		<div className="flex py-2 px-8 items-center bg-[#131F29] flex-col gap-8 xl:flex-row pb-8 xl:py-2 2xl:py-2 border-b-2 border-[#C99F59]">
			<div className="flex-1">
				<Link to="/">
					<img
						className="xl:-ml-8"
						height="100"
						width="100" 
						src={logo}
						alt="test"
					/>
				</Link>
			</div>
			<div className="flex flex-col flex-1 justify-center text-center">
				<h1 className="uppercase text-3xl text-[#C99F59] font-black">The Lofts Business Club</h1>
				<h3 className="text-xl font-bold">Raffle Staking</h3>
			</div>
			<div className="flex-1 flex justify-end gap-4 items-center">
				<ButtonLink to='/' type="primary" noBackground>
					<AiFillHome size={22}/>
				</ButtonLink>
				{ isAdmin &&
					<ButtonLink to='/admin' type="primary" noBackground>
						<FaUserTie size={22}/>
					</ButtonLink>
				}
				<Wallet />
			</div>
		</div>
	)
}

export default Navbar