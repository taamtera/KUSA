"use client";
import { useState, useEffect } from "react";

export default function Calendar() {

    const Days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const Hours = ["8:00", "", "9:00", "", "10:00", "", "11:00", "", "12:00", "", "13:00", "", "14:00", "", "15:00", "", "16:00", "", "17:00", "", "18:00", "", "19:00", "", "20:00"];


    return (
      <div class="relative mt-16 not-prose overflow-hidden rounded-lg bg-white outline outline-white/5 dark:bg-gray-950/50 w-full h-auto">
        <div class="overflow-hidden dark:bg-gray-800">
          <div class={`grid h-full grid-cols-[auto_repeat(${Hours.length},16px)] grid-rows-[auto_repeat(${Days.length},50px)] overflow-scroll`}>
            <div class="sticky top-0  z-10 col-start-1 row-start-1 border-b border-gray-800 bg-white bg-clip-padding py-2 text-sm font-medium text-gray-900 dark:border-black/10 dark:bg-gradient-to-b dark:from-gray-600 dark:to-gray-700 dark:text-gray-200"></div>
            {Hours.map((hour, index) => (
              <div key={index} class={`sticky top-0 w-16 z-10 col-start-${index + 2} row-start-1 border-b border-gray-800 bg-white bg-clip-padding py-2 text-center text-sm font-medium text-gray-900 dark:border-black/10 dark:bg-gradient-to-b dark:from-gray-600 dark:to-gray-700 dark:text-gray-200`}>
                <div class="w-16">{hour}</div>
              </div>
            ))}
            {Days.map((day, h_index) => (
              <div key={h_index} class={`sticky left-0  col-start-1 row-start-${h_index + 2} border-r border-gray-100 bg-white p-1.5 text-right text-xs font-medium text-gray-400 uppercase dark:border-gray-200/5 dark:bg-gray-800`}>
                {day}
              </div>
            ))}
            {Days.flatMap((_, h_index) =>
              Hours.map((_, d_index) => (
                <div key={`${h_index}-${d_index}`} class={`col-start-${d_index + 2} row-start-${h_index + 2} border-r border-b border-gray-200 dark:border-gray-200/5`}></div>
              ))
            )}
                        {/* <div class="col-start-3 row-span-4 row-start-2 m-1 flex flex-col rounded-lg border border-blue-700/10 bg-blue-400/20 p-1 dark:border-sky-500 dark:bg-sky-600/50">
                <span class="text-xs text-blue-600 dark:text-sky-100">
                    5 AM
                </span>
                <span class="text-xs font-medium text-blue-600 dark:text-sky-100">
                    Flight to Vancouver
                </span>
                <span class="text-xs text-blue-600 dark:text-sky-100">
                    Toronto YYZ
                </span>
            </div>
            <div class="col-start-4 row-span-4 row-start-3 m-1 flex flex-col border border-purple-700/10 bg-purple-400/20 p-1 dark:border-fuchsia-500 dark:bg-fuchsia-600/50">
                <span class="text-xs text-purple-600 dark:text-fuchsia-100">
                    6 AM
                </span>
                <span class="text-xs font-medium text-purple-600 dark:text-fuchsia-100">
                    Breakfast
                </span>
                <span class="text-xs text-purple-600 dark:text-fuchsia-100">
                    Mel's Diner
                </span>
            </div>
            <div class="col-start-7 row-span-3 row-start-14 m-1 flex flex-col rounded-lg border border-pink-700/10 bg-pink-400/20 p-1 dark:border-indigo-500 dark:bg-indigo-600/50">
                <span class="text-xs text-pink-600 dark:text-indigo-100">
                    5 PM
                </span>
                <span class="text-xs font-medium text-pink-600 dark:text-indigo-100">
                    🎉 Party party 🎉
                </span>
                <span class="text-xs text-pink-600 dark:text-indigo-100">
                    We like to party!
                </span>
            </div> */}
          </div>
        </div>
      </div>
    );
}
