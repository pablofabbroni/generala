"use client";

import { useCallback, useRef } from "react";
import { useGameStore } from "@/store/gameStore";

import { Howl } from "howler";

type SoundName = "diceRoll" | "diceHit" | "diceLock" | "scoreSelect" | "win" | "chipClink";

interface PlayOptions {
    pitch?: number;
    volume?: number;
}

// Sound mapping for Howler
const sounds: Record<string, Howl> = {
    // Shorter, sharper rattle
    diceRoll: new Howl({ src: ["https://assets.mixkit.co/active_storage/sfx/2011/2011-preview.mp3"], volume: 0.4 }),
    // Subtle wooden impact
    diceHit: new Howl({ src: ["https://assets.mixkit.co/active_storage/sfx/2011/2011-preview.mp3"], volume: 0.15, rate: 2.0 }),
    diceLock: new Howl({ src: ["https://assets.mixkit.co/active_storage/sfx/2004/2004-preview.mp3"], volume: 0.3 }),
    scoreSelect: new Howl({ src: ["https://assets.mixkit.co/active_storage/sfx/2017/2017-preview.mp3"], volume: 0.4 }),
    win: new Howl({ src: ["https://assets.mixkit.co/active_storage/sfx/2018/2018-preview.mp3"], volume: 0.6 }),
    chipClink: new Howl({ src: ["https://assets.mixkit.co/active_storage/sfx/1084/1084-preview.mp3"], volume: 0.4 }),
};

export function useSound() {
    const isMuted = useGameStore((s) => s.isMuted);

    const playSound = useCallback((name: SoundName, options: PlayOptions = {}) => {
        if (isMuted) return;
        const sound = sounds[name];
        if (sound) {
            if (options.volume !== undefined) sound.volume(options.volume);
            if (options.pitch !== undefined) sound.rate(options.pitch);
            sound.play();
        }
    }, [isMuted]);

    const stopSound = useCallback((name: SoundName) => {
        const sound = sounds[name];
        if (sound) sound.stop();
    }, []);

    return { playSound, stopSound };
}
