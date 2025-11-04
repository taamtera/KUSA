"use client";
import React, { useId } from "react";
import { useState, useEffect } from "react";
import { useUser } from "../../../context/UserContext";
import useTimetable from "@/components/TableContent";
import { ChartNoAxesColumnIcon } from "lucide-react";
import { Popover, PopoverTrigger, PopoverContent, PopoverClose } from "@/components/ui/popover";
import TimeTablePopoverDetail from "./timetable-popover-detail";

export default function TimeTableGrid({ propUserId, onEditSlot, onDeleteSlot }) {
  const Days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const Hours = [
    "0:00", "1:00", "2:00", "3:00", "4:00", "5:00", "6:00", "7:00", "8:00", "9:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00", "21:00", "22:00", "23:00"
  ];

  const time_width = 75;
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

    const durationMin = endMin - startMin;
    const durationHours = durationMin / minutesPerColumn; // can be fractional (1.5h, 0.5h, etc.)

    const startCol = Math.floor(startMin / minutesPerColumn) + 2; // grid columns start at 2
    const spanCols = Math.max(1, Math.ceil((endMin - startMin) / minutesPerColumn));
    const row = (DAY_TO_INDEX[s.day] ?? 0) + 2; // grid rows start at 2
    return {
      id: s._id || `${s.day}-${s.start_min}-${s.end_min}`,
      title: s.title,
      description: s.description,
      location: s.location,
      color: s.color || '000000',
      gridColumn: `${startCol} / span ${spanCols}`,
      gridRow: row,
      maxWidthPx: durationHours * time_width,
      day: s.day,
      hourStart: Math.floor(startMin / 60),
      minStart: startMin % 60,
      hourEnd: Math.floor(endMin / 60),
      minEnd: endMin % 60,
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
    <div className="relative overflow-auto rounded-[16px] outline-gray-400 bg-white outline dark:bg-gray-950/50">
      <div className="dark:bg-gray-800">
        <div
          className={
            `grid 
            grid-cols-[repeat(${Hours.length + 1},${time_width}px)] 
            grid-rows-[repeat(${Days.length + 1},12px)] 
            min-w-max`
          }
        >

          {/* 1-1 column */}
          <div
            className="sticky top-0 left-0 z-50 bg-white dark:bg-gray-800 border-b border-r border-gray-100 dark:border-gray-200/5"
            style={{ gridColumn: 1, gridRow: 1 }} // match hour header height
          />

          {/* 2-1 column */}
          <div
            className="sticky top-0 left-0 z-10 bg-white dark:bg-gray-800 border-b border-r border-gray-100 dark:border-gray-200/5"
            style={{ gridColumn: 2, gridRow: 1 }} // match hour header height
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
                text-left 
                text-base 
                font-medium 
                text-gray-500 
                dark:border-black/10 
                dark:bg-gradient-to-b 
                dark:from-gray-600 
                dark:to-gray-700 
                dark:text-gray-200`
              }
              style={{ gridColumn: hourColumns[index], gridRow: 1, width: `${time_width}px`, }}
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
              className="sticky left-0 z-30 border-r border-gray-100 bg-white dark:border-gray-200/5 dark:bg-gray-800 flex items-center justify-center px-[25] h-[10vh] min-h-[72px]"
              style={{ gridColumn: 1, gridRow: dayRows[h_index] + 1 }}
            >
              <div className="text-xl font-medium text-gray-500 uppercase text-center w-full">
                {day}
              </div>
            </div>
          ))}

          {/* Grid cells */}
          {gridCells.map((cell, index) => (
            <div
              key={index}
              className="border-l border-b border-t border-gray-200 dark:border-gray-200/5"
              style={{ gridColumn: cell.col, gridRow: cell.row }}
            ></div>
          ))}

          {/* Render fetched time slots */}
          {mappedSlots.map((slot) => (
            // Timetable slot
            <Popover key={slot.id}>
              <PopoverTrigger
                className={`slot-card text-left m-[2px] rounded-[8px] flex flex-col border border-gray-700/10 px-1 py-0.5 whitespace-normal wrap-break-word overflow-hidden`}
                style={{ gridColumn: slot.gridColumn, gridRow: slot.gridRow, backgroundColor: slot.color, maxWidth: `${slot.maxWidthPx}px` }}>
                <span className="px-2 text-[14px] font-[1000] text-white dark:text-fuchsia-100 overflow-hidden truncate">
                  {slot.title}
                </span>
                {slot.description && (
                  <span className="slot-card-title px-2 text-[12px] italic text-gray-100 dark:text-fuchsia-100">
                    {slot.description}
                  </span>
                )}
                {slot.location && (
                  <span className="px-2 text-[12px] text-white dark:text-fuchsia-100">{slot.location}</span>
                )}
              </PopoverTrigger>

              {/* Slot Popover Detail */}
              <PopoverContent
                side="bottom"
                align="center"
                className="relative z-50 w-[500px] max-w-[50vw] min-w-[256px] max-h-[80vh] p-2 rounded-[8px] bg-white transparent shadow-[0_0px_15px_-3px] shadow-gray-400">
                <div className="flex flex-col h-auto">
                  <TimeTablePopoverDetail
                    title={slot.title}
                    description={slot.description}
                    location={slot.location}
                    slotColor={slot.color}
                    day={slot.day}
                    hourStart={slot.hourStart}
                    minStart={slot.minStart}
                    hourEnd={slot.hourEnd}
                    minEnd={slot.minEnd}
                    onEdit={() => onEditSlot?.(slot)}
                    onDelete={() => onDeleteSlot?.(slot)}
                  />
                </div>
              </PopoverContent>
            </Popover>
          ))}
        </div>
      </div>
    </div>
  );
}