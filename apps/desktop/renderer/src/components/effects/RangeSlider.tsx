import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface RangeSliderProps {
  min: number;
  max: number;
  step?: number;
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
  className?: string;
}

export function RangeSlider({
  min,
  max,
  step = 1,
  value,
  onChange,
  disabled = false,
  className,
}: RangeSliderProps) {
  const handleSliderChange = (newValue: number[]) => {
    onChange(newValue[0]);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const numValue = parseFloat(e.target.value);
    if (!isNaN(numValue) && numValue >= min && numValue <= max) {
      onChange(numValue);
    }
  };

  return (
    <div className={cn('flex items-center gap-4', className)}>
      <Slider
        min={min}
        max={max}
        step={step}
        value={[value]}
        onValueChange={handleSliderChange}
        disabled={disabled}
        className="flex-1"
      />
      <Input
        type="number"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={handleInputChange}
        disabled={disabled}
        className="w-20"
      />
    </div>
  );
}
