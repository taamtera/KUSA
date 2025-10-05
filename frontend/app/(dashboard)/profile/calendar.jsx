"use client";
import { useState, useEffect } from "react";

export default function Calendar() {
  const Days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const Hours = [
    "0:00", "1:00", "2:00", "3:00", "4:00", "5:00", "6:00", "7:00","8:00", "9:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00", "21:00", "22:00", "23:00"
  ];
  const time_width = 150;

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
    <div class="relative mt-16 mr-8 not-prose overflow-auto rounded-lg outline-gray-400 bg-white outline dark:bg-gray-950/50 w-full h-auto">
      <div class="dark:bg-gray-800">
        <div
          class={
            `grid 
            grid-cols-[repeat(${Hours.length+1},16px)] 
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
              class="border-r border-b border-t border-gray-200 dark:border-gray-200/5"
              style={{ gridColumn: cell.col, gridRow: cell.row}}
            ></div>
          ))}
        </div>
      </div>
    </div>
  );
}