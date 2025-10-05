"use client";

export default function test() {
    const Days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    // const Hours = ["5 AM", "6 AM", "7 AM", "8 AM", "9 AM", "10 AM", "11 AM", "12 PM", "1 PM", "2 PM", "3 PM", "4 PM", "5 PM", "6 PM", "7 PM", "8 PM"];
    const Hours = [
        "8:00",
        "8:30",
        "9:00",
        "9:30",
        "10:00",
        "10:30",
        "11:00",
        "11:30",
        "12:00",
        "12:30",
        "13:00",
        "13:30",
        "14:00",
        "14:30",
        "15:00",
        "15:30",
        "16:00",
        "16:30",
        "17:00",
        "17:30",
        "18:00",
        "18:30",
        "19:00",
        "19:30",
        "20:00",
    ];
    const hourColumns = Hours.map((_, index) => index + 2); // Starts from col 2
    const dayRows = Days.map((_, index) => index + 2); // Starts from row 2 (leaving row 1 empty)
    const gridCells = Days.flatMap((_, h_index) =>
        Hours.map((_, d_index) => ({
            col: d_index + 2, // Starts from col 2
            row: h_index + 2  // Starts from row 2
        }))
    );

    return (
        <div className="w-full">
            <div className="pt-60 pl-4 mb-6 p-12 md:p-14 lg:p-16 xl:p-18">
                <div className="text-8xl text-center">KUSA</div>
                <div
                    className="text-5xl text-center font-bold"
                    style={{ marginTop: 3 + "em" }}
                >
                    Login
                </div>
                <div className="flex justify-center mt-2">
                    <div class="not-prose overflow-auto rounded-lg bg-white outline outline-white/5 dark:bg-gray-950/50">
                        <div class="over7flow-scroll dark:bg-gray-800">
                            {/* <div class="grid max-h-90 grid-cols-[auto_repeat(7,150px)] grid-rows-[auto_repeat(16,50px)] overflow-scroll"> */}
                            {/* <div class="grid max-h-90 grid-cols-[auto_repeat(16,50px)] grid-rows-[auto_repeat(7,150px)] overflow-scroll"> */}
                            <div
                                class={`grid max-h-90 grid-cols-[auto_repeat(${Hours.length},50px)] grid-rows-[auto_repeat(${Days.length},50px)] overflow-scroll`}
                            >
                                <div class="sticky top-0 z-10 col-start-1 row-start-1 border-b border-gray-800 bg-white bg-clip-padding py-2 text-sm font-medium text-gray-900 dark:border-black/10 dark:bg-gradient-to-b dark:from-gray-600 dark:to-gray-700 dark:text-gray-200"></div>
                                {Hours.map((day, index) => (
                                    <div
                                        key={index}
                                        class={`sticky top-0 z-10 min-w-20 col-start-${index + 2
                                            } row-start-1 border-b border-gray-800 bg-white bg-clip-padding py-2 text-center text-sm font-medium text-gray-900 dark:border-black/10 dark:bg-gradient-to-b dark:from-gray-600 dark:to-gray-700 dark:text-gray-200`}
                                    >
                                        {day}
                                    </div>
                                ))}
                                {Days.map((hour, h_index) => (
                                    <>
                                        <div
                                            key={h_index}
                                            class={`sticky left-0 col-start-1 row-start-${h_index + 2
                                                } border-r border-gray-100 bg-white p-1.5 text-right text-xs font-medium text-gray-400 uppercase dark:border-gray-200/5 dark:bg-gray-800`}
                                        >
                                            {hour}
                                        </div>
                                        {Days.map((day, d_index) => {
                                            if (
                                                d_index == Days.length - 1 &&
                                                h_index == Hours.length - 1
                                            ) {
                                                // <div class="col-start-8 row-start-17"></div>
                                                return (
                                                    <div
                                                        class={`col-start-${d_index + 2} row-start-${h_index + 2
                                                            }`}
                                                    ></div>
                                                );
                                            } else if (d_index == Days.length - 1) {
                                                // <div class="col-start-8 row-start-2 border-b border-gray-800 dark:border-gray-200/5"></div>
                                                return (
                                                    <div
                                                        class={`col-start-${d_index + 2} row-start-${h_index + 2
                                                            } border-b border-gray-200 dark:border-gray-200/5`}
                                                    ></div>
                                                );
                                            } else {
                                                // <div class="col-start-2 row-start-2 border-r border-b border-gray-200 dark:border-gray-200/5"></div>
                                                return (
                                                    <div
                                                        class={`col-start-${d_index + 2} row-start-${h_index + 2
                                                            } border-r border-b border-gray-200 dark:border-gray-200/5`}
                                                    ></div>
                                                );
                                            }
                                        })}
                                    </>
                                ))}
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
                </div>
            </div>
            <div>
                <div className="flex justify-center" style={{ marginTop: 2 + "cm" }}>
                    <div class="not-prose overflow-auto rounded-lg bg-white outline outline-white/5 dark:bg-gray-950/50">
                        <div class="overflow-hidden dark:bg-gray-800">
                            <div class="grid max-h-90 grid-cols-\[70px\_repeat(7,150px)] grid-rows-\[auto\_repeat(16,50px)] overflow-scroll">
                                <div class="sticky top-0 z-10 col-start-1 row-start-1 border-b border-gray-100 bg-white bg-clip-padding py-2 text-sm font-medium text-gray-900 dark:border-black/10 dark:bg-gradient-to-b dark:from-gray-600 dark:to-gray-700 dark:text-gray-200"></div>
                                <div class="sticky top-0 z-10 col-start-2 row-start-1 border-b border-gray-100 bg-white bg-clip-padding py-2 text-center text-sm font-medium text-gray-900 dark:border-black/10 dark:bg-gradient-to-b dark:from-gray-600 dark:to-gray-700 dark:text-gray-200">
                                    Sun
                                </div>
                                <div class="sticky top-0 z-10 col-start-3 row-start-1 border-b border-gray-100 bg-white bg-clip-padding py-2 text-center text-sm font-medium text-gray-900 dark:border-black/10 dark:bg-gradient-to-b dark:from-gray-600 dark:to-gray-700 dark:text-gray-200">
                                    Mon
                                </div>
                                <div class="sticky top-0 z-10 col-start-4 row-start-1 border-b border-gray-100 bg-white bg-clip-padding py-2 text-center text-sm font-medium text-gray-900 dark:border-black/10 dark:bg-gradient-to-b dark:from-gray-600 dark:to-gray-700 dark:text-gray-200">
                                    Tue
                                </div>
                                <div class="sticky top-0 z-10 col-start-5 row-start-1 border-b border-gray-100 bg-white bg-clip-padding py-2 text-center text-sm font-medium text-gray-900 dark:border-black/10 dark:bg-gradient-to-b dark:from-gray-600 dark:to-gray-700 dark:text-gray-200">
                                    Wed
                                </div>
                                <div class="sticky top-0 z-10 col-start-6 row-start-1 border-b border-gray-100 bg-white bg-clip-padding py-2 text-center text-sm font-medium text-gray-900 dark:border-black/10 dark:bg-gradient-to-b dark:from-gray-600 dark:to-gray-700 dark:text-gray-200">
                                    Thu
                                </div>
                                <div class="sticky top-0 z-10 col-start-7 row-start-1 border-b border-gray-100 bg-white bg-clip-padding py-2 text-center text-sm font-medium text-gray-900 dark:border-black/10 dark:bg-gradient-to-b dark:from-gray-600 dark:to-gray-700 dark:text-gray-200">
                                    Fri
                                </div>
                                <div class="sticky top-0 z-10 col-start-8 row-start-1 border-b border-gray-100 bg-white bg-clip-padding py-2 text-center text-sm font-medium text-gray-900 dark:border-black/10 dark:bg-gradient-to-b dark:from-gray-600 dark:to-gray-700 dark:text-gray-200">
                                    Sat
                                </div>
                                <div class="sticky left-0 col-start-1 row-start-2 border-r border-gray-100 bg-white p-1.5 text-right text-xs font-medium text-gray-400 uppercase dark:border-gray-200/5 dark:bg-gray-800">
                                    5 AM
                                </div>
                                <div class="col-start-2 row-start-2 border-r border-b border-gray-100 dark:border-gray-200/5"></div>
                                <div class="col-start-3 row-start-2 border-r border-b border-gray-100 dark:border-gray-200/5"></div>
                                <div class="col-start-4 row-start-2 border-r border-b border-gray-100 dark:border-gray-200/5"></div>
                                <div class="col-start-5 row-start-2 border-r border-b border-gray-100 dark:border-gray-200/5"></div>
                                <div class="col-start-6 row-start-2 border-r border-b border-gray-100 dark:border-gray-200/5"></div>
                                <div class="col-start-7 row-start-2 border-r border-b border-gray-100 dark:border-gray-200/5"></div>
                                <div class="col-start-8 row-start-2 border-b border-gray-100 dark:border-gray-200/5"></div>
                                <div class="sticky left-0 col-start-1 row-start-3 border-r border-gray-100 bg-white p-1.5 text-right text-xs font-medium text-gray-400 uppercase dark:border-gray-200/5 dark:bg-gray-800">
                                    6 AM
                                </div>
                                <div class="col-start-2 row-start-3 border-r border-b border-gray-100 dark:border-gray-200/5"></div>
                                <div class="col-start-3 row-start-3 border-r border-b border-gray-100 dark:border-gray-200/5"></div>
                                <div class="col-start-4 row-start-3 border-r border-b border-gray-100 dark:border-gray-200/5"></div>
                                <div class="col-start-5 row-start-3 border-r border-b border-gray-100 dark:border-gray-200/5"></div>
                                <div class="col-start-6 row-start-3 border-r border-b border-gray-100 dark:border-gray-200/5"></div>
                                <div class="col-start-7 row-start-3 border-r border-b border-gray-100 dark:border-gray-200/5"></div>
                                <div class="col-start-8 row-start-3 border-b border-gray-100 dark:border-gray-200/5"></div>
                                <div class="sticky left-0 col-start-1 row-start-4 border-r border-gray-100 bg-white p-1.5 text-right text-xs font-medium text-gray-400 uppercase dark:border-gray-200/5 dark:bg-gray-800">
                                    7 AM
                                </div>
                                <div class="col-start-2 row-start-4 border-r border-b border-gray-100 dark:border-gray-200/5"></div>
                                <div class="col-start-3 row-start-4 border-r border-b border-gray-100 dark:border-gray-200/5"></div>
                                <div class="col-start-4 row-start-4 border-r border-b border-gray-100 dark:border-gray-200/5"></div>
                                <div class="col-start-5 row-start-4 border-r border-b border-gray-100 dark:border-gray-200/5"></div>
                                <div class="col-start-6 row-start-4 border-r border-b border-gray-100 dark:border-gray-200/5"></div>
                                <div class="col-start-7 row-start-4 border-r border-b border-gray-100 dark:border-gray-200/5"></div>
                                <div class="col-start-8 row-start-4 border-b border-gray-100 dark:border-gray-200/5"></div>
                                <div class="sticky left-0 col-start-1 row-start-5 border-r border-gray-100 bg-white p-1.5 text-right text-xs font-medium text-gray-400 uppercase dark:border-gray-200/5 dark:bg-gray-800">
                                    8 AM
                                </div>
                                <div class="col-start-2 row-start-5 border-r border-b border-gray-100 dark:border-gray-200/5"></div>
                                <div class="col-start-3 row-start-5 border-r border-b border-gray-100 dark:border-gray-200/5"></div>
                                <div class="col-start-4 row-start-5 border-r border-b border-gray-100 dark:border-gray-200/5"></div>
                                <div class="col-start-5 row-start-5 border-r border-b border-gray-100 dark:border-gray-200/5"></div>
                                <div class="col-start-6 row-start-5 border-r border-b border-gray-100 dark:border-gray-200/5"></div>
                                <div class="col-start-7 row-start-5 border-r border-b border-gray-100 dark:border-gray-200/5"></div>
                                <div class="col-start-8 row-start-5 border-b border-gray-100 dark:border-gray-200/5"></div>
                                <div class="sticky left-0 col-start-1 row-start-6 border-r border-gray-100 bg-white p-1.5 text-right text-xs font-medium text-gray-400 uppercase dark:border-gray-200/5 dark:bg-gray-800">
                                    9 AM
                                </div>
                                <div class="col-start-2 row-start-6 border-r border-b border-gray-100 dark:border-gray-200/5"></div>
                                <div class="col-start-3 row-start-6 border-r border-b border-gray-100 dark:border-gray-200/5"></div>
                                <div class="col-start-4 row-start-6 border-r border-b border-gray-100 dark:border-gray-200/5"></div>
                                <div class="col-start-5 row-start-6 border-r border-b border-gray-100 dark:border-gray-200/5"></div>
                                <div class="col-start-6 row-start-6 border-r border-b border-gray-100 dark:border-gray-200/5"></div>
                                <div class="col-start-7 row-start-6 border-r border-b border-gray-100 dark:border-gray-200/5"></div>
                                <div class="col-start-8 row-start-6 border-b border-gray-100 dark:border-gray-200/5"></div>
                                <div class="sticky left-0 col-start-1 row-start-7 border-r border-gray-100 bg-white p-1.5 text-right text-xs font-medium text-gray-400 uppercase dark:border-gray-200/5 dark:bg-gray-800">
                                    10 AM
                                </div>
                                <div class="col-start-2 row-start-7 border-r border-b border-gray-100 dark:border-gray-200/5"></div>
                                <div class="col-start-3 row-start-7 border-r border-b border-gray-100 dark:border-gray-200/5"></div>
                                <div class="col-start-4 row-start-7 border-r border-b border-gray-100 dark:border-gray-200/5"></div>
                                <div class="col-start-5 row-start-7 border-r border-b border-gray-100 dark:border-gray-200/5"></div>
                                <div class="col-start-6 row-start-7 border-r border-b border-gray-100 dark:border-gray-200/5"></div>
                                <div class="col-start-7 row-start-7 border-r border-b border-gray-100 dark:border-gray-200/5"></div>
                                <div class="col-start-8 row-start-7 border-b border-gray-100 dark:border-gray-200/5"></div>
                                <div class="sticky left-0 col-start-1 row-start-8 border-r border-gray-100 bg-white p-1.5 text-right text-xs font-medium text-gray-400 uppercase dark:border-gray-200/5 dark:bg-gray-800">
                                    11 AM
                                </div>
                                <div class="col-start-2 row-start-8 border-r border-b border-gray-100 dark:border-gray-200/5"></div>
                                <div class="col-start-3 row-start-8 border-r border-b border-gray-100 dark:border-gray-200/5"></div>
                                <div class="col-start-4 row-start-8 border-r border-b border-gray-100 dark:border-gray-200/5"></div>
                                <div class="col-start-5 row-start-8 border-r border-b border-gray-100 dark:border-gray-200/5"></div>
                                <div class="col-start-6 row-start-8 border-r border-b border-gray-100 dark:border-gray-200/5"></div>
                                <div class="col-start-7 row-start-8 border-r border-b border-gray-100 dark:border-gray-200/5"></div>
                                <div class="col-start-8 row-start-8 border-b border-gray-100 dark:border-gray-200/5"></div>
                                <div class="sticky left-0 col-start-1 row-start-9 border-r border-gray-100 bg-white p-1.5 text-right text-xs font-medium text-gray-400 uppercase dark:border-gray-200/5 dark:bg-gray-800">
                                    12 PM
                                </div>
                                <div class="col-start-2 row-start-9 border-r border-b border-gray-100 dark:border-gray-200/5"></div>
                                <div class="col-start-3 row-start-9 border-r border-b border-gray-100 dark:border-gray-200/5"></div>
                                <div class="col-start-4 row-start-9 border-r border-b border-gray-100 dark:border-gray-200/5"></div>
                                <div class="col-start-5 row-start-9 border-r border-b border-gray-100 dark:border-gray-200/5"></div>
                                <div class="col-start-6 row-start-9 border-r border-b border-gray-100 dark:border-gray-200/5"></div>
                                <div class="col-start-7 row-start-9 border-r border-b border-gray-100 dark:border-gray-200/5"></div>
                                <div class="col-start-8 row-start-9 border-b border-gray-100 dark:border-gray-200/5"></div>
                                <div class="sticky left-0 col-start-1 row-start-10 border-r border-gray-100 bg-white p-1.5 text-right text-xs font-medium text-gray-400 uppercase dark:border-gray-200/5 dark:bg-gray-800">
                                    1 PM
                                </div>
                                <div class="col-start-2 row-start-10 border-r border-b border-gray-100 dark:border-gray-200/5"></div>
                                <div class="col-start-3 row-start-10 border-r border-b border-gray-100 dark:border-gray-200/5"></div>
                                <div class="col-start-4 row-start-10 border-r border-b border-gray-100 dark:border-gray-200/5"></div>
                                <div class="col-start-5 row-start-10 border-r border-b border-gray-100 dark:border-gray-200/5"></div>
                                <div class="col-start-6 row-start-10 border-r border-b border-gray-100 dark:border-gray-200/5"></div>
                                <div class="col-start-7 row-start-10 border-r border-b border-gray-100 dark:border-gray-200/5"></div>
                                <div class="col-start-8 row-start-10 border-b border-gray-100 dark:border-gray-200/5"></div>
                                <div class="sticky left-0 col-start-1 row-start-11 border-r border-gray-100 bg-white p-1.5 text-right text-xs font-medium text-gray-400 uppercase dark:border-gray-200/5 dark:bg-gray-800">
                                    2 PM
                                </div>
                                <div class="col-start-2 row-start-11 border-r border-b border-gray-100 dark:border-gray-200/5"></div>
                                <div class="col-start-3 row-start-11 border-r border-b border-gray-100 dark:border-gray-200/5"></div>
                                <div class="col-start-4 row-start-11 border-r border-b border-gray-100 dark:border-gray-200/5"></div>
                                <div class="col-start-5 row-start-11 border-r border-b border-gray-100 dark:border-gray-200/5"></div>
                                <div class="col-start-6 row-start-11 border-r border-b border-gray-100 dark:border-gray-200/5"></div>
                                <div class="col-start-7 row-start-11 border-r border-b border-gray-100 dark:border-gray-200/5"></div>
                                <div class="col-start-8 row-start-11 border-b border-gray-100 dark:border-gray-200/5"></div>
                                <div class="sticky left-0 col-start-1 row-start-12 border-r border-gray-100 bg-white p-1.5 text-right text-xs font-medium text-gray-400 uppercase dark:border-gray-200/5 dark:bg-gray-800">
                                    3 PM
                                </div>
                                <div class="col-start-2 row-start-12 border-r border-b border-gray-100 dark:border-gray-200/5"></div>
                                <div class="col-start-3 row-start-12 border-r border-b border-gray-100 dark:border-gray-200/5"></div>
                                <div class="col-start-4 row-start-12 border-r border-b border-gray-100 dark:border-gray-200/5"></div>
                                <div class="col-start-5 row-start-12 border-r border-b border-gray-100 dark:border-gray-200/5"></div>
                                <div class="col-start-6 row-start-12 border-r border-b border-gray-100 dark:border-gray-200/5"></div>
                                <div class="col-start-7 row-start-12 border-r border-b border-gray-100 dark:border-gray-200/5"></div>
                                <div class="col-start-8 row-start-12 border-b border-gray-100 dark:border-gray-200/5"></div>
                                <div class="sticky left-0 col-start-1 row-start-13 border-r border-gray-100 bg-white p-1.5 text-right text-xs font-medium text-gray-400 uppercase dark:border-gray-200/5 dark:bg-gray-800">
                                    4 PM
                                </div>
                                <div class="col-start-2 row-start-13 border-r border-b border-gray-100 dark:border-gray-200/5"></div>
                                <div class="col-start-3 row-start-13 border-r border-b border-gray-100 dark:border-gray-200/5"></div>
                                <div class="col-start-4 row-start-13 border-r border-b border-gray-100 dark:border-gray-200/5"></div>
                                <div class="col-start-5 row-start-13 border-r border-b border-gray-100 dark:border-gray-200/5"></div>
                                <div class="col-start-6 row-start-13 border-r border-b border-gray-100 dark:border-gray-200/5"></div>
                                <div class="col-start-7 row-start-13 border-r border-b border-gray-100 dark:border-gray-200/5"></div>
                                <div class="col-start-8 row-start-13 border-b border-gray-100 dark:border-gray-200/5"></div>
                                <div class="sticky left-0 col-start-1 row-start-14 border-r border-gray-100 bg-white p-1.5 text-right text-xs font-medium text-gray-400 uppercase dark:border-gray-200/5 dark:bg-gray-800">
                                    5 PM
                                </div>
                                <div class="col-start-2 row-start-14 border-r border-b border-gray-100 dark:border-gray-200/5"></div>
                                <div class="col-start-3 row-start-14 border-r border-b border-gray-100 dark:border-gray-200/5"></div>
                                <div class="col-start-4 row-start-14 border-r border-b border-gray-100 dark:border-gray-200/5"></div>
                                <div class="col-start-5 row-start-14 border-r border-b border-gray-100 dark:border-gray-200/5"></div>
                                <div class="col-start-6 row-start-14 border-r border-b border-gray-100 dark:border-gray-200/5"></div>
                                <div class="col-start-7 row-start-14 border-r border-b border-gray-100 dark:border-gray-200/5"></div>
                                <div class="col-start-8 row-start-14 border-b border-gray-100 dark:border-gray-200/5"></div>
                                <div class="sticky left-0 col-start-1 row-start-15 border-r border-gray-100 bg-white p-1.5 text-right text-xs font-medium text-gray-400 uppercase dark:border-gray-200/5 dark:bg-gray-800">
                                    6 PM
                                </div>
                                <div class="col-start-2 row-start-15 border-r border-b border-gray-100 dark:border-gray-200/5"></div>
                                <div class="col-start-3 row-start-15 border-r border-b border-gray-100 dark:border-gray-200/5"></div>
                                <div class="col-start-4 row-start-15 border-r border-b border-gray-100 dark:border-gray-200/5"></div>
                                <div class="col-start-5 row-start-15 border-r border-b border-gray-100 dark:border-gray-200/5"></div>
                                <div class="col-start-6 row-start-15 border-r border-b border-gray-100 dark:border-gray-200/5"></div>
                                <div class="col-start-7 row-start-15 border-r border-b border-gray-100 dark:border-gray-200/5"></div>
                                <div class="col-start-8 row-start-15 border-b border-gray-100 dark:border-gray-200/5"></div>
                                <div class="sticky left-0 col-start-1 row-start-16 border-r border-gray-100 bg-white p-1.5 text-right text-xs font-medium text-gray-400 uppercase dark:border-gray-200/5 dark:bg-gray-800">
                                    7 PM
                                </div>
                                <div class="col-start-2 row-start-16 border-r border-b border-gray-100 dark:border-gray-200/5"></div>
                                <div class="col-start-3 row-start-16 border-r border-b border-gray-100 dark:border-gray-200/5"></div>
                                <div class="col-start-4 row-start-16 border-r border-b border-gray-100 dark:border-gray-200/5"></div>
                                <div class="col-start-5 row-start-16 border-r border-b border-gray-100 dark:border-gray-200/5"></div>
                                <div class="col-start-6 row-start-16 border-r border-b border-gray-100 dark:border-gray-200/5"></div>
                                <div class="col-start-7 row-start-16 border-r border-b border-gray-100 dark:border-gray-200/5"></div>
                                <div class="col-start-8 row-start-16 border-b border-gray-100 dark:border-gray-200/5"></div>
                                <div class="sticky left-0 col-start-1 row-start-17 border-r border-gray-100 bg-white p-1.5 text-right text-xs font-medium text-gray-400 uppercase dark:border-gray-200/5 dark:bg-gray-800">
                                    8 PM
                                </div>
                                <div class="col-start-2 row-start-17 border-r border-gray-100 dark:border-gray-200/5"></div>
                                <div class="col-start-3 row-start-17 border-r border-gray-100 dark:border-gray-200/5"></div>
                                <div class="col-start-4 row-start-17 border-r border-gray-100 dark:border-gray-200/5"></div>
                                <div class="col-start-5 row-start-17 border-r border-gray-100 dark:border-gray-200/5"></div>
                                <div class="col-start-6 row-start-17 border-r border-gray-100 dark:border-gray-200/5"></div>
                                <div class="col-start-7 row-start-17 border-r border-gray-100 dark:border-gray-200/5"></div>
                                <div class="col-start-8 row-start-17"></div>
                                <div class="col-start-3 row-span-4 row-start-2 m-1 flex flex-col rounded-lg border border-blue-700/10 bg-blue-400/20 p-1 dark:border-sky-500 dark:bg-sky-600/50">
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
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="relative mt-16 not-prose overflow-hidden rounded-lg bg-white outline outline-white/5 dark:bg-gray-950/50 w-full h-auto">
            <div class="overflow-hidden dark:bg-gray-800">
                {/* Changed grid template: first column 80px, rest 16px each */}
                <div class={`grid h-full grid-cols-[80px,repeat(${Hours.length},16px)] grid-rows-[repeat(16,50px)] overflow-scroll`}>
                    {/* Empty cell at column 1, row 1 */}
                    <div className="sticky top-0 z-10 col-start-1 row-start-1 border-b border-r border-gray-800 bg-white bg-clip-padding py-2 dark:border-black/10 dark:bg-gradient-to-b dark:from-gray-600 dark:to-gray-700"></div>
                    
                    {/* Hour headers - start from column 2 */}
                    {Hours.map((hour, index) => (
                        <div 
                            key={index} 
                            class="sticky top-0 z-10 border-b border-gray-800 bg-white bg-clip-padding py-2 text-center text-sm font-medium text-gray-900 dark:border-black/10 dark:bg-gradient-to-b dark:from-gray-600 dark:to-gray-700 dark:text-gray-200"
                            style={{ gridColumn: hourColumns[index], gridRow: 1 }}
                        >
                            <div class="w-16">{hour}</div>
                        </div>
                    ))}
                    
                    {/* Day headers - now with more space (80px width) */}
                    {Days.map((day, h_index) => (
                        <div 
                            key={h_index} 
                            class="sticky left-0 border-r border-gray-100 bg-white p-1.5 text-right text-xs font-medium text-gray-400 uppercase dark:border-gray-200/5 dark:bg-gray-800"
                            style={{ gridColumn: 1, gridRow: dayRows[h_index], width: '80px' }}
                        >
                            {day}
                        </div>
                    ))}
                    
                    {/* Grid cells - start from column 2, row 2 */}
                    {gridCells.map((cell, index) => (
                        <div 
                            key={index} 
                            class="border-r border-b border-gray-200 dark:border-gray-200/5"
                            style={{ gridColumn: cell.col, gridRow: cell.row }}
                        ></div>
                    ))}
                </div>
            </div>
            <div>
                {/* // */}
            </div>
        </div>
        </div>
    );
}
