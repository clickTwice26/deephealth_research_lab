import React, { useRef, useEffect, useState, useMemo } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import './Shuffle.css';

gsap.registerPlugin(ScrollTrigger, useGSAP);

// Custom lightweight SplitText alternative since the official one is a paid plugin
class CustomSplitText {
    chars: Element[] = [];
    element: HTMLElement;

    constructor(element: HTMLElement, options: any) {
        this.element = element;
        this.split(element);
    }

    split(element: HTMLElement) {
        this.chars = [];
        const text = element.textContent || '';
        element.innerHTML = '';

        // Simple character split. For more complex wrapping, we'd need more logic,
        // but this suffices for most hero headers.
        const chars = text.split('');
        chars.forEach((char) => {
            const span = document.createElement('div'); // div or span
            span.textContent = char;
            span.style.display = 'inline-block';
            span.className = 'shuffle-char';
            if (char === ' ') {
                span.style.width = '0.3em'; // Preserve space width
            }
            element.appendChild(span);
            this.chars.push(span);
        });
    }

    revert() {
        if (this.element && this.chars.length) {
            this.element.textContent = this.chars.map(c => c.textContent).join('');
            this.chars = [];
        }
    }
}

interface ShuffleProps {
    text: string;
    className?: string;
    style?: React.CSSProperties;
    shuffleDirection?: 'left' | 'right';
    duration?: number;
    maxDelay?: number;
    ease?: string;
    threshold?: number;
    rootMargin?: string;
    tag?: keyof React.JSX.IntrinsicElements;
    textAlign?: 'left' | 'center' | 'right';
    onShuffleComplete?: () => void;
    shuffleTimes?: number;
    animationMode?: 'evenodd' | 'random';
    loop?: boolean;
    loopDelay?: number;
    stagger?: number;
    scrambleCharset?: string;
    colorFrom?: string;
    colorTo?: string;
    triggerOnce?: boolean;
    respectReducedMotion?: boolean;
    triggerOnHover?: boolean;
}

const Shuffle: React.FC<ShuffleProps> = ({
    text,
    className = '',
    style = {},
    shuffleDirection = 'right',
    duration = 0.35,
    maxDelay = 0,
    ease = 'power3.out',
    threshold = 0.1,
    rootMargin = '-100px',
    tag = 'p',
    textAlign = 'center',
    onShuffleComplete,
    shuffleTimes = 1,
    animationMode = 'evenodd',
    loop = false,
    loopDelay = 0,
    stagger = 0.03,
    scrambleCharset = '',
    colorFrom,
    colorTo,
    triggerOnce = true,
    respectReducedMotion = true,
    triggerOnHover = true
}) => {
    const ref = useRef<any>(null);
    const [fontsLoaded, setFontsLoaded] = useState(false);
    const [ready, setReady] = useState(false);

    // Use 'any' for the split instance/refs to avoid strict type issues with our custom class
    const splitRef = useRef<any>(null);
    const wrappersRef = useRef<HTMLElement[]>([]);
    const tlRef = useRef<gsap.core.Timeline | null>(null);
    const playingRef = useRef(false);
    const hoverHandlerRef = useRef<any>(null);

    // Removed complex font loading check that was blocking render
    // useEffect(() => { ... }, []);

    const scrollTriggerStart = useMemo(() => {
        const startPct = (1 - threshold) * 100;
        const mm = /^(-?\d+(?:\.\d+)?)(px|em|rem|%)?$/.exec(rootMargin || '');
        const mv = mm ? parseFloat(mm[1]) : 0;
        const mu = mm ? mm[2] || 'px' : 'px';
        const sign = mv === 0 ? '' : mv < 0 ? `-=${Math.abs(mv)}${mu}` : `+=${mv}${mu}`;
        return `top ${startPct}%${sign}`;
    }, [threshold, rootMargin]);

    useGSAP(
        () => {
            if (!ref.current || !text) return; // Removed !fontsLoaded check
            if (respectReducedMotion && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
                setReady(true);
                onShuffleComplete?.();
                return;
            }

            const el = ref.current;

            const start = scrollTriggerStart;

            const removeHover = () => {
                if (hoverHandlerRef.current && ref.current) {
                    ref.current.removeEventListener('mouseenter', hoverHandlerRef.current);
                    hoverHandlerRef.current = null;
                }
            };

            const teardown = () => {
                if (tlRef.current) {
                    tlRef.current.kill();
                    tlRef.current = null;
                }
                if (wrappersRef.current.length) {
                    wrappersRef.current.forEach(wrap => {
                        // Logic to unwrap is complex without keeping refs to everything. 
                        // Simplest teardown for React is to rely on re-render to reset DOM, 
                        // but here we are manipulating DOM directly.
                        // We can use the splitRef revert.
                    });
                    wrappersRef.current = [];
                }
                try {
                    splitRef.current?.revert();
                } catch {
                    /* noop */
                }
                splitRef.current = null;
                playingRef.current = false;
            };

            const build = () => {
                teardown(); // Ensure clean slate

                // Use our CustomSplitText instead of the paid GSAP one
                splitRef.current = new CustomSplitText(el, {
                    type: 'chars',
                    charsClass: 'shuffle-char',
                    wordsClass: 'shuffle-word',
                    linesClass: 'shuffle-line',
                    smartWrap: true,
                    reduceWhiteSpace: false
                });

                const chars = splitRef.current.chars || [];
                wrappersRef.current = [];

                const rolls = Math.max(1, Math.floor(shuffleTimes));
                const rand = (set: string) => set.charAt(Math.floor(Math.random() * set.length)) || '';

                chars.forEach((ch: Element) => {
                    // In our custom split, 'ch' is the span element itself.
                    // Note: The original code logic assumes 'ch' is part of the DOM.
                    const parent = ch.parentElement;
                    if (!parent) return;

                    const w = ch.getBoundingClientRect().width;
                    // if (!w) return; // Spaces might have 0 width if empty, but we set width for space.

                    const wrap = document.createElement('span');
                    Object.assign(wrap.style, {
                        display: 'inline-block',
                        overflow: 'hidden',
                        width: w + 'px',
                        verticalAlign: 'baseline',
                        height: '1em', // Fix for height collapsing
                        position: 'relative' // Fix for layout
                    });

                    const inner = document.createElement('span');
                    Object.assign(inner.style, {
                        display: 'inline-block',
                        whiteSpace: 'nowrap',
                        willChange: 'transform'
                    });

                    parent.insertBefore(wrap, ch);
                    wrap.appendChild(inner);

                    const firstOrig = ch.cloneNode(true) as HTMLElement;
                    Object.assign(firstOrig.style, { display: 'inline-block', width: w + 'px', textAlign: 'center' });

                    ch.setAttribute('data-orig', '1');
                    // Hide original char but keep it if needed? The logic removes it from parent and puts it in inner.
                    // Actually logic above: parent.insertBefore(wrap, ch).
                    // user code: wrap.appendChild(inner). inner.appendChild(ch).
                    // So 'ch' is moved inside.

                    Object.assign((ch as HTMLElement).style, { display: 'inline-block', width: w + 'px', textAlign: 'center' });

                    // Logic from user code:
                    // inner.appendChild(firstOrig);
                    // loop rolls...
                    // inner.appendChild(ch);

                    // Re-implementing exactly:
                    inner.appendChild(firstOrig);
                    for (let k = 0; k < rolls; k++) {
                        const c = ch.cloneNode(true) as HTMLElement;
                        if (scrambleCharset) c.textContent = rand(scrambleCharset);
                        Object.assign(c.style, { display: 'inline-block', width: w + 'px', textAlign: 'center' });
                        inner.appendChild(c);
                    }
                    // The original 'ch' is effectively our 'final' state?
                    // Actually user code: "inner.appendChild(ch)". 'ch' is the original exact node.
                    // It was removed from parent when we did `inner.appendChild(ch)`.
                    inner.appendChild(ch);

                    const steps = rolls + 1;
                    let startX = 0;
                    let finalX = -steps * w;

                    if (shuffleDirection === 'right') {
                        // Re-order for 'right' direction
                        const firstCopy = inner.firstElementChild; // This is 'firstOrig'
                        const real = inner.lastElementChild; // This is 'ch'

                        // Move real to front
                        if (real) inner.insertBefore(real, inner.firstChild);
                        // Move firstCopy to end
                        if (firstCopy) inner.appendChild(firstCopy);

                        startX = -steps * w;
                        finalX = 0;
                    }

                    gsap.set(inner, { x: startX, force3D: true });
                    if (colorFrom) inner.style.color = colorFrom;

                    inner.setAttribute('data-final-x', String(finalX));
                    inner.setAttribute('data-start-x', String(startX));

                    wrappersRef.current.push(wrap);
                });
            };

            const inners = () => wrappersRef.current.map(w => w.firstElementChild as HTMLElement);

            const randomizeScrambles = () => {
                if (!scrambleCharset) return;
                wrappersRef.current.forEach(w => {
                    const strip = w.firstElementChild;
                    if (!strip) return;
                    const kids = Array.from(strip.children);
                    // Skip first and last (start and end states) to randomize only middle "rolls"
                    for (let i = 1; i < kids.length - 1; i++) {
                        kids[i].textContent = scrambleCharset.charAt(Math.floor(Math.random() * scrambleCharset.length));
                    }
                });
            };

            const cleanupToStill = () => {
                wrappersRef.current.forEach(w => {
                    const strip = w.firstElementChild as HTMLElement;
                    if (!strip) return;
                    const real = strip.querySelector('[data-orig="1"]');
                    if (!real) return;
                    // Unwrap: replace 'wrap' with 'real' in the DOM?
                    // User code: strip.replaceChildren(real); strip.style.transform = 'none';
                    // This keeps the wrapper but removes the scrolling strip, leaving just the char.
                    strip.replaceChildren(real);
                    strip.style.transform = 'none';
                    strip.style.willChange = 'auto';
                });
            };

            const play = () => {
                const strips = inners();
                if (!strips.length) return;

                playingRef.current = true;

                const tl = gsap.timeline({
                    smoothChildTiming: true,
                    repeat: loop ? -1 : 0,
                    repeatDelay: loop ? loopDelay : 0,
                    onRepeat: () => {
                        if (scrambleCharset) randomizeScrambles();
                        gsap.set(strips, { x: (i, t) => parseFloat(t.getAttribute('data-start-x') || '0') });
                        onShuffleComplete?.();
                    },
                    onComplete: () => {
                        playingRef.current = false;
                        if (!loop) {
                            cleanupToStill();
                            if (colorTo) gsap.set(strips, { color: colorTo });
                            onShuffleComplete?.();
                            armHover();
                        }
                    }
                });

                const addTween = (targets: any[], at: number) => {
                    tl.to(
                        targets,
                        {
                            x: (i, t) => parseFloat(t.getAttribute('data-final-x') || '0'),
                            duration,
                            ease,
                            force3D: true,
                            stagger: animationMode === 'evenodd' ? stagger : 0
                        },
                        at
                    );
                    if (colorFrom && colorTo) {
                        tl.to(targets, { color: colorTo, duration, ease }, at);
                    }
                };

                if (animationMode === 'evenodd') {
                    const odd = strips.filter((_, i) => i % 2 === 1);
                    const even = strips.filter((_, i) => i % 2 === 0);
                    const oddTotal = duration + Math.max(0, odd.length - 1) * (stagger || 0); // Handle potentially undefined stagger if not careful, though default is set.
                    const evenStart = odd.length ? oddTotal * 0.7 : 0;
                    if (odd.length) addTween(odd, 0);
                    if (even.length) addTween(even, evenStart);
                } else {
                    strips.forEach(strip => {
                        const d = Math.random() * maxDelay;
                        tl.to(
                            strip,
                            {
                                x: parseFloat(strip.getAttribute('data-final-x') || '0'),
                                duration,
                                ease,
                                force3D: true
                            },
                            d
                        );
                        if (colorFrom && colorTo) tl.fromTo(strip, { color: colorFrom }, { color: colorTo, duration, ease }, d);
                    });
                }

                tlRef.current = tl;
            };

            const armHover = () => {
                if (!triggerOnHover || !ref.current) return;
                removeHover();
                const handler = () => {
                    if (playingRef.current) return;
                    build();
                    if (scrambleCharset) randomizeScrambles();
                    play();
                };
                hoverHandlerRef.current = handler;
                ref.current.addEventListener('mouseenter', handler);
            };

            const create = () => {
                build();
                if (scrambleCharset) randomizeScrambles();
                play();
                armHover();
                setReady(true);
            };

            const st = ScrollTrigger.create({
                trigger: el,
                start,
                once: triggerOnce,
                onEnter: create
            });

            return () => {
                st.kill();
                removeHover();
                teardown();
                setReady(false);
            };
        },
        {
            dependencies: [
                text,
                duration,
                maxDelay,
                ease,
                scrollTriggerStart,
                shuffleDirection,
                shuffleTimes,
                animationMode,
                loop,
                loopDelay,
                stagger,
                scrambleCharset,
                colorFrom,
                colorTo,
                triggerOnce,
                respectReducedMotion,
                triggerOnHover,
                onShuffleComplete
            ],
            scope: ref
        }
    );

    const commonStyle = useMemo(() => ({ textAlign, ...style }), [textAlign, style]);
    // @ts-ignore
    const Tag = tag as any;

    return (
        <Tag ref={ref} className={`shuffle-parent ${ready ? 'is-ready' : ''} ${className}`} style={commonStyle}>
            {text}
        </Tag>
    );
};

export default Shuffle;
