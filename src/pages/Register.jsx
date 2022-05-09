import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useEffect, useState } from "react";
import { GiTicket } from "react-icons/gi";
import { Button, Card } from "../components";
import { getNFTMetadataForMany } from "../common/web3/NFTget";
import { initGemBank } from "../common/gem-bank";
import { PublicKey } from "@solana/web3.js";
import { findVaultPDA } from "@gemworks/gem-farm-ts";
import { useParams } from "react-router-dom";
import axiosClient from '../axiosClient';
import { BN } from '@project-serum/anchor';
import { Store } from 'react-notifications-component';
import ReactLoading from 'react-loading';

const Register = () => {
	// Fetch
	const [NFT, setNFT] = useState(null);
	const [tickets, setTickets] = useState(null);

	// Nfts
	const [currentWalletNFTs, setCurrentWalletNFTs] = useState([]);
	const [currentVaultNFTs, setCurrentVaultNFTs] = useState([]);
	
	// Vault & Gembank
	const [gemBank, setGemBank] = useState(null);
	const [vault, setVault] = useState(null);
	const [vaultLocked, setVaultLocked] = useState(false);
	const [ticketsAmount, setTicketsAmount] = useState(0);
	const [stakedNFT, setStakedNFT] = useState(0);
	
	// Loading
	const [loading, setLoading] = useState(false);
	const [walletLoading, setWalletLoading] = useState(false);
	const [vaultLoading, setVaultLoading] = useState(false);

	// Hooks
	const { id } = useParams();
	const { connection } = useConnection();
	const wallet = useWallet();

	useEffect(() => {
		(async () => {
			const raffle = await axiosClient.get(`raffles/raffle/${id}`);
			const nftData = raffle.data.data;
			setNFT(nftData);
			
			const tickets = await axiosClient.get(`tickets/`);
			const ticketsData = tickets.data.data;
			setTickets(ticketsData);
		})()
	}, [id]);

	useEffect(() => {
		(async () => {
			if (!connection || !wallet || !wallet.publicKey) return ;
			
			const gb = await initGemBank(connection, wallet);
			setGemBank(gb);
		})()
	}, [connection, wallet]);

	useEffect(() => {
		(async () => {
			if (!gemBank || !NFT || !NFT.bank || !wallet.publicKey) return;

			try {
				const bankPk = new PublicKey(NFT.bank);
				const [vaultAddr] = await findVaultPDA(bankPk, wallet.publicKey);
	
				try {
					const acc = await gemBank.fetchVaultAcc(vaultAddr);
					setVault(vaultAddr.toBase58());
					setVaultLocked(acc.locked);
					setStakedNFT(acc?.gemCount?.words[0] || 0);
				} catch (err) {
					setVault(undefined);
					setVaultLocked(false);
				}
			} catch (err) {

			}
		})()
	}, [gemBank, NFT, wallet.publicKey])

	useEffect(() => {
		(async () => {
			if (!vault || !gemBank || !tickets) return;
	
			setVaultLoading(true);

			const vaultPubkey = new PublicKey(vault);
			if (!vaultPubkey) return;

			try {
				const foundGDRs = await gemBank.fetchAllGdrPDAs(vaultPubkey);
				if (foundGDRs && foundGDRs.length) {
					const mints = foundGDRs.map((gdr) => {
						return { mint: gdr.account.gemMint };
					});
					
					const data = await getNFTMetadataForMany(mints, connection);

					let ticketCount = 0
					const nfts = data.filter(e => {
						if (e?.externalMetadata?.symbol === 'ATLBC') {
							e.ticket = tickets.filter(ticket => e.externalMetadata.attributes[0].value === ticket.name)[0].amount
							ticketCount += e.ticket;
							return e;
						}
						return false;
					});

					setCurrentVaultNFTs(nfts);
					setTicketsAmount(ticketCount);
				}
			} catch (err) {
				Store.addNotification({
					title: "Error!",
					message: "Unable to load your nft in the vault.",
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

			setVaultLoading(false);
		})()
	}, [vault, connection, gemBank, tickets])

	useEffect(() => {
		(async () => {
			if (!tickets || !wallet.publicKey) return;
		
			setWalletLoading(true);
			
			const data = await axiosClient.get(`users/metadata/${wallet.publicKey}`);
			const metadata = data.data.data;

			const nfts = metadata.filter(e => {
				if (e?.externalMetadata?.symbol === 'ATLBC') {
					e.ticket = tickets.filter(ticket => e.externalMetadata.attributes[0].value === ticket.name)[0].amount
					return e;
				}
				return false;
			});
			setCurrentWalletNFTs(nfts);

			setWalletLoading(false);
		})()
	}, [tickets, wallet.publicKey])

	const depositGem = async (e) => {
		if (NFT.status > 0 || vaultLocked) {
			Store.addNotification({
				title: "Error!",
				message: "Vault may be locked for the following reasons : Time to register has passed or latency causing delays in vault unlocking",
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
			return;
		}

		if (loading) return;
		setLoading(true);

		const nftID = Number(e.target?.id);
		const nft = currentWalletNFTs[nftID];

		const creator = new PublicKey(
			(nft.onchainMetadata).data.creators[0].address
		);

		try {
			await gemBank.depositGemWallet(
				new PublicKey(NFT.bank),
				new PublicKey(vault),
				new BN(1),
				new PublicKey(nft.mint),
				new PublicKey(nft.pubkey),
				creator
			);

			setCurrentVaultNFTs(prevState => [
				...prevState,
				nft
			])
			setCurrentWalletNFTs(prevState => prevState.filter((e, index) => index !== nftID));
			setTicketsAmount(prevState => prevState + nft.ticket);
		} catch(err) {
			Store.addNotification({
				title: "Error!",
				message: "Transaction timed out due to blockchain latency ! Also make sure you have a sufficient amount of SOL to approve transactions. Please try again.",
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

			setLoading(false);
			return;
		}

		setLoading(false);
	};
  
	const withdrawGem = async (e) => {
		if (vaultLocked) {
			Store.addNotification({
				title: "Error!",
				message: "Vault may be locked for the following reasons: Time to register has passed or latency causing delays in vault unlocking",
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
			return;
		}

		if (loading) return;
		setLoading(true);

		const nftID = Number(e.target?.id);
		const nft = currentVaultNFTs[nftID];
		
		if (!nft) {
			Store.addNotification({
				title: "Error!",
				message: "NFT does not exist !",
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

			setLoading(false);
			return;
		}

		try {
			await gemBank.withdrawGemWallet(
				new PublicKey(NFT.bank),
				new PublicKey(vault),
				new BN(1),
				new PublicKey(nft.mint)
			);

			setCurrentWalletNFTs(prevState => [
				...prevState,
				nft
			])

			setCurrentVaultNFTs(prevState => prevState.filter((e, index) => index !== nftID));
			setTicketsAmount(prevState => prevState - nft.ticket);
		} catch (err) {
			console.log(err);
			Store.addNotification({
				title: "Error!",
				message: "Transaction timed out due to blockchain latency ! Also make sure you have a sufficient amount of SOL to approve transactions. Please try again.",
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

			setLoading(false);
			return;
		}

		setLoading(false);
	};

	const createVault = async() => {
		if (!NFT || !NFT.bank) {
			Store.addNotification({
				title: "Error!",
				message: "The raffle does not exist.",
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

			return;
		}

		setLoading(true);

		try {
			await axiosClient.get(`raffles/allow/${NFT.bank}`);
		} catch (err) {
			Store.addNotification({
				title: "Error!",
				message: 'Impossible to create vault : the raffle is over.',
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

			setLoading(false);
			return;
		} 

		let vaultAddress;
		try {
			const { vault: fetchedVault } = await gemBank.initVaultWallet(
				new PublicKey(NFT.bank)
			);
			vaultAddress = fetchedVault.toBase58();
		} catch (err) {
			Store.addNotification({
				title: "Error!",
				message: 'Transaction timed out due to blockchain latency ! Also make sure you have a sufficient amount of SOL to approve transactions. Please try again.',
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

			setLoading(false);
			return;
		}

		if (!vaultAddress) {
			Store.addNotification({
				title: "Error!",
				message: 'The address of the vault does not exist.',
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

			setLoading(false);
			return;
		}
		
		try {
			await axiosClient.post('users/', {
				bank: NFT.bank,
				vault: vaultAddress
			});
		} catch (err) {
			Store.addNotification({
				title: "Error!",
				message: 'Your vault creation failed, please try again.',
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

			setLoading(false);
			return;
		}

		setVault(vaultAddress);

		Store.addNotification({
			title: "Success!",
			message: "Your vault as been created successfully.",
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

		setLoading(false);
	}

	return (
		<div className="flex flex-col py-16 w-full flex-wrap items-center gap-12 xl:flex-nowrap">
			{NFT &&
				<Card
					name={NFT?.name}
					status={NFT?.status}
					registerTime={NFT?.registerTime}
					endTime={NFT?.endTime}
					image={NFT?.image}
					winner={NFT?.winner}
					stakedNFT={stakedNFT || false}
				/>
			}

			<div className="flex flex-wrap justify-center gap-4">
				{vault ?
					<>
						{currentWalletNFTs && currentWalletNFTs.length ?
							<table className="block w-fit h-fit max-h-[500px] overflow-auto">
								<thead className="sticky top-0">
									<tr>
										<th>Wallet</th>
										<th>Name</th>
										<th>Tickets amount</th>
										<th/>
									</tr>
								</thead>
								<tbody>
									{currentWalletNFTs.map((nft, index) => (
										<tr key={index}>
											<td>
												<div className="w-[80px] h-[80px]">
													<img
														className="rounded-lg object-cover w-full h-full"
														src={nft.externalMetadata.image || ""} alt="" />
												</div>
											</td>
											<td>{nft.externalMetadata.name}</td>
											<td>{nft.ticket} tickets</td>
											<td>
												<Button id={index} onClick={depositGem}>
													{loading ? <ReactLoading type={'spin'} color={'#ffffff'} height={18} width={18} /> : ""}
													Deposit
												</Button>
											</td>
										</tr>
									))}
								</tbody>
							</table>
							:
							<div className="flex justify-center items-center text-xl w-[750px] h-[510px] rounded-xl drop-shadow-md bg-[#1C2D3A]">
								<div className="flex justify-center items-center p-8 rounded-xl bg-[#17242F]">
									<h1>{walletLoading ? <ReactLoading type={'spin'} color={'#ffffff'} height={48} width={48} /> : "Your wallet is empty"}</h1>
								</div>	
							</div>
						}

						{currentVaultNFTs && currentVaultNFTs.length ?
							<table className="block w-fit h-fit max-h-[500px] overflow-auto">
								<thead className="sticky top-0">
									<tr>
										<th>Vault</th>
										<th>Name</th>
										<th>Tickets amount</th>
										<th/>
									</tr>
								</thead>
								<tbody>
									{currentVaultNFTs.map((nft, index) => (
										<tr key={index}>
											<td>
												<div className="w-[80px] h-[80px]">
													<img
														className="rounded-lg object-cover w-full h-full"
														src={nft.externalMetadata.image || ""} alt="" />
												</div>
											</td>
											<td>{nft.externalMetadata.name}</td>
											<td>{nft.ticket} tickets</td>
											<td>
												<Button id={index} onClick={withdrawGem}>
													{loading ? <ReactLoading type={'spin'} color={'#ffffff'} height={18} width={18} /> : ""}
													Withdraw
												</Button>
											</td>
										</tr>
									))}
								</tbody>
							</table>
							:
							<div className="flex justify-center items-center text-xl w-[750px] h-[510px] rounded-xl drop-shadow-md bg-[#1C2D3A]">
								<div className="flex justify-center items-center p-8 rounded-xl bg-[#17242F]">
									<h1>{vaultLoading ? <ReactLoading type={'spin'} color={'#ffffff'} height={48} width={48} /> : "Your vault is empty"}</h1>
								</div>	
							</div>
						}
					</>
				:
					(NFT && !NFT?.status)
					?
						<div className="flex flex-col items-center justify-center gap-4">
							<Button onClick={createVault}>
								{loading ? <ReactLoading type={'spin'} color={'#ffffff'} height={18} width={18} /> : ""}
								Create vault
							</Button>
							<h1>Create your vault to register at this raffle and store your nft(s) in the raffle.</h1>
						</div>
					: 
						<div className="flex flex-col items-center justify-center gap-4">
							<h1>You can't register to this raffle, it is closed.</h1>
						</div>
				}
			</div>

			<div className="flex items-center gap-8">
				<div className='flex items-center justify-center gap-2 text-xl p-4 rounded-lg bg-[#1C2D3A]'>
					<GiTicket size={18} />
					{ticketsAmount} tickets
				</div>
			</div>
		</div>
	)
}

export default Register