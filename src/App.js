import { Routes, Route } from "react-router-dom";
import Layout from "./layouts/Layout";
import routes from './routes';

import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { LedgerWalletAdapter, PhantomWalletAdapter, SlopeWalletAdapter, SolflareWalletAdapter, SolletExtensionWalletAdapter, SolletWalletAdapter, TorusWalletAdapter } from "@solana/wallet-adapter-wallets";
import { clusterApiUrl } from "@solana/web3.js";
import { useMemo } from "react";
import { ReactNotifications } from 'react-notifications-component'
import 'react-notifications-component/dist/theme.css';

require('@solana/wallet-adapter-react-ui/styles.css');

const App = () => {
	const network = WalletAdapterNetwork.Mainnet;
    const endpoint = useMemo(() => clusterApiUrl(network), [network]);

	const wallets = useMemo(
        () => [
            new PhantomWalletAdapter(),
            new SlopeWalletAdapter(),
            new SolflareWalletAdapter({ network }),
            new TorusWalletAdapter(),
            new LedgerWalletAdapter(),
            new SolletWalletAdapter({ network }),
            new SolletExtensionWalletAdapter({ network }),
        ],
        [network]
    );

	return (
		<>
			<ConnectionProvider endpoint={endpoint}>
           		<WalletProvider wallets={wallets} autoConnect>
					<Layout>
						<ReactNotifications />
						<Routes>
							{routes.map((route, index) => (
								<Route key={route.path} exact path={route.path} element={<route.element/>} />
							))}
						</Routes>
					</Layout>
				</WalletProvider>
        	</ConnectionProvider>
		</>
	)
}

export default App