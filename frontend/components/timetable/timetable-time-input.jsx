"use client";

import React, { useMemo } from "react";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { MINUTES_PER_COLUMN, pad2 } from "./time-utils";

export default function TimetableTimeInput({
    label = "Time (HH:MM)",
    minutes,
    onChange,
    maxHour = 23,               // 23 for start, 24 for end
    forbidExactMidnight = false // true for end (cannot be 00:00)
}) {
    const raw = Number.isFinite(Number(minutes)) ? Number(minutes) : 0;
    const safeMinutes = Math.min(Math.max(raw, 0), 24 * 60); // 0..1440

    const minHour = 0;
    const effectiveMaxHour = Math.min(Math.max(maxHour, minHour), 24);

    // hour list 0..maxHour (0..23 or 0..24)
    const HOUR_OPTIONS = useMemo(
        () =>
            Array.from({ length: effectiveMaxHour - minHour + 1 }, (_, i) => minHour + i),
        [effectiveMaxHour]
    );

    // base minute options from MINUTES_PER_COLUMN (0, 15, 30, 45)
    const BASE_MINUTE_OPTIONS = useMemo(
        () =>
            Array.from({ length: 60 / MINUTES_PER_COLUMN }, (_, i) => i * MINUTES_PER_COLUMN),
        []
    );

    // derive hour/minute from safeMinutes
    let currentHour = Math.floor(safeMinutes / 60);
    if (currentHour > effectiveMaxHour) currentHour = effectiveMaxHour;
    let currentMinute = safeMinutes % 60;

    // 24:xx → 24:00 only
    if (currentHour === 24) {
        currentMinute = 0;
    }

    // minute options: at 24 only [0]
    const minuteOptions =
        currentHour === 24 ? [0] : BASE_MINUTE_OPTIONS;

    const minuteValue = minuteOptions.includes(currentMinute)
        ? currentMinute
        : minuteOptions[0];

    const applyTime = (h, m) => {
        let hour = h;
        if (hour < minHour) hour = minHour;
        if (hour > effectiveMaxHour) hour = effectiveMaxHour;

        let minute = hour === 24 ? 0 : m;

        // if forbidExactMidnight, do not allow 00:00
        if (forbidExactMidnight && hour === 0 && minute === 0) {
            return; // ignore
        }

        const total = hour * 60 + minute;
        onChange?.(total);
    };

    const handleHourClick = (h) => {
        const newMinute = h === 24 ? 0 : minuteValue;
        applyTime(h, newMinute);
        // Popover stays open (Radix only closes on outside click / trigger toggle)
    };

    const handleMinuteClick = (m) => {
        applyTime(currentHour, m);
        // Popover stays open
    };

    return (
        <div className="">
            <label className="space-y-1">{label}</label>

            <Popover>
                <PopoverTrigger asChild>
                    <button
                        type="button"
                        className="text-[13px] h-[32px] w-full px-3 rounded-[6px] border border-gray-300 bg-white hover:bg-gray-100 flex items-center justify-between shadow-sm"
                    >
                        <span className="font-mono">
                            {pad2(currentHour)}:{pad2(minuteValue)}
                        </span>
                        <span className="text-gray-500 text-[10px]">▼</span>
                    </button>
                </PopoverTrigger>

                <PopoverContent
                    side="bottom"
                    align="center"
                    showArrow={true}
                    sideOffset={4}
                    collisionPadding={8}
                    data-radix-scroll-lock-allow=""
                    className="w-[240px] text-gray-700 pt-1 shadow-[0_0px_15px_-3px] shadow-gray-600 border border-gray-500 rounded-[4px] bg-gray-100 z-[9999]"
                >
                    <div className="flex gap-2 p-2">
                        {/* Hour column */}
                        <div className="flex-1">
                            <p className="text-[11px] text-gray-500 mb-1">Hour</p>
                            <ul
                                className="max-h-[160px] overflow-y-auto"
                                onWheelCapture={(e) => e.stopPropagation()}
                                onTouchMoveCapture={(e) => e.stopPropagation()}
                                data-radix-scroll-lock-allow=""
                            >
                                {HOUR_OPTIONS.map((h) => (
                                    <li key={h}>
                                        <button
                                            type="button"
                                            onClick={() => handleHourClick(h)}
                                            className={`w-full text-left text-[13px] px-2 py-1 rounded-[4px] ${h === currentHour
                                                ? "bg-gray-300 font-semibold"
                                                : "bg-gray-100 hover:bg-gray-200"
                                                }`}
                                        >
                                            {pad2(h)}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Minute column */}
                        <div className="flex-1">
                            <p className="text-[11px] text-gray-500 mb-1">Min</p>
                            <ul
                                className="max-h-[160px] overflow-y-auto"
                                onWheelCapture={(e) => e.stopPropagation()}
                                onTouchMoveCapture={(e) => e.stopPropagation()}
                                data-radix-scroll-lock-allow=""

                            >
                                {minuteOptions.map((m) => (
                                    <li key={m}>
                                        <button
                                            type="button"
                                            onClick={() => handleMinuteClick(m)}
                                            className={`w-full text-left text-[13px] px-2 py-1 rounded-[4px] ${m === minuteValue
                                                ? "bg-gray-300 font-semibold"
                                                : "bg-gray-100 hover:bg-gray-200"
                                                }`}
                                        >
                                            {pad2(m)}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </PopoverContent>
            </Popover>
        </div>
    );
}
