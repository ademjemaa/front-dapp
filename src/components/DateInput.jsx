import { useEffect, useState } from "react";

const DateInput = ({ title, onChange }) => {
	const currentDate = new Date();
	const [date, setDate] = useState({
		day: currentDate.getDate(),
		month: currentDate.getMonth() + 1,
		year: currentDate.getFullYear(),
		hour: currentDate.getHours(),
		minute: currentDate.getMinutes()
	});

	const onChangeHandler = ({target:{name, value, min, max, nextElementSibling}}) => {
		if (Number(value) > max)
			value = max;
		if (Number(value) < min)
			value = min;

		setDate({
			...date,
			[name]: value
		});

		if (value.length === max.length)
			if (nextElementSibling?.tagName.toLowerCase() !== 'input') {
				nextElementSibling?.nextElementSibling?.focus();
				nextElementSibling?.nextElementSibling?.select();
			}
			else {
				nextElementSibling?.focus();
				nextElementSibling?.select();	
			}
	};

	useEffect(() => {
		onChange(new Date(
			date.year,
			date.month - 1,
			date.day,
			date.hour,
			date.minute
		).getTime());
	}, [date])

	return (
		<div className="flex gap-4 px-8">
			<div className="flex items-center justify-center p-2 px-4 bg-[#1C2D3A] rounded-md">
				<p>{title}</p>
			</div>
			<div className="flex flex-wrap gap-2 items-center">
				<input type="number" name="day" value={date.day} min={0} max={31} onChange={e => onChangeHandler(e)} />
				<input type="number" value={date.month} name="month" min={0} max={12} onChange={onChangeHandler}/>
				<input type="number" value={date.year} name="year" min={0} max={3000} onChange={onChangeHandler}/>
				<p className="font-bold">at</p>
					<input type="number" value={date.hour} name="hour" min={0} max={24} onChange={onChangeHandler}/>
				<p className="font-bold">h</p>
				<input type="number" value={date.minute} name="minute" min={0} max={60} onChange={onChangeHandler}/>
			</div>
		</div>
	)
}

export default DateInput