"use client";

import { useCallback, useRef } from "react";
import { useGameStore } from "@/store/gameStore";

// Singleton AudioContext to avoid per-component creation
let _ctx: AudioContext | null = null;
function getCtx(): AudioContext {
    if (!_ctx || _ctx.state === "closed") {
        _ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return _ctx;
}

type SoundName = "diceRoll" | "diceHit" | "diceLock" | "scoreSelect" | "win" | "chipClink";

interface PlayOptions {
    pitch?: number;
    volume?: number;
}

/**
 * Plays a synthesized sound using the Web Audio API.
 * This is instant and does NOT depend on CDN loading or browser autoplay policies
 * for repeated sounds after the first user gesture.
 */
function playWebAudioSound(name: SoundName, options: PlayOptions = {}, isMuted: boolean) {
    if (isMuted) return;
    try {
        const ctx = getCtx();
        if (ctx.state === "suspended") {
            ctx.resume();
        }

        const vol = options.volume ?? 0.25;
        const pitch = options.pitch ?? 1.0;

        const gain = ctx.createGain();
        gain.connect(ctx.destination);

        switch (name) {
            case "diceHit": {
                // Short percussive noise - wood/felt tap
                const bufferSize = ctx.sampleRate * 0.08;
                const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
                const data = buffer.getChannelData(0);
                for (let i = 0; i < bufferSize; i++) {
                    data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3));
                }
                const src = ctx.createBufferSource();
                src.buffer = buffer;
                src.playbackRate.value = pitch;

                // Bandpass filter for a wooden thud
                const filter = ctx.createBiquadFilter();
                filter.type = "bandpass";
                filter.frequency.value = 600 * pitch;
                filter.Q.value = 0.8;

                src.connect(filter);
                filter.connect(gain);
                gain.gain.setValueAtTime(vol * 0.6, ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.07);
                src.start(ctx.currentTime);
                src.stop(ctx.currentTime + 0.1);
                break;
            }

            case "diceRoll": {
                // A meatier rattle: low thud + quick noise bursts
                // Low thud
                const thudOsc = ctx.createOscillator();
                const thudGain = ctx.createGain();
                thudOsc.type = "sine";
                thudOsc.frequency.setValueAtTime(180, ctx.currentTime);
                thudOsc.frequency.exponentialRampToValueAtTime(60, ctx.currentTime + 0.12);
                thudGain.gain.setValueAtTime(vol * 0.5, ctx.currentTime);
                thudGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
                thudOsc.connect(thudGain);
                thudGain.connect(ctx.destination);
                thudOsc.start(ctx.currentTime);
                thudOsc.stop(ctx.currentTime + 0.18);

                // Rattling noise bursts
                for (let j = 0; j < 4; j++) {
                    const delay = j * 0.05;
                    const bufSize = ctx.sampleRate * 0.06;
                    const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
                    const d = buf.getChannelData(0);
                    for (let i = 0; i < bufSize; i++) {
                        d[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufSize * 0.35));
                    }
                    const s = ctx.createBufferSource();
                    s.buffer = buf;
                    const filter = ctx.createBiquadFilter();
                    filter.type = "bandpass";
                    filter.frequency.value = 800 + j * 200;
                    filter.Q.value = 1.2;
                    const g = ctx.createGain();
                    g.gain.setValueAtTime(vol * (0.4 - j * 0.06), ctx.currentTime + delay);
                    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + 0.07);
                    s.connect(filter);
                    filter.connect(g);
                    g.connect(ctx.destination);
                    s.start(ctx.currentTime + delay);
                    s.stop(ctx.currentTime + delay + 0.09);
                }
                break;
            }

            case "diceLock": {
                // A crisp high "click" — two-tone for character
                const osc1 = ctx.createOscillator();
                const osc2 = ctx.createOscillator();
                osc1.frequency.setValueAtTime(1200, ctx.currentTime);
                osc1.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.04);
                osc2.frequency.setValueAtTime(1800, ctx.currentTime);
                osc2.frequency.exponentialRampToValueAtTime(900, ctx.currentTime + 0.04);
                osc1.type = "square";
                osc2.type = "triangle";
                gain.gain.setValueAtTime(vol * 0.15, ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06);
                osc1.connect(gain);
                osc2.connect(gain);
                osc1.start(ctx.currentTime);
                osc2.start(ctx.currentTime);
                osc1.stop(ctx.currentTime + 0.07);
                osc2.stop(ctx.currentTime + 0.07);
                break;
            }

            case "scoreSelect": {
                // Satisfying ascending major arpeggio — classic "win" feel
                // C5 - E5 - G5 (major chord)
                const freqs = [523.25, 659.25, 783.99];
                freqs.forEach((freq, i) => {
                    const delay = i * 0.07;
                    const osc = ctx.createOscillator();
                    const osc2 = ctx.createOscillator();
                    const g = ctx.createGain();

                    osc.type = "triangle";
                    osc2.type = "sine";
                    osc.frequency.setValueAtTime(freq, ctx.currentTime + delay);
                    osc2.frequency.setValueAtTime(freq * 2, ctx.currentTime + delay); // octave harmony

                    g.gain.setValueAtTime(0, ctx.currentTime + delay);
                    g.gain.linearRampToValueAtTime(vol * 0.35, ctx.currentTime + delay + 0.01);
                    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + 0.22);

                    osc.connect(g);
                    osc2.connect(g);
                    g.connect(ctx.destination);

                    osc.start(ctx.currentTime + delay);
                    osc2.start(ctx.currentTime + delay);
                    osc.stop(ctx.currentTime + delay + 0.25);
                    osc2.stop(ctx.currentTime + delay + 0.25);
                });
                break;
            }

            case "win": {
                // Three ascending tones
                [880, 1100, 1320].forEach((freq, i) => {
                    const delay = i * 0.15;
                    const o = ctx.createOscillator();
                    const g = ctx.createGain();
                    o.type = "sine";
                    o.frequency.setValueAtTime(freq, ctx.currentTime + delay);
                    g.gain.setValueAtTime(vol * 0.4, ctx.currentTime + delay);
                    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + 0.25);
                    o.connect(g);
                    g.connect(ctx.destination);
                    o.start(ctx.currentTime + delay);
                    o.stop(ctx.currentTime + delay + 0.3);
                });
                break;
            }

            case "chipClink": {
                // High-pitched ceramic click
                const bufferSize = ctx.sampleRate * 0.05;
                const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
                const data = buffer.getChannelData(0);
                for (let i = 0; i < bufferSize; i++) {
                    data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.15));
                }
                const src = ctx.createBufferSource();
                src.buffer = buffer;
                const filter = ctx.createBiquadFilter();
                filter.type = "highpass";
                filter.frequency.value = 4000;
                src.connect(filter);
                filter.connect(gain);
                gain.gain.setValueAtTime(vol * 0.4, ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);
                src.start(ctx.currentTime);
                break;
            }
        }
    } catch (e) {
        // Silently ignore - browser might not support Web Audio
        console.warn("[useSound] Web Audio error:", e);
    }
}

export function useSound() {
    const isMuted = useGameStore((s) => s.isMuted);
    const isMutedRef = useRef(isMuted);
    isMutedRef.current = isMuted;

    const playSound = useCallback((soundName: SoundName, options?: PlayOptions) => {
        playWebAudioSound(soundName, options ?? {}, isMutedRef.current);
    }, []);

    const stopSound = useCallback((_soundName: SoundName) => {
        // Web Audio sounds are fire-and-forget, nothing to stop
    }, []);

    return { playSound, stopSound };
}
