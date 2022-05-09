import { Button, DateInput, SelectButton } from "../components";
import { useEffect, useState } from "react";
import axiosClient from '../axiosClient';
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { initGemBank } from '../common/gem-bank';
import { getNFTsByOwner } from "../common/web3/NFTget";
import { Store } from 'react-notifications-component';
import ReactLoading from 'react-loading';
import { useNavigate } from "react-router-dom";

const Admin = () => {
	const [NFTs, setNFTs] = useState([]);
	const [loading, setLoading] = useState(false);
	const [registerTimestamp, setRegisterTimestamp] = useState(new Date().getTime());
	const [endTimestamp, setEndTimestamp] = useState(new Date().getTime());
	const [selected, setSelected] = useState(0);

	const { connection } = useConnection();
	const wallet = useWallet();
	const navigate = useNavigate();

	const fetchMetadata = async () => {
		try {
			const tokensMetaData = await getNFTsByOwner(wallet.publicKey, connection);
			if (tokensMetaData) {
				setNFTs(tokensMetaData);
			}
		} catch(err) {
			console.log(err);
		}
	} 

	const onClick = async() => {
		await fetchMetadata();
	}
	
	useEffect(() => {
		if (!wallet.publicKey) return;
		(async () => {
			try {
				await axiosClient.get(`raffles/admin/${wallet.publicKey.toBase58()}`)
			} catch (err) {
				navigate('/');
			}
		})()
	}, [wallet.publicKey]);

	useEffect(() => {
		fetchMetadata();
	}, [connection, wallet]);

	const onRegisterTimestampChange = (ts) => {
		if (ts > (new Date().getTime()))
			setRegisterTimestamp(ts);
	}

	const onEndTimestampChange = (ts) => {
		if (ts > (new Date().getTime()))
			setEndTimestamp(ts);
	}

	const create = async (e) => {
		setLoading(true);

		try {
			const gb = await initGemBank(connection, wallet);
			const { bank: fetchedBank } = await gb.initBankWallet();
			const bank = fetchedBank.publicKey.toBase58();

			if (!NFTs || !NFTs[selected])
				return ;

			await axiosClient.post('/raffles/', {
				bank: bank,
				pubkey: wallet.publicKey.toBase58(),
				nft: NFTs[selected]?.pubkey.toBase58(),
				registerTime: registerTimestamp,
				endTime: endTimestamp
			})
			Store.addNotification({
				title: "Wonderful!",
				message: "Your raffle as been created successfully.",
				type: "success",
				insert: "top",
				container: "top-right",
				animationIn: ["animate__animated", "animate__fadeIn"],
				animationOut: ["animate__animated", "animate__fadeOut"],
				dismiss: {
				  duration: 5000,
				  onScreen: true
				}
			});
		} catch(err) {
			Store.addNotification({
				title: "Wonderful!",
				message: err.message,
				type: "danger",
				insert: "top",
				container: "top-right",
				animationIn: ["animate__animated", "animate__fadeIn"],
				animationOut: ["animate__animated", "animate__fadeOut"],
				dismiss: {
				  duration: 5000,
				  onScreen: true
				}
			});
		}
		setLoading(false);
	}

	const selectNFT = (e) => {
		setSelected(Number(e.target.id));
	}

	return (
		<div className="flex w-full justify-center gap-6 p-16 flex-wrap xl:flex-nowrap">
			<div className="flex w-full flex-col items-center gap-6">
				<div className="flex w-fit rounded-xl justify-center">
					{NFTs && NFTs.length > 0 ?
					<table className="block h-[510px] overflow-auto">
						<thead className="sticky top-0">
							<tr>
								<th/>
								<th>Name</th>
								<th/>
							</tr>
						</thead>
						<tbody>
								{NFTs.map((item, index) => {
									return item !== undefined &&
									<tr key={index}>
										<td>
											<div className="w-[80px] h-[80px]">
												<img
													className="rounded-lg object-cover w-full h-full"
													src={item.externalMetadata.image || ""} alt="" />
											</div>
											
										</td>
										<td>{item.externalMetadata.name}</td>
										<td>
											<SelectButton
												className="font-bold uppercase"
												id={index}
												selected={selected === index}
												onClick={selectNFT}
											/>
										</td>
									</tr>
								})}
						</tbody>
					</table>
					:
					<div className="flex gap-8 items-center justify-center text-center rounded-xl p-8 bg-[#203443]">
						<h1 className="text-2xl">Connect your wallet and press on this button</h1>
						<Button type="primary" onClick={onClick} >
							Reload
						</Button>
					</div>
					}
				</div>
				<div className="flex justify-center bg-[#203443] py-12 rounded-2xl">
					<div className="flex flex-col gap-8 items-center">
						<DateInput title="Register end date" onChange={onRegisterTimestampChange} />
						<DateInput title="End date" onChange={onEndTimestampChange} />
						<Button
							type="primary"
							fontSize="lg"
							onClick={create}
						>
							{loading ? <ReactLoading type={'spin'} color={'#ffffff'} height={18} width={18} /> : ""}
							Create
						</Button>
					</div>
				</div>
			</div>
		</div>
	)
}

export default Admin;