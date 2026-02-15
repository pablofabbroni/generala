"use client";

import { useEffect, useRef } from "react";
import { Howl } from "howler";

import { useGameStore } from "@/store/gameStore";

const SOUNDS = {
    // Shorter, sharper dice sound
    diceRoll: "https://assets.mixkit.co/active_storage/sfx/2042/2042-preview.mp3",
    diceLock: "https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3",
    scoreSelect: "https://assets.mixkit.co/active_storage/sfx/2019/2019-preview.mp3",
    win: "https://assets.mixkit.co/active_storage/sfx/2018/2018-preview.mp3",
};

export function useSound() {
    const isMuted = useGameStore((s) => s.isMuted);
    const soundsRef = useRef<Record<string, Howl>>({});

    useEffect(() => {
        // Initialize sounds
        Object.entries(SOUNDS).forEach(([key, url]) => {
            soundsRef.current[key] = new Howl({
                src: [url],
                volume: 0.5,
            });
        });

        return () => {
            // Clean up
            Object.values(soundsRef.current).forEach((sound) => sound.unload());
        };
    }, []);

    const playSound = (soundName: keyof typeof SOUNDS) => {
        if (isMuted) return;

        const sound = soundsRef.current[soundName];
        if (sound) {
            sound.play();
        }
    };

    return { playSound };
}
