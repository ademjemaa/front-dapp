import { WalletModalProvider, WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useWallet } from '@solana/wallet-adapter-react';
import { FaWallet } from 'react-icons/fa';

const Wallet = () => {
	const wallet = useWallet();

	return (
		<>
			<WalletModalProvider>
					<WalletMultiButton startIcon={undefined} className={`flex rounded-md px-7 py-3 !font-bold text-center !text-lg duration-300 ease-in ${!wallet.connected ? "!bg-[#1C2D3A]" : "!bg-[#C99F59]"} !hover:bg-[#E3B466] gap-4`}>
						<FaWallet size={22}/>
						{!wallet.connected
							? "Disconnected"
							: "Connected"
						}
					</WalletMultiButton>
			
			</WalletModalProvider>
		</>
	)
}

export default Wallet