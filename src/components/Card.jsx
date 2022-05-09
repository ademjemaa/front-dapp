import { useEffect, useState } from 'react';
import { TimeRemaining } from '.';
import { FaCrown } from 'react-icons/fa';
import ReactLoading from 'react-loading';

const Card = ({ name, status, registerTime, endTime, image, winner, children, stakedNFT }) => {
	const [date, setDate] = useState(Date.now().toLocaleString());
	const [state, setState] = useState(0);
	const [imageLoading, setImageLoading] = useState(true);

	useEffect(() => {
		setState(status);
		const endDate = new Date(endTime);
		setDate(endDate.toLocaleString());

		if (status === 2) return;
		const currentTime = Date.now();
		
		let registerTimer
		if (status === 0) {
			const diff = Math.max((registerTime - currentTime), 0);

			if (diff < 0x7FFFFFFF && diff !== 0) {
				registerTimer = setTimeout(() => {
					setState(1);
				}, diff)
			}
		}

		let endTimer;
		const diff = Math.max((endTime - currentTime), 0);
		if (diff < 0x7FFFFFFF && diff !== 0) {
			endTimer = setTimeout(() => {
				setState(2);
			}, diff)
		}

		return () => {
			if (registerTimer)
				clearTimeout(registerTimer);
			if (endTimer)
				clearTimeout(endTimer);
		} 
	}, [registerTime, endTime, status])

	return (
		<div className="flex flex-col items-center bg-[#1C2D3A] drop-shadow-lg rounded-xl pb-6 hover:scale-110 duration-300">
			<div className={`w-full p-2 text-center rounded-t-xl ${stakedNFT ? (state === 2 ? 'bg-red-500' : 'bg-green-500' ) : 'bg-[#1C2D3A]' }`}>
				<h3 className="text-md uppercase italic font-bold animate-pulse">{stakedNFT ? (stakedNFT + ' staked nft' + (stakedNFT > 1 ? 's' : '')) : "unregistered" }</h3>
			</div>
			<div className="flex w-[325px] h-[325px]">
				<img
					className={`p-3 object-cover w-full h-full ${(state !== 2 && !stakedNFT) ? 'pt-0' : ''} ${imageLoading ? 'hidden' : 'block'}`}
					src={image}
					alt="img"
					width={325}
					height={325}
					onLoad={() => setImageLoading(false)}
				/>
				{imageLoading && 
					<div className="flex justify-center items-center w-full h-full">
						<ReactLoading type={'spin'} color={'#ffffff'} height={64} width={64} />
					</div>
				}
				{(state === 2) &&
					<div className='absolute overflow-hidden flex flex-col justify-center items-center text-center w-[325px] h-[325px] left-auto top-auto bg-black/70 gap-4'>
						<div className="flex flex-col">
							<h1 className='font-bold uppercase text-6xl opacity-70 '>Closed</h1>
							<h2 className='font-bold uppercase text-sm opacity-80 '>Dont forget to withdraw</h2>
						</div>
					</div>
				}
			</div>
			<div className='w-full p-3 text-center bg-[#C99F59]'>
				<h3 className="text-xl font-alts font-bold">{name}</h3>
			</div>
			
			<div className="flex flex-col font-alts items-center gap-4 pt-4">
				<div className="flex justify-around w-full">
					<h4 className='flex items-center justify-center gap-2'>
						{state === 0
							? "Countdown to register in the raffle" 
							: state === 1
								? "The raffle finishes in" 
								: "Closed" }
					</h4>
					{winner
						&&
						<a className='flex items-center gap-2 underline' href={`https://solscan.io/account/${winner}`}><FaCrown size={18}/> 1 winner</a> 
					} 
				</div>
				<TimeRemaining endtime={state === 0 ? registerTime : endTime} />
				<div className='flex items-center justify-center gap-4'>
					<h1 className='p-3 rounded-md text-sm bg-[#17242F]'>Raffle ends on</h1>
					<h2 className='text-sm'>{date}
					</h2>
				</div>
				{children}	
			</div>
		</div>
	)
}

export default Card