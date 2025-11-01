"use client";
import React, { useId } from "react";
import { useState, useEffect } from "react";
import { useUser } from "../../../context/UserContext";
import useTimetable from "@/components/TableContent";
import { ChartNoAxesColumnIcon } from "lucide-react";

export default function TimeTableGrid( {propUserId} ) {
  const Days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const Hours = [
    "0:00", "1:00", "2:00", "3:00", "4:00", "5:00", "6:00", "7:00","8:00", "9:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00", "21:00", "22:00", "23:00"
  ];

  const time_width = 150;
  const minutesPerColumn = 60; // change to 15 for finer resolution
  const colsPerDay = (24 * 60) / minutesPerColumn; // e.g. 48 for 30-min steps

  // const [slots, setSlots] = useState([]);
  const { user } = useUser();
  const userId = propUserId || user?._id;
  const { slots, loading, error, reload } = useTimetable(userId);
  // console.log("slots from useTimetable:", slots);

  if (!userId || loading) return <div>Loading timetable...</div>;

  // helper map to convert backend day ('mon') -> row index where Sun=0
  const DAY_TO_INDEX = { sun: 0, mon: 1, tue: 2, wed: 3, thu: 4, fri: 5, sat: 6 };

  // Convert slots into grid placement props
  const mappedSlots = slots.map((s) => {
    const startMin = Number(s.start_min);
    const endMin = Number(s.end_min);
    const startCol = Math.floor(startMin / minutesPerColumn) + 2; // grid columns start at 2
    const spanCols = Math.max(1, Math.ceil((endMin - startMin) / minutesPerColumn));
    const row = (DAY_TO_INDEX[s.day] ?? 0) + 2; // grid rows start at 2
    return {
      id: s._id || `${s.day}-${s.start_min}-${s.end_min}`,
      title: s.title,
      description: s.description,
      location: s.location,
      color: s.color || 'purple',
      gridColumn: `${startCol} / span ${spanCols}`,
      gridRow: row
    };
  });
  // console.log()

  // Pre-calculate grid positions
  const hourColumns = Hours.map((_, index) => index + 2);
  const dayRows = Days.map((_, index) => index + 1);
  const gridCells = Days.flatMap((_, h_index) =>
    Hours.map((_, d_index) => ({
      col: d_index + 2,
      row: h_index + 2,
    }))
  );

  return (
    <div className="relative mt-16 overflow-auto rounded-lg outline-gray-400 bg-white outline dark:bg-gray-950/50 w-[calc(100vw-800px)] ">
      <div className="dark:bg-gray-800">
        <div
          className={
            `grid 
            grid-cols-[repeat(${Hours.length+1},${time_width}px)] 
            grid-rows-[repeat(${Days.length+1},12px)] 
            min-w-max`
          }
        >
          
          {/* 1-1 column */}
          <div
            className="sticky top-0 left-0 z-50 bg-white dark:bg-gray-800 border-b border-r border-gray-100 dark:border-gray-200/5"
            style={{ gridColumn: 1, gridRow: 1}} // match hour header height
          />

          {/* 2-1 column */}
          <div
            className="sticky top-0 left-0 z-10 bg-white dark:bg-gray-800 border-b border-r border-gray-100 dark:border-gray-200/5"
            style={{ gridColumn: 2, gridRow: 1}} // match hour header height
          />

          {/* Hour headers */}
          {Hours.map((hour, index) => (
            <div
              key={index}
              className={
                `sticky 
                border-b 
                top-0 
                z-10 
                border-gray-100 
                bg-white 
                bg-clip-padding 
                py-2 
                text-center 
                text-base 
                font-medium 
                text-gray-900 
                dark:border-black/10 
                dark:bg-gradient-to-b 
                dark:from-gray-600 
                dark:to-gray-700 
                dark:text-gray-200`
              }
              style={{ gridColumn: hourColumns[index], gridRow: 1, width: `${time_width}px`, transform: `translateX(${time_width/2}px)` }}
            >
              <div
                style={{ width: `${time_width}px` }}
              >{hour}</div>
            </div>
          ))}

          {/* Day headers */}
          {Days.map((day, h_index) => (
            <div
              key={h_index}
              className="sticky left-0 z-30 border-r border-gray-100 bg-white dark:border-gray-200/5 dark:bg-gray-800 flex items-center justify-center px-[25] h-[10vh]"
              style={{ gridColumn: 1, gridRow: dayRows[h_index]+1 }}
            >
              <div className="text-xl font-medium text-gray-400 uppercase text-center w-full">
                {day}
              </div>
            </div>
          ))}

          {/* Grid cells */}
          {gridCells.map((cell, index) => (
            <div
              key={index}
              className="border-l border-b border-t border-gray-200 dark:border-gray-200/5"
              style={{ gridColumn: cell.col, gridRow: cell.row}}
            ></div>
          ))}

          {/* Render fetched time slots */}
          {mappedSlots.map((slot) => (
            <div
              key={slot.id}
              className={`m-[2px] rounded-[4px] flex flex-col border border-gray-700/10 p-1 whitespace-normal wrap-break-word overflow-hidden`}
              style={{ gridColumn: slot.gridColumn, gridRow: slot.gridRow, backgroundColor: slot.color }}
            >
              <span className="p-2 text-xl font-medium text-white dark:text-fuchsia-100">
                {slot.title}
              </span>
              {slot.description && (
                <span className="px-2 text-sm font-medium text-white dark:text-fuchsia-100">
                  {slot.description}
                </span>
              )}
              {slot.location && (
                <span className="text-xs text-gray-500 dark:text-gray-300">{slot.location}</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}