import { useEffect, useRef } from "react";
// keep this if you have the package installed and the file exists:
import "@smwcentral/spc-player/dist/spc_player.css";

type AutoStartMode = "none" | "mount" | "gesture";

interface SpcPlayerProps {
    spcUrl: string;
    autoStart?: AutoStartMode;
    hideUi?: boolean;
    scriptUrl?: string;
}

interface SpcPlayerInstance {
    loadFromLink: (el: HTMLAnchorElement) => void;
}

declare global {
    interface Window {
        SMWCentral?: {
            SPCPlayer?: SpcPlayerInstance;
        };
    }
}

/**
 * Global singleton promise so React StrictMode / re-mounts don't race-load the script.
 */
let scriptPromise: Promise<void> | null = null;

function ensureScript(src: string): Promise<void> {
    if (window.SMWCentral?.SPCPlayer) return Promise.resolve();

    if (!scriptPromise) {
        scriptPromise = new Promise<void>((resolve, reject) => {
            const existing = document.querySelector<HTMLScriptElement>(`script[src="${src}"]`);
            if (existing) return resolve();

            const s = document.createElement("script");
            s.src = src;
            s.async = true;
            s.onload = () => resolve();
            s.onerror = () => reject(new Error(`Failed to load script: ${src}`));
            document.body.appendChild(s);
        });
    }
    return scriptPromise;
}

export default function SpcPlayer({
    spcUrl,
    autoStart = "gesture",
    hideUi = false,
    scriptUrl = "https://unpkg.com/@smwcentral/spc-player@2.0.2/dist/spc.js",
}: SpcPlayerProps) {
    const linkRef = useRef<HTMLAnchorElement | null>(null);

    // prevents double-start from StrictMode/dev or repeated gestures
    const startedRef = useRef(false);

    // used to ignore async completions after unmount / re-render
    const runIdRef = useRef(0);

    useEffect(() => {
        runIdRef.current += 1;
        const runId = runIdRef.current;
        startedRef.current = false;

        let cancelled = false;

        const setShown = () => {
            const iface = document.getElementById("spc-player-interface");
            if (iface) iface.classList.add("shown");
        };

        const start = async () => {
            if (cancelled) return;
            if (runId !== runIdRef.current) return;

            // guard: don't start twice
            if (startedRef.current) return;
            startedRef.current = true;

            await ensureScript(scriptUrl);
            if (cancelled) return;
            if (runId !== runIdRef.current) return;

            setShown();

            const player = window.SMWCentral?.SPCPlayer;
            const linkEl = linkRef.current;
            if (!player || !linkEl) return;

            player.loadFromLink(linkEl);
        };

        // Important: attach gesture listeners immediately so we don't miss first click
        const onGesture = () => {
            // gesture fires -> attempt to start (script will be awaited)
            void start();
        };

        if (autoStart === "gesture") {
            window.addEventListener("pointerdown", onGesture, { once: true });
            window.addEventListener("keydown", onGesture, { once: true });
        }

        // For mount mode, try immediately (may be blocked by autoplay policy)
        if (autoStart === "mount") {
            void start();
        }

        return () => {
            cancelled = true;
            window.removeEventListener("pointerdown", onGesture);
            window.removeEventListener("keydown", onGesture);
        };
    }, [scriptUrl, autoStart, spcUrl]); // <-- spcUrl included on purpose

    return (
        <div>
            {/* The library loads the SPC from an <a> href */}
            <a ref={linkRef} href={spcUrl} style={{ display: "none" }}>
                spc
            </a>

            {/* ==== BEGIN your inlined spc_player.html (unchanged) ==== */}
            <div id="spc-player-container" style={hideUi ? { display: "none" } : undefined}>
                <input type="checkbox" id="spc-player-toggle" />
                <input type="checkbox" id="spc-player-loop" defaultChecked />
                <div id="spc-player-interface" className="spc-player">
                    <div id="spc-player-header" className="header">
                        <div className="group-left">
                            <label
                                htmlFor="spc-player-toggle"
                                className="toggle header-button"
                                title="Toggle player"
                            >
                                <svg width="24" height="24" viewBox="0 0 24 24" className="shrink">
                                    <path d="m 9,5 3,3 3,-3 z m -4,6 v 2 h 14 v -2 z m 7,5 -3,3 h 6 z" />
                                </svg>
                                <svg width="24" height="24" viewBox="0 0 24 24" className="expand">
                                    <path d="m 9,7 3,-3 3,3 z m -4,4 v 2 h 14 v -2 z m 7,9 -2.798151,-3 H 15 Z" />
                                </svg>
                            </label>
                            <span>SPC Player</span>
                        </div>
                        <div className="now-playing">
                            <span className="title"></span>
                        </div>
                        <div className="group-right">
                            <a className="stop close header-button" title="Close">
                                <svg width="24" height="24" viewBox="0 0 24 24">
                                    <path d="M 7.3847656,5.6152344 5.6152344,7.3847656 10.230469,12 5.6152344,16.615234 7.3847656,18.384766 12,13.769531 16.615234,18.384766 18.384766,16.615234 13.769531,12 18.384766,7.3847656 16.615234,5.6152344 12,10.230469 Z" />
                                </svg>
                            </a>
                        </div>
                    </div>
                    <div id="spc-player-content" className="player-content">
                        <div className="track-info">
                            <h2 className="title">Song Title</h2>
                            <h3 className="subtitle"></h3>
                            <div className="details"></div>
                        </div>
                        <div className="seek-container">
                            <span className="track-time-elapsed"></span>
                            <div className="seek">
                                <span className="seek-preview"></span>
                            </div>
                            <span className="track-duration"></span>
                        </div>
                        <div id="spc-player-controls" className="controls">
                            <div className="group-left">
                                <a className="play hidden" title="Resume song">
                                    <svg width="24" height="24" viewBox="0 0 24 24">
                                        <path d="M7 5v14l12-7Z" />
                                    </svg>
                                </a>
                                <a className="pause" title="Pause song">
                                    <svg width="24" height="24" viewBox="0 0 24 24">
                                        <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                                    </svg>
                                </a>
                                <a id="spc-player-skip" className="hidden" title="Skip song">
                                    <svg height="24" viewBox="0 0 24 24" width="24">
                                        <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
                                    </svg>
                                </a>
                                <a className="restart" title="Restart song">
                                    <svg width="24" height="24" viewBox="0 0 24 24">
                                        <path d="M 12,5 V 1 l -5,5 5,5 V 7 c 3.31,0 6,2.69 6,6 0,3.31 -2.69,6 -6,6 C 8.69,19 6,16.31 6,13 H 4 c 0,4.42 3.58,8 8,8 4.42,0 8,-3.58 8,-8 0,-4.42 -3.58,-8 -8,-8 z" />
                                    </svg>
                                </a>
                                <label htmlFor="spc-player-loop" className="loop" title="Toggle looping">
                                    <svg width="24" height="24" viewBox="0 0 24 24">
                                        <path d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8l1.46 1.46C19.54 15.03 20 13.57 20 12c0-4.42-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6 0-1.01.25-1.97.7-2.8L5.24 7.74C4.46 8.97 4 10.43 4 12c0 4.42 3.58 8 8 8v3l4-4-4-4v3z" />
                                    </svg>
                                </label>
                            </div>
                            <div id="spc-player-volume" className="volume">
                                <span className="volume-level">100%</span>
                                <svg width="24" height="24" viewBox="0 0 24 24">
                                    <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
                                </svg>
                                <div className="volume-control">
                                    <input type="range" id="volume-slider" title="Volume" />
                                    <div className="volume-track">
                                        <div className="volume-fill"></div>
                                        <div className="volume-thumb"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div id="track-list-container" className="hidden">
                            <div className="overflow-indicator top"></div>
                            <div className="track-list-scrollbox">
                                <ul className="track-list"></ul>
                            </div>
                            <div className="overflow-indicator bottom"></div>
                        </div>
                        <div id="spc-player-up-next" className="up-next hidden">
                            <span>Up Next: </span>
                            <a
                                id="spc-player-up-next-link"
                                title="Opens in a new tab"
                                target="_blank"
                            ></a>
                        </div>
                    </div>
                </div>
            </div>
            {/* ==== END your inlined spc_player.html ==== */}
        </div>
    );
}
