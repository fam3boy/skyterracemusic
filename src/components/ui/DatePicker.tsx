'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface DatePickerProps {
  value: string; // YYYY-MM-DD
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function DatePicker({ value, onChange, placeholder }: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(value ? new Date(value) : new Date());
  const containerRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const handleDateClick = (day: number) => {
    const selectedDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    const offset = selectedDate.getTimezoneOffset() * 60000;
    const localISODate = new Date(selectedDate.getTime() - offset).toISOString().split('T')[0];
    onChange(localISODate);
    setIsOpen(false);
  };

  const changeMonth = (offset: number) => {
    const nextMonth = new Date(currentMonth);
    nextMonth.setMonth(currentMonth.getMonth() + offset);
    setCurrentMonth(nextMonth);
  };

  const renderCalendar = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const totalDays = daysInMonth(year, month);
    const startDay = firstDayOfMonth(year, month);
    
    const days = [];
    // Padding for previous month
    for (let i = 0; i < startDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-10 w-10"></div>);
    }
    // Days of current month
    for (let i = 1; i <= totalDays; i++) {
      const isSelected = value === `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      days.push(
        <button
          key={i}
          onClick={() => handleDateClick(i)}
          className={cn(
            "h-10 w-10 rounded-full text-xs font-bold transition-all flex items-center justify-center",
            isSelected 
              ? "bg-hyundai-black text-white" 
              : "hover:bg-hyundai-gray-50 text-hyundai-black"
          )}
        >
          {i}
        </button>
      );
    }
    return days;
  };

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 bg-white border border-hyundai-gray-100 rounded-xl px-4 py-2.5 text-xs font-bold text-hyundai-black min-w-[140px] hover:border-hyundai-gold transition-all shadow-sm"
      >
        <CalendarIcon className="w-4 h-4 text-hyundai-gray-300" />
        {value ? value : <span className="text-hyundai-gray-300">{placeholder || '날짜 선택'}</span>}
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 p-5 bg-white border border-hyundai-gray-100 rounded-2xl shadow-xl z-50 animate-in fade-in zoom-in-95 duration-200">
          <div className="flex justify-between items-center mb-6 px-1">
            <h4 className="text-[13px] font-black text-hyundai-black uppercase">
              {currentMonth.getFullYear()}년 {currentMonth.getMonth() + 1}월
            </h4>
            <div className="flex gap-1">
              <button 
                onClick={() => changeMonth(-1)}
                className="p-1.5 hover:bg-hyundai-gray-50 rounded-lg text-hyundai-gray-400"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button 
                onClick={() => changeMonth(1)}
                className="p-1.5 hover:bg-hyundai-gray-50 rounded-lg text-hyundai-gray-400"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-2">
            {['일', '월', '화', '수', '목', '금', '토'].map((day) => (
              <div key={day} className="h-8 w-10 flex items-center justify-center text-[10px] font-bold text-hyundai-gray-300 uppercase">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {renderCalendar()}
          </div>
        </div>
      )}
    </div>
  );
}
