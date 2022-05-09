import { useEffect, useState } from 'react';

const TimeRemaining = ({ endtime }) => {
	const calculateTimeLeft = () => {
		const difference = endtime - new Date();
		
		let timeLeft = [
			{time: 'Days', value: 0},
			{time: 'Hours',value: 0},
			{time: 'Minutes', value: 0},
			{time: 'Seconds', value: 0},
		];
		if (difference > 0) {
			timeLeft = [
				{time: 'Days', value: Math.floor(difference / (1000 * 60 * 60 * 24))},
				{time: 'Hours', value: Math.floor((difference / (1000 * 60 * 60)) % 24)},
				{time: 'Minutes', value: Math.floor((difference / 1000 / 60) % 60)},
				{time: 'Seconds', value: Math.floor((difference / 1000) % 60)},
			];
		}

		return timeLeft;
	};

	const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

	useEffect(() => {
		const timer = setTimeout(() => {
			setTimeLeft(calculateTimeLeft());
		}, 1000);

		return () => clearTimeout(timer);
	});
	
	return (
		<div className='flex gap-4 text-lg'>
			{timeLeft.length && timeLeft.map((item, index) => (
				<div key={item.time} className="flex flex-col items-center gap-2">
					<p className='text-sm'>{item.time}</p>
					<div className='flex py-2 w-12 justify-center rounded-md bg-[#17242F]'>
						<p>{item.value}</p>	
					</div>
				</div>
			))}
			
		</div>
	)
}

export default TimeRemaining