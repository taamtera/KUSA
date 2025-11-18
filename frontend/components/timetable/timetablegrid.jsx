"use client";
import React, { useId } from "react";
import { useState, useEffect } from "react";
import { useUser } from "../../context/UserContext";
import useTimetable from "@/components/TableContent";
import { MapPin } from "lucide-react";
import { Popover, PopoverTrigger, PopoverContent, PopoverClose } from "@/components/ui/popover";
import TimeTablePopoverDetail from "./timetable-popover-detail";

import {
  DAYS,
  DAY_TO_INDEX,
  MINUTES_PER_COLUMN,
  COLS_PER_DAY,
  TIME_WIDTH,
  pad2,
} from "./time-utils";

export default function TimeTableGrid({ propUserId, onEditSlot, onDeleteSlot }) {

  const minutesPerColumn = MINUTES_PER_COLUMN;
  const colsPerDay = COLS_PER_DAY;
  const time_width = TIME_WIDTH;
  const Days = DAYS;

  const columnsPerHour = 60 / minutesPerColumn; // 4 when 15 minutes, 2 when 30, 1 when 60
  const hoursPerDay = 24;

  const timeLabels = Array.from({ length: hoursPerDay }, (_, h) => `${pad2(h)}`); 

  // const [slots, setSlots] = useState([]);
  const { user } = useUser();
  const userId = propUserId || user?._id;
  const { slots, loading, error, reload } = useTimetable(userId);

  // helper map to convert backend day ('mon') -> row index where Sun=0
  const DAY_TO_INDEX = { sun: 0, mon: 1, tue: 2, wed: 3, thu: 4, fri: 5, sat: 6 };

  // Convert slots into grid placement props
  const mappedSlots = slots.map((s) => {
    const startMin = Number(s.start_min);
    const endMin = Number(s.end_min);

    const durationMin = endMin - startMin;
    const durationCols = durationMin / minutesPerColumn;

    const startCol = Math.floor(startMin / minutesPerColumn) + 2;
    const spanCols = Math.max(1, Math.ceil(durationMin / minutesPerColumn));
    const row = (DAY_TO_INDEX[s.day] ?? 0) + 2;

    return {
      id: s._id || `${s.day}-${s.start_min}-${s.end_min}`,
      title: s.title,
      description: s.description,
      location: s.location,
      color: s.color || "#2b2b2b",
      gridColumn: `${startCol} / span ${spanCols}`,
      gridRow: row,
      day: s.day,
      hourStart: Math.floor(startMin / 60),
      minStart: startMin % 60,
      hourEnd: Math.floor(endMin / 60),
      minEnd: endMin % 60,
    };
  });


  if (!userId || loading) return <div>Loading timetable...</div>;

  // Pre-calculate grid positions
  const dayRows = Days.map((_, index) => index + 1);
  const gridCells = Days.flatMap((_, dayIndex) =>
    Array.from({ length: colsPerDay }, (_, colIndex) => {
      const colsPerHour = 60 / minutesPerColumn;   // 4 when 15min
      const isHour = colIndex % colsPerHour === 0; // 0,4,8,... full hours

      // half-hour = 30 minutes; that’s half an hour index
      const isHalfHour =
        !isHour && colIndex % (colsPerHour / 2) === 0; // 2,6,10,... when 15min

      return {
        col: colIndex + 2,
        row: dayIndex + 2,
        isHour,
        isHalfHour,
      };
    })
  );


  return (
    <div className="relative overflow-auto rounded-[16px] outline-gray-400 bg-white outline dark:bg-gray-950/50">
      <div className="dark:bg-gray-800">
        <div
          className={
            `grid 
            grid-cols-[repeat(${colsPerDay + 1},${time_width}px)] 
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
          {timeLabels.map((label, hourIndex) => {
            const startCol = 2 + hourIndex * columnsPerHour; // col 2 is the first time column

            return (
              <div
                key={hourIndex}
                className="sticky border-b border-gray-200 top-0 z-10 border-gray-100 bg-white bg-clip-padding py-2 text-left text-base font-medium text-gray-500 dark:border-black/10 dark:bg-gradient-to-b dark:from-gray-600 dark:to-gray-700 dark:text-gray-200"
                style={{
                  gridColumn: `${startCol} / span ${columnsPerHour}`,
                  gridRow: 1,
                }}
              >
                <div className="w-full">
                  {label}
                </div>
              </div>
            );
          })}

          {/* Day headers */}
          {Days.map((day, h_index) => (
            <div
              key={h_index}
              className="sticky left-0 z-30 border-r border-gray-200 bg-white dark:border-gray-200/5 dark:bg-gray-800 flex items-center justify-center px-[4px] h-[10vh] max-h-[48px] min-h-[72px]"
              style={{ gridColumn: 1, gridRow: dayRows[h_index] + 1 }}
            >
              <div className="text-[16px] font-medium text-gray-500 uppercase text-center w-full">
                {day}
              </div>
            </div>
          ))}

          {/* Grid cells */}
          {gridCells.map((cell, index) => {
            // base class = horizontal line
            let className =
              "border-b border-gray-300 dark:border-gray-200/5 min-w-[12px]";

            // vertical lines only at 60 and 30 minutes
            if (cell.isHour) {
              // thicker / darker for hours
              className += " border-l border-l-gray-300 dark:border-l-gray-400";
            } else if (cell.isHalfHour) {
              // normal for half-hour
              className += " border-l border-l-gray-100 dark:border-l-gray-500";
            } else {
              // no left border at 15-minute marks
              className += " border-l-0";
            }

            return (
              <div
                key={index}
                className={className}
                style={{ gridColumn: cell.col, gridRow: cell.row }}
              />
            );
          })}


          {/* Render fetched time slots */}
          {mappedSlots.map((slot) => (
            // Timetable slot
            <Popover key={slot.id}>
              <PopoverTrigger
                className={`slot-card text-left m-[2px] rounded-[8px] flex flex-col border border-gray-700/10 px-1 py-0.5 whitespace-normal wrap-break-word overflow-hidden`}
                style={{ gridColumn: slot.gridColumn, gridRow: slot.gridRow, backgroundColor: slot.color, }}>
                <span className="px-2 text-[14px] font-[1000] text-white dark:text-fuchsia-100 overflow-hidden truncate">
                  {slot.title}
                </span>
                {slot.description && (
                  <span className="slot-card-title px-2 text-[12px] italic text-gray-100 dark:text-fuchsia-100">
                    {slot.description}
                  </span>
                )}
                {slot.location && (
                  <span className="flex items-center pl-0.5 pr-2 text-[12px] text-white dark:text-fuchsia-100">
                    <MapPin className="size-[16px]" /> <p className="overflow-hidden truncate">{slot.location}</p>
                  </span>
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
                    slotId={slot.id}
                    onEdit={() => onEditSlot?.(slot)}
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