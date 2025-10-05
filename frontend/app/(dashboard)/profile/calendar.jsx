// "use client";
// import { useState, useEffect } from "react";

// export default function Calendar() {

//     const Days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
//     const Hours = ["8:00", "9:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00"];

//     return (
//       <div class="relative mt-16 not-prose overflow-hidden rounded-lg bg-white outline outline-white/5 dark:bg-gray-950/50 w-full h-auto">
//         <div class="overflow-hidden dark:bg-gray-800">
//           <div class={`grid h-full grid-cols-[repeat(${Hours.length},16px)] grid-rows-[repeat(15,50px)] overflow-scroll`}>
//             <div className="sticky top-0  z-10 col-start-1 row-start-1 border-b border-gray-800 bg-white bg-clip-padding py-2 text-sm font-medium text-gray-900 dark:border-black/10 dark:bg-gradient-to-b dark:from-gray-600 dark:to-gray-700 dark:text-gray-200"></div>
//             {Hours.map((hour, index) => (
//               <div key={index} class={`sticky top-0 w-16 z-10 col-start-${index + 2} row-start-1 border-b border-gray-800 bg-white bg-clip-padding py-2 text-center text-sm font-medium text-gray-900 dark:border-black/10 dark:bg-gradient-to-b dark:from-gray-600 dark:to-gray-700 dark:text-gray-200`}>
//                 <div class="w-16">{hour}</div>
//               </div>
//             ))}
//             {Days.map((day, h_index) => (
//               <div key={h_index} class={`sticky left-0 col-start-1 row-start-${h_index + 1} border-r border-gray-100 bg-white p-1.5 text-right text-xs font-medium text-gray-400 uppercase dark:border-gray-200/5 dark:bg-gray-800`}>
//                 {day}
//               </div>
//             ))}
//             {Days.flatMap((_, h_index) =>
//               Hours.map((_, d_index) => (
//                 <div key={`${h_index}-${d_index}`} class={`col-start-${d_index + 2} row-start-${h_index + 2} border-r border-b border-gray-200 dark:border-gray-200/5`}></div>
//               ))
//             )}
//                         {/* <div class="col-start-3 row-span-4 row-start-2 m-1 flex flex-col rounded-lg border border-blue-700/10 bg-blue-400/20 p-1 dark:border-sky-500 dark:bg-sky-600/50">
//                 <span class="text-xs text-blue-600 dark:text-sky-100">
//                     5 AM
//                 </span>
//                 <span class="text-xs font-medium text-blue-600 dark:text-sky-100">
//                     Flight to Vancouver
//                 </span>
//                 <span class="text-xs text-blue-600 dark:text-sky-100">
//                     Toronto YYZ
//                 </span>
//             </div>
//             <div class="col-start-4 row-span-4 row-start-3 m-1 flex flex-col border border-purple-700/10 bg-purple-400/20 p-1 dark:border-fuchsia-500 dark:bg-fuchsia-600/50">
//                 <span class="text-xs text-purple-600 dark:text-fuchsia-100">
//                     6 AM
//                 </span>
//                 <span class="text-xs font-medium text-purple-600 dark:text-fuchsia-100">
//                     Breakfast
//                 </span>
//                 <span class="text-xs text-purple-600 dark:text-fuchsia-100">
//                     Mel's Diner
//                 </span>
//             </div>
//             <div class="col-start-7 row-span-3 row-start-14 m-1 flex flex-col rounded-lg border border-pink-700/10 bg-pink-400/20 p-1 dark:border-indigo-500 dark:bg-indigo-600/50">
//                 <span class="text-xs text-pink-600 dark:text-indigo-100">
//                     5 PM
//                 </span>
//                 <span class="text-xs font-medium text-pink-600 dark:text-indigo-100">
//                     🎉 Party party 🎉
//                 </span>
//                 <span class="text-xs text-pink-600 dark:text-indigo-100">
//                     We like to party!
//                 </span>
//             </div> */}
//           </div>
//         </div>
//       </div>
//     );
// }

// "use client";
// import { useState, useEffect } from "react";

// export default function Calendar() {
//   const Days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
//   const Hours = [
//     "0:00", "1:00", "2:00", "3:00", "4:00", "5:00", "6:00", "7:00","8:00", "9:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00", "21:00", "22:00", "23:00", ""
//   ];
//   const time_width = 150;

//   // Pre-calculate grid positions
//   const hourColumns = Hours.map((_, index) => index + 2);
//   const dayRows = Days.map((_, index) => index + 1);
//   const gridCells = Days.flatMap((_, h_index) =>
//     Hours.map((_, d_index) => ({
//       col: d_index + 2,
//       row: h_index + 2,
//     }))
//   );

//   return (
//     <div class="relative mt-16 mr-8 not-prose overflow-hidden rounded-lg outline-gray-400 bg-white outline dark:bg-gray-950/50 w-full h-auto">
//       <div class="dark:bg-gray-800">
//         <div
//           class={`grid grid-cols-[repeat(${Hours.length},16px)] grid-rows-[repeat(${Days.length+1},12px)] overflow-y-auto overflow-x-auto`}
//         >
          
//           {/* 1-1 column */}
//           <div
//             className="sticky top-0 left-0 z-50 bg-white dark:bg-gray-800 border-b border-r border-gray-100 dark:border-gray-200/5"
//             style={{ gridColumn: 1, gridRow: 1}} // match hour header height
//           />

//           {/* Hour headers */}
//           {Hours.map((hour, index) => (
//             <div
//               key={index}
//               className={`sticky top-0 z-40 border-gray-800 bg-white bg-clip-padding py-2 text-center text-sm font-medium text-gray-900 dark:border-black/10 dark:bg-gradient-to-b dark:from-gray-600 dark:to-gray-700 dark:text-gray-200`}
//               style={{ gridColumn: hourColumns[index], gridRow: 1, width: `${time_width}px`, transform: `translateX(${time_width/2}px)` }}
//             >
//               <div
//                 style={{ width: `${time_width}px` }}
//               >{hour}</div>
//             </div>
//           ))}

//           {/* Day headers */}
//           {Days.map((day, h_index) => (
//             <div
//               key={h_index}
//               className="sticky left-0 z-30 border-r border-gray-100 bg-white px-15  min-h-[100px] h-[10vh] justify-center items-center text-xl font-medium text-gray-400 uppercase dark:border-gray-200/5 dark:bg-gray-800"
//               style={{ gridColumn: 1, gridRow: dayRows[h_index]+1 }}
//             >
//               {day}
//             </div>
//           ))}

//           {/* Grid cells */}
//           {gridCells.map((cell, index) => (
//             <div
//               key={index}
//               class="border-r border-b border-t border-gray-200 dark:border-gray-200/5"
//               style={{ gridColumn: cell.col, gridRow: cell.row}}
//             ></div>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// }

"use client";
import { useState, useEffect } from "react";

export default function Calendar() {
  const Days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const Hours = [
    "0:00", "1:00", "2:00", "3:00", "4:00", "5:00", "6:00", "7:00","8:00", "9:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00", "21:00", "22:00", "23:00", ""
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
    <div class="relative mt-16 mr-8 not-prose overflow-hidden rounded-lg outline-gray-400 bg-white outline dark:bg-gray-950/50 w-full h-auto">
      <div class="dark:bg-gray-800">
        <div
          class={`grid grid-cols-[repeat(${Hours.length},16px)] grid-rows-[repeat(${Days.length+1},12px)] overflow-y-auto overflow-x-auto`}
        >
          
          {/* 1-1 column */}
          <div
            className="sticky top-0 left-0 z-50 bg-white dark:bg-gray-800 border-b border-r border-gray-100 dark:border-gray-200/5"
            style={{ gridColumn: 1, gridRow: 1}} // match hour header height
          />

          {/* Hour headers */}
          {Hours.map((hour, index) => (
            <div
              key={index}
              className={`sticky top-0 z-40 border-gray-800 bg-white bg-clip-padding py-2 text-center text-sm font-medium text-gray-900 dark:border-black/10 dark:bg-gradient-to-b dark:from-gray-600 dark:to-gray-700 dark:text-gray-200`}
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
              className="sticky left-0 z-30 border-r border-gray-100 bg-white dark:border-gray-200/5 dark:bg-gray-800 flex items-center justify-center min-h-[100px] h-[10vh]"
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