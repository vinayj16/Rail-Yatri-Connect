import * as React from "react";
import { Clock } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface TimePickerDemoProps {
  date: Date;
  setDate: (date: Date) => void;
}

export function TimePickerDemo({ date, setDate }: TimePickerDemoProps) {
  const minuteRef = React.useRef<HTMLInputElement>(null);
  const hourRef = React.useRef<HTMLInputElement>(null);
  const secondRef = React.useRef<HTMLInputElement>(null);

  const [hour, setHour] = React.useState<number>(date ? date.getHours() : 0);
  const [minute, setMinute] = React.useState<number>(date ? date.getMinutes() : 0);
  const [second, setSecond] = React.useState<number>(date ? date.getSeconds() : 0);

  // Update the date when the hour, minute, or second changes
  React.useEffect(() => {
    const newDate = new Date(date);
    newDate.setHours(hour);
    newDate.setMinutes(minute);
    newDate.setSeconds(second);
    setDate(newDate);
  }, [hour, minute, second, setDate]);

  const handleHourChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = parseInt(e.target.value, 10);
    if (isNaN(value)) {
      value = 0;
    } else if (value > 23) {
      value = 23;
    } else if (value < 0) {
      value = 0;
    }
    setHour(value);
    if (value.toString().length === 2 || value > 2) {
      minuteRef.current?.focus();
    }
  };

  const handleMinuteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = parseInt(e.target.value, 10);
    if (isNaN(value)) {
      value = 0;
    } else if (value > 59) {
      value = 59;
    } else if (value < 0) {
      value = 0;
    }
    setMinute(value);
    if (value.toString().length === 2 || value > 5) {
      secondRef.current?.focus();
    }
  };

  const handleSecondChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = parseInt(e.target.value, 10);
    if (isNaN(value)) {
      value = 0;
    } else if (value > 59) {
      value = 59;
    } else if (value < 0) {
      value = 0;
    }
    setSecond(value);
  };

  const incrementHour = () => {
    setHour((hour) => (hour === 23 ? 0 : hour + 1));
  };

  const decrementHour = () => {
    setHour((hour) => (hour === 0 ? 23 : hour - 1));
  };

  const incrementMinute = () => {
    setMinute((minute) => (minute === 59 ? 0 : minute + 1));
  };

  const decrementMinute = () => {
    setMinute((minute) => (minute === 0 ? 59 : minute - 1));
  };

  const incrementSecond = () => {
    setSecond((second) => (second === 59 ? 0 : second + 1));
  };

  const decrementSecond = () => {
    setSecond((second) => (second === 0 ? 59 : second - 1));
  };

  const handleHourKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowUp") {
      e.preventDefault();
      incrementHour();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      decrementHour();
    }
  };

  const handleMinuteKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowUp") {
      e.preventDefault();
      incrementMinute();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      decrementMinute();
    }
  };

  const handleSecondKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowUp") {
      e.preventDefault();
      incrementSecond();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      decrementSecond();
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-center gap-1">
        <div className="flex flex-col items-center gap-2">
          <Label htmlFor="hour" className="text-xs font-medium">
            Hour
          </Label>
          <div className="flex flex-col items-center">
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-5 w-8 rounded-none rounded-t-md"
              onClick={incrementHour}
            >
              <ChevronUpIcon className="h-3 w-3" />
              <span className="sr-only">Increase hour</span>
            </Button>
            <Input
              id="hour"
              ref={hourRef}
              type="number"
              min={0}
              max={23}
              value={hour}
              onChange={handleHourChange}
              onKeyDown={handleHourKeyDown}
              className="h-9 w-10 rounded-none border-x-0 text-center [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-5 w-8 rounded-none rounded-b-md"
              onClick={decrementHour}
            >
              <ChevronDownIcon className="h-3 w-3" />
              <span className="sr-only">Decrease hour</span>
            </Button>
          </div>
        </div>
        <div className="flex items-center pt-4">:</div>
        <div className="flex flex-col items-center gap-2">
          <Label htmlFor="minute" className="text-xs font-medium">
            Min
          </Label>
          <div className="flex flex-col items-center">
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-5 w-8 rounded-none rounded-t-md"
              onClick={incrementMinute}
            >
              <ChevronUpIcon className="h-3 w-3" />
              <span className="sr-only">Increase minute</span>
            </Button>
            <Input
              id="minute"
              ref={minuteRef}
              type="number"
              min={0}
              max={59}
              value={minute}
              onChange={handleMinuteChange}
              onKeyDown={handleMinuteKeyDown}
              className="h-9 w-10 rounded-none border-x-0 text-center [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-5 w-8 rounded-none rounded-b-md"
              onClick={decrementMinute}
            >
              <ChevronDownIcon className="h-3 w-3" />
              <span className="sr-only">Decrease minute</span>
            </Button>
          </div>
        </div>
        <div className="flex items-center pt-4">:</div>
        <div className="flex flex-col items-center gap-2">
          <Label htmlFor="second" className="text-xs font-medium">
            Sec
          </Label>
          <div className="flex flex-col items-center">
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-5 w-8 rounded-none rounded-t-md"
              onClick={incrementSecond}
            >
              <ChevronUpIcon className="h-3 w-3" />
              <span className="sr-only">Increase second</span>
            </Button>
            <Input
              id="second"
              ref={secondRef}
              type="number"
              min={0}
              max={59}
              value={second}
              onChange={handleSecondChange}
              onKeyDown={handleSecondKeyDown}
              className="h-9 w-10 rounded-none border-x-0 text-center [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-5 w-8 rounded-none rounded-b-md"
              onClick={decrementSecond}
            >
              <ChevronDownIcon className="h-3 w-3" />
              <span className="sr-only">Decrease second</span>
            </Button>
          </div>
        </div>
      </div>
      <div className="flex justify-center">
        <Button
          type="button" 
          variant="outline"
          className="flex items-center gap-1" 
          onClick={() => {
            const now = new Date();
            setHour(now.getHours());
            setMinute(now.getMinutes());
            setSecond(now.getSeconds());
          }}
        >
          <Clock className="h-3 w-3" />
          <span className="text-xs">Now</span>
        </Button>
      </div>
    </div>
  );
}

function ChevronUpIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m18 15-6-6-6 6" />
    </svg>
  );
}


function ChevronDownIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}