"use client";
import { useEffect, useState, useCallback } from "react";

export default function useTimetable(userId) {
    const [slots, setSlots] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [tick, setTick] = useState(0);

    const reload = useCallback(() => setTick((t) => t + 1), []);

    useEffect(() => {
        if (!userId) return;
        let mounted = true;
        const controller = new AbortController();
        setLoading(true);
        setError(null);

        (async () => {
            try {
                const res = await fetch(`http://localhost:3001/api/v1/users/${userId}/timetable`, {
                    credentials: "include",
                    signal: controller.signal,
                });
                if (!res.ok) {
                    const text = await res.text();
                    throw new Error(text || res.statusText);
                }
                const data = await res.json();
                if (mounted && Array.isArray(data.slots)) {
                    setSlots(data.slots);
                }
            } catch (err) {
                if (err.name !== "AbortError") {
                    setError(err);
                    console.error("useTimetable fetch error", err);
                }
            } finally {
                if (mounted) setLoading(false);
            }
        })();

        return () => {
            mounted = false;
            controller.abort();
        };
    }, [userId, tick]);

    return { slots, loading, error, reload };
}