"use client";

import { useEffect, useRef, useState, useCallback } from "react";

const COMPLETED_PROJECTS = [
  {
    id: 1,
    title: "Residence",
    location: "Chottanikkara, Ernakulam",
    image: "/project01-webp/Twilight Modern Villa with Warm Glow.webp",
  },
];

const TOTAL_PROJECTS = COMPLETED_PROJECTS.length;
// Triplicate array for seamless infinite looping on mobile in both directions
const EXTENDED_PROJECTS = [
  ...COMPLETED_PROJECTS,
  ...COMPLETED_PROJECTS,
  ...COMPLETED_PROJECTS,
];

export default function CompletedProjects() {
  const sectionRef = useRef(null);

  // Desktop infinite horizontal carousel state
  const [desktopIndex, setDesktopIndex] = useState(TOTAL_PROJECTS);
  const [isDesktopTransitioning, setIsDesktopTransitioning] = useState(false);
  const [desktopContainerWidth, setDesktopContainerWidth] = useState(700);
  const [desktopDragOffset, setDesktopDragOffset] = useState(0);
  const [isDesktopDragging, setIsDesktopDragging] = useState(false);

  const desktopContainerRef = useRef(null);
  const isDesktopInteractingRef = useRef(false);
  const isDesktopHoveredRef = useRef(false);
  const desktopResumeTimerRef = useRef(null);
  const desktopMouseStartXRef = useRef(0);
  const desktopMouseStartTimeRef = useRef(0);

  // Mobile infinite horizontal carousel state
  const [mobileIndex, setMobileIndex] = useState(TOTAL_PROJECTS);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [viewportWidth, setViewportWidth] = useState(375);
  const [dragOffset, setDragOffset] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  const isInteractingRef = useRef(false);
  const resumeTimerRef = useRef(null);
  const isSectionInViewRef = useRef(false);

  const touchStartXRef = useRef(0);
  const touchStartYRef = useRef(0);
  const touchStartTimeRef = useRef(0);
  const isHorizontalSwipeRef = useRef(null);

  // Track viewport width and mobile breakpoint (< 640px)
  useEffect(() => {
    const updateWidth = () => {
      if (typeof window !== "undefined") {
        setViewportWidth(window.innerWidth);
        setIsMobile(window.innerWidth < 640);
      }
    };
    updateWidth();
    window.addEventListener("resize", updateWidth, { passive: true });
    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  // Section visibility observer (pauses auto-play when out of view)
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        isSectionInViewRef.current = entry.isIntersecting;
      },
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" },
    );

    const el = sectionRef.current;
    if (el) observer.observe(el);

    return () => {
      if (el) observer.unobserve(el);
    };
  }, []);

  // -------------------------------------------------------------
  // DESKTOP & TABLET INFINITE HORIZONTAL CAROUSEL LOGIC
  // -------------------------------------------------------------
  const pauseDesktopAutoPlay = useCallback(() => {
    isDesktopInteractingRef.current = true;
    if (desktopResumeTimerRef.current) {
      clearTimeout(desktopResumeTimerRef.current);
    }
    desktopResumeTimerRef.current = setTimeout(() => {
      isDesktopInteractingRef.current = false;
    }, 2800);
  }, []);

  const nextDesktopSlide = useCallback(() => {
    setIsDesktopTransitioning(true);
    setDesktopIndex((prev) => prev + 1);
    pauseDesktopAutoPlay();
  }, [pauseDesktopAutoPlay]);

  const prevDesktopSlide = useCallback(() => {
    setIsDesktopTransitioning(true);
    setDesktopIndex((prev) => prev - 1);
    pauseDesktopAutoPlay();
  }, [pauseDesktopAutoPlay]);

  // When transition ends at boundaries on desktop, seamlessly snap without animation
  const handleDesktopTransitionEnd = useCallback(() => {
    setDesktopIndex((current) => {
      if (current >= TOTAL_PROJECTS * 2) {
        setIsDesktopTransitioning(false);
        return current - TOTAL_PROJECTS;
      } else if (current < TOTAL_PROJECTS) {
        setIsDesktopTransitioning(false);
        return current + TOTAL_PROJECTS;
      }
      return current;
    });
  }, []);

  // Re-enable smooth transition on the frame after an instant teleport
  useEffect(() => {
    if (!isDesktopTransitioning) {
      const rafId = requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsDesktopTransitioning(true);
        });
      });
      return () => cancelAnimationFrame(rafId);
    }
  }, [isDesktopTransitioning]);

  // Track desktop container width
  useEffect(() => {
    const el = desktopContainerRef.current;
    if (!el) return;

    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.contentRect.width > 0) {
          setDesktopContainerWidth(entry.contentRect.width);
        }
      }
    });

    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Desktop mouse drag handlers
  const handleDesktopMouseDown = (e) => {
    if (e.button !== 0) return;
    setIsDesktopDragging(true);
    isDesktopInteractingRef.current = true;
    if (desktopResumeTimerRef.current) {
      clearTimeout(desktopResumeTimerRef.current);
    }
    desktopMouseStartXRef.current = e.clientX;
    desktopMouseStartTimeRef.current = Date.now();
    setIsDesktopTransitioning(false);
  };

  const handleDesktopMouseMove = (e) => {
    if (!isDesktopDragging) return;
    const diffX = e.clientX - desktopMouseStartXRef.current;
    setDesktopDragOffset(diffX);
  };

  const handleDesktopMouseUp = () => {
    if (!isDesktopDragging) return;
    setIsDesktopDragging(false);
    const diffX = desktopDragOffset;
    const duration = Date.now() - desktopMouseStartTimeRef.current;
    const isQuickFlick = duration < 300 && Math.abs(diffX) > 25;
    const isSignificantDrag = Math.abs(diffX) > 50;

    setIsDesktopTransitioning(true);
    setDesktopDragOffset(0);

    if (diffX < 0 && (isSignificantDrag || isQuickFlick)) {
      setDesktopIndex((prev) => prev + 1);
    } else if (diffX > 0 && (isSignificantDrag || isQuickFlick)) {
      setDesktopIndex((prev) => prev - 1);
    }

    pauseDesktopAutoPlay();
  };

  const handleDesktopMouseEnter = () => {
    isDesktopHoveredRef.current = true;
  };

  const handleDesktopMouseLeave = () => {
    isDesktopHoveredRef.current = false;
    if (isDesktopDragging) {
      handleDesktopMouseUp();
    }
  };

  // Desktop Auto-Play loop (2.8 seconds per slide with smooth continuous loop)
  useEffect(() => {
    if (viewportWidth < 640) return;

    const interval = setInterval(() => {
      if (
        !isDesktopInteractingRef.current &&
        !isDesktopHoveredRef.current &&
        isSectionInViewRef.current &&
        typeof document !== "undefined" &&
        document.visibilityState === "visible"
      ) {
        nextDesktopSlide();
      }
    }, 2800);

    return () => clearInterval(interval);
  }, [nextDesktopSlide, viewportWidth]);

  // -------------------------------------------------------------
  // MOBILE INFINITE HORIZONTAL CAROUSEL LOGIC
  // -------------------------------------------------------------
  const nextMobileSlide = useCallback(() => {
    setIsTransitioning(true);
    setMobileIndex((prev) => prev + 1);
  }, []);

  const prevMobileSlide = useCallback(() => {
    setIsTransitioning(true);
    setMobileIndex((prev) => prev - 1);
  }, []);

  // When transition ends at boundaries, seamlessly snap without animation
  const handleTransitionEnd = useCallback(() => {
    setMobileIndex((current) => {
      if (current >= TOTAL_PROJECTS * 2) {
        setIsTransitioning(false);
        return current - TOTAL_PROJECTS;
      } else if (current < TOTAL_PROJECTS) {
        setIsTransitioning(false);
        return current + TOTAL_PROJECTS;
      }
      return current;
    });
  }, []);

  // Re-enable smooth transition on the frame after an instant teleport
  useEffect(() => {
    if (!isTransitioning) {
      const rafId = requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsTransitioning(true);
        });
      });
      return () => cancelAnimationFrame(rafId);
    }
  }, [isTransitioning]);

  // Mobile Auto-Play loop (2.8 seconds per slide)
  useEffect(() => {
    if (viewportWidth >= 640) return;

    const interval = setInterval(() => {
      if (
        !isInteractingRef.current &&
        isSectionInViewRef.current &&
        document.visibilityState === "visible"
      ) {
        nextMobileSlide();
      }
    }, 2800);

    return () => clearInterval(interval);
  }, [nextMobileSlide, viewportWidth]);

  // Touch gesture handlers for mobile swipe
  const handleTouchStart = (e) => {
    isInteractingRef.current = true;
    if (resumeTimerRef.current) {
      clearTimeout(resumeTimerRef.current);
      resumeTimerRef.current = null;
    }

    touchStartXRef.current = e.touches[0].clientX;
    touchStartYRef.current = e.touches[0].clientY;
    touchStartTimeRef.current = Date.now();
    isHorizontalSwipeRef.current = null;
    setIsTransitioning(false);
  };

  const handleTouchMove = (e) => {
    const currentX = e.touches[0].clientX;
    const currentY = e.touches[0].clientY;
    const diffX = currentX - touchStartXRef.current;
    const diffY = currentY - touchStartYRef.current;

    if (isHorizontalSwipeRef.current === null) {
      if (Math.abs(diffX) > 8 || Math.abs(diffY) > 8) {
        isHorizontalSwipeRef.current = Math.abs(diffX) > Math.abs(diffY);
      }
    }

    if (isHorizontalSwipeRef.current) {
      setDragOffset(diffX);
    }
  };

  const handleTouchEnd = () => {
    const diffX = dragOffset;
    const duration = Date.now() - touchStartTimeRef.current;
    const isQuickFlick = duration < 300 && Math.abs(diffX) > 25;
    const isSignificantDrag = Math.abs(diffX) > 50;

    setIsTransitioning(true);
    setDragOffset(0);

    if (isHorizontalSwipeRef.current) {
      if (diffX < 0 && (isSignificantDrag || isQuickFlick)) {
        setMobileIndex((prev) => prev + 1);
      } else if (diffX > 0 && (isSignificantDrag || isQuickFlick)) {
        setMobileIndex((prev) => prev - 1);
      }
    }

    // Resume auto-play after 2.8s of inactivity
    resumeTimerRef.current = setTimeout(() => {
      isInteractingRef.current = false;
    }, 2800);
  };

  // Desktop layout calculations
  const desktopCardWidth =
    viewportWidth >= 1536
      ? 430
      : viewportWidth >= 1280
        ? 400
        : viewportWidth >= 1024
          ? 360
          : 320;
  const desktopGap = 24;
  const desktopStepWidth = desktopCardWidth + desktopGap;
  const desktopCenterOffset = (desktopContainerWidth - desktopCardWidth) / 2;
  const desktopTranslateX =
    desktopCenterOffset - desktopIndex * desktopStepWidth + desktopDragOffset;
  const activeDesktopProjectIndex =
    ((desktopIndex % TOTAL_PROJECTS) + TOTAL_PROJECTS) % TOTAL_PROJECTS;

  // Mobile layout calculations
  const cardWidth = Math.min(viewportWidth * 0.78, 315);
  const gap = 14;
  const stepWidth = cardWidth + gap;
  const centerOffset = (viewportWidth - cardWidth) / 2;
  const translateX = centerOffset - mobileIndex * stepWidth + dragOffset;
  const activeProjectIndex =
    ((mobileIndex % TOTAL_PROJECTS) + TOTAL_PROJECTS) % TOTAL_PROJECTS;

  return (
    <section
      ref={sectionRef}
      id="projects"
      className="relative z-20 sm:z-30 lg:z-20 isolate w-full bg-[#faf8f5] dark:bg-[#09090b] text-zinc-900 dark:text-zinc-100 transition-colors duration-300 pt-8 pb-10 sm:py-16 lg:py-24 overflow-x-clip"
    >
      {/* Viewport on desktop/tablet; relative on mobile */}
      <div className="relative h-auto w-full overflow-x-clip flex flex-col lg:flex-row items-center justify-start lg:justify-between px-0">
        {/* Subtle Ambient Background Lighting */}
        <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-[550px] h-[550px] bg-amber-500/5 dark:bg-indigo-500/5 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute bottom-10 left-10 w-[400px] h-[400px] bg-black/[0.02] dark:bg-white/[0.02] rounded-full blur-[120px] pointer-events-none" />

        <div className="relative w-full flex flex-col lg:flex-row items-center justify-between min-h-0 sm:min-h-0 lg:min-h-[640px] overflow-visible">
          {/* TOP (MOBILE) / LEFT (DESKTOP): Heading & Architectural Description */}
          <div className="w-full lg:w-[440px] xl:w-[480px] shrink-0 flex flex-col justify-start z-30 pt-0 text-left px-5 sm:px-8 lg:pl-[max(2rem,calc((100vw-1280px)/2+4rem))] lg:pr-6">
            {/* Category Badges */}
            <div className="flex items-center gap-2 sm:gap-2.5 mb-2 sm:mb-2.5 lg:mb-6 shrink-0">
              <span className="inline-flex items-center px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full text-[10px] sm:text-[11px] font-semibold tracking-widest uppercase bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-zinc-700 dark:text-zinc-300 backdrop-blur-md shrink-0">
                Portfolio
              </span>
              <span className="inline-flex items-center px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full text-[10px] sm:text-[11px] font-semibold tracking-widest uppercase bg-[#D4AF37]/15 dark:bg-[#D4AF37]/10 border border-[#D4AF37]/30 dark:border-[#D4AF37]/25 text-[#8F6B32] dark:text-[#E7C982] backdrop-blur-md shrink-0">
                Residences
              </span>
            </div>

            {/* Eyebrow Label */}
            <p className="text-[10px] sm:text-[11px] font-bold tracking-[0.24em] uppercase text-zinc-500 dark:text-zinc-400 mb-1.5 sm:mb-2 lg:mb-3">
              Completed Projects
            </p>

            {/* Main Headline */}
            <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black uppercase tracking-tight text-zinc-900 dark:text-white leading-[1.02] mb-2 sm:mb-3 lg:mb-6">
              Spaces <br className="hidden sm:inline" />
              <span className="text-transparent [-webkit-text-stroke:1.5px_#18181b] sm:[-webkit-text-stroke:2px_#18181b] lg:[-webkit-text-stroke:2.5px_#18181b] dark:[-webkit-text-stroke:1.5px_#ffffff] dark:sm:[-webkit-text-stroke:2px_#ffffff] dark:lg:[-webkit-text-stroke:2.5px_#ffffff]">
                We’ve Built
              </span>
              <span className="text-[#D4AF37] ml-1">.</span>
            </h2>

            {/* Architectural Description */}
            <p className="text-xs sm:text-sm lg:text-base text-zinc-600 dark:text-zinc-400 font-normal leading-relaxed max-w-sm sm:max-w-md lg:max-w-lg mb-0">
              A curated selection of private residences, tranquil pavilions, and
              contemporary living spaces harmonized with natural light,
              landscape, and enduring materiality.
            </p>

            {/* DESKTOP CONTROLS: Left / Right navigation arrow controls, Counter & Dots */}
            <div className="hidden sm:flex flex-col gap-4 mt-6 lg:mt-8 pt-4 border-t border-black/5 dark:border-white/5">
              <div className="flex items-center gap-4">
                {/* Left & Right Navigation Arrow Controls */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={prevDesktopSlide}
                    aria-label="Previous project (Left)"
                    className="w-10 h-10 lg:w-11 lg:h-11 rounded-full border border-black/10 dark:border-white/10 bg-white dark:bg-[#141418] flex items-center justify-center text-zinc-700 dark:text-zinc-300 hover:text-black dark:hover:text-white hover:border-[#D4AF37] dark:hover:border-[#D4AF37] hover:scale-105 active:scale-95 transition-all shadow-sm group"
                  >
                    <svg
                      className="w-4 h-4 lg:w-4.5 lg:h-4.5 group-hover:-translate-x-0.5 transition-transform"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15 19l-7-7 7-7"
                      />
                    </svg>
                  </button>

                  <button
                    type="button"
                    onClick={nextDesktopSlide}
                    aria-label="Next project (Right)"
                    className="w-10 h-10 lg:w-11 lg:h-11 rounded-full border border-black/10 dark:border-white/10 bg-white dark:bg-[#141418] flex items-center justify-center text-zinc-700 dark:text-zinc-300 hover:text-black dark:hover:text-white hover:border-[#D4AF37] dark:hover:border-[#D4AF37] hover:scale-105 active:scale-95 transition-all shadow-sm group"
                  >
                    <svg
                      className="w-4 h-4 lg:w-4.5 lg:h-4.5 group-hover:translate-x-0.5 transition-transform"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </button>
                </div>

                {/* Step Counter */}
                <div className="flex items-center gap-2 pl-2 font-mono text-sm text-zinc-500 dark:text-zinc-400">
                  <span className="text-base font-bold text-zinc-900 dark:text-white">
                    0{activeDesktopProjectIndex + 1}
                  </span>
                  <span className="text-zinc-400 dark:text-zinc-600">/</span>
                  <span>0{TOTAL_PROJECTS}</span>
                </div>

                {/* Active Project Title Preview */}
                <span className="hidden md:inline-block text-xs font-semibold tracking-wider uppercase text-[#8F6B32] dark:text-[#E7C982] truncate max-w-[160px]">
                  {COMPLETED_PROJECTS[activeDesktopProjectIndex]?.title}
                </span>
              </div>

              {/* Pagination Dots */}
              <div className="flex items-center gap-1.5">
                {COMPLETED_PROJECTS.map((project, i) => {
                  const isDotActive = activeDesktopProjectIndex === i;
                  return (
                    <button
                      key={project.id}
                      type="button"
                      aria-label={`Go to project ${i + 1}: ${project.title}`}
                      onClick={() => {
                        setIsDesktopTransitioning(true);
                        const currentModulo =
                          ((desktopIndex % TOTAL_PROJECTS) + TOTAL_PROJECTS) %
                          TOTAL_PROJECTS;
                        const diff = i - currentModulo;
                        setDesktopIndex((prev) => prev + diff);
                        pauseDesktopAutoPlay();
                      }}
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        isDotActive
                          ? "w-7 bg-[#D4AF37]"
                          : "w-2 bg-black/15 dark:bg-white/20 hover:bg-black/30 dark:hover:bg-white/40"
                      }`}
                    />
                  );
                })}
              </div>
            </div>
          </div>

          {/* ======================================================== */}
          {/* DESKTOP & TABLET: Seamless Expansive Horizontal Carousel */}
          {/* ======================================================== */}
          <div
            ref={desktopContainerRef}
            onMouseDown={handleDesktopMouseDown}
            onMouseMove={handleDesktopMouseMove}
            onMouseUp={handleDesktopMouseUp}
            onMouseEnter={handleDesktopMouseEnter}
            onMouseLeave={handleDesktopMouseLeave}
            className={`hidden sm:flex flex-1 min-w-0 w-full relative h-[460px] md:h-[500px] lg:h-[550px] items-center z-10 select-none overflow-visible ${
              isDesktopDragging ? "cursor-grabbing" : "cursor-grab"
            }`}
            style={{
              WebkitMaskImage:
                "linear-gradient(to right, transparent 0%, rgba(0,0,0,0.3) 5%, black 18%, black 70%, rgba(0,0,0,0.3) 92%, transparent 100%)",
              maskImage:
                "linear-gradient(to right, transparent 0%, rgba(0,0,0,0.3) 5%, black 18%, black 70%, rgba(0,0,0,0.3) 92%, transparent 100%)",
            }}
          >
            {/* Sliding Track */}
            <div
              onTransitionEnd={handleDesktopTransitionEnd}
              className="flex gap-6 will-change-transform py-4 items-center"
              style={{
                transform: `translate3d(${desktopTranslateX}px, 0, 0)`,
                transition: isDesktopTransitioning
                  ? "transform 550ms cubic-bezier(0.25, 1, 0.5, 1)"
                  : "none",
              }}
            >
              {EXTENDED_PROJECTS.map((project, index) => {
                const offset = index - desktopIndex;
                const isCenter = offset === 0;
                const isLeft = offset === -1;
                const isRight = offset === 1;
                const isFarRight = offset === 2;

                return (
                  <div
                    key={`${project.id}-desktop-${index}`}
                    onClick={() => {
                      if (Math.abs(desktopDragOffset) > 10) return;
                      if (!isCenter) {
                        setIsDesktopTransitioning(true);
                        setDesktopIndex(index);
                        pauseDesktopAutoPlay();
                      }
                    }}
                    className={`shrink-0 rounded-3xl bg-white dark:bg-[#141418] border p-3.5 sm:p-4 flex flex-col justify-between select-none cursor-pointer transition-all duration-500 ease-out group ${
                      isCenter
                        ? "scale-100 opacity-100 shadow-[0_24px_50px_-8px_rgba(0,0,0,0.18)] dark:shadow-[0_24px_50px_rgba(0,0,0,0.7)] border-[#D4AF37]/50 dark:border-[#D4AF37]/40 ring-1 ring-[#D4AF37]/20 z-30"
                        : isLeft
                          ? "scale-[0.88] opacity-30 shadow-sm border-zinc-200/50 dark:border-white/[0.05] z-10 hover:opacity-60"
                          : isRight
                            ? "scale-[0.92] opacity-60 shadow-md border-zinc-200/70 dark:border-white/[0.08] z-20 hover:opacity-85"
                            : isFarRight
                              ? "scale-[0.84] opacity-25 shadow-sm border-zinc-200/40 dark:border-white/[0.04] z-10"
                              : "scale-[0.80] opacity-10 pointer-events-none"
                    }`}
                    style={{
                      width: `${desktopCardWidth}px`,
                      transformOrigin: "center center",
                    }}
                  >
                    {/* Project Image */}
                    <div className="relative w-full aspect-[16/10] rounded-2xl overflow-hidden bg-zinc-100 dark:bg-zinc-900">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={project.image}
                        alt={project.location}
                        width={420}
                        height={262}
                        decoding="async"
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        loading="lazy"
                      />
                      {/* Project Title Tag */}
                      <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-black/55 backdrop-blur-md text-[11px] font-semibold text-white tracking-wide border border-white/10">
                        {project.title}
                      </div>
                    </div>

                    {/* Location Caption & Heart Icon */}
                    <div className="mt-3.5 flex items-center justify-between px-1 pb-0.5">
                      <div className="flex items-center gap-2 min-w-0">
                        <svg
                          className="w-4 h-4 text-zinc-500 shrink-0"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>
                        <span className="text-xs sm:text-sm font-semibold tracking-wide text-zinc-900 dark:text-white truncate">
                          {project.location}
                        </span>
                      </div>

                      {/* Minimalist Heart / Favorite Action Icon */}
                      <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-blue-50/90 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/40 flex items-center justify-center text-blue-500 shrink-0 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/60 transition-colors">
                        <svg
                          className="w-3.5 h-3.5 sm:w-4 sm:h-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ======================================================== */}
          {/* MOBILE: Seamless Infinite Horizontal Auto-Playing Carousel */}
          {/* ======================================================== */}
          <div className="block sm:hidden w-full relative overflow-x-clip overflow-y-visible pt-4 pb-2">
            {/* Touch Swiping Container */}
            <div
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              className="w-full overflow-x-clip overflow-y-visible select-none touch-pan-y"
            >
              {/* Sliding Track */}
              <div
                onTransitionEnd={handleTransitionEnd}
                className="flex gap-3.5 will-change-transform pt-2 pb-10"
                style={{
                  transform: `translate3d(${translateX}px, 0, 0)`,
                  transition: isTransitioning
                    ? "transform 500ms cubic-bezier(0.25, 1, 0.5, 1)"
                    : "none",
                }}
              >
                {EXTENDED_PROJECTS.map((project, index) => {
                  const isActive = index === mobileIndex;

                  return (
                    <div
                      key={`${project.id}-${index}`}
                      onClick={() => {
                        if (!isActive) {
                          setIsTransitioning(true);
                          setMobileIndex(index);
                          isInteractingRef.current = true;
                          if (resumeTimerRef.current)
                            clearTimeout(resumeTimerRef.current);
                          resumeTimerRef.current = setTimeout(() => {
                            isInteractingRef.current = false;
                          }, 2800);
                        }
                      }}
                      className={`shrink-0 w-[78vw] max-w-[315px] rounded-3xl bg-white dark:bg-[#141418] border border-zinc-200/90 dark:border-white/[0.08] p-3.5 flex flex-col justify-between select-none cursor-pointer transition-all duration-500 ease-out ${
                        isActive
                          ? "scale-100 opacity-100 shadow-[0_16px_36px_-6px_rgba(0,0,0,0.14),0_6px_16px_-2px_rgba(0,0,0,0.08)] dark:shadow-[0_20px_45px_rgba(0,0,0,0.7)] border-zinc-300 dark:border-white/[0.22]"
                          : "scale-[0.93] opacity-65 shadow-sm border-zinc-200/70 dark:border-white/[0.06]"
                      }`}
                      style={{
                        width: `${cardWidth}px`,
                        transformOrigin: "center center",
                      }}
                    >
                      {/* Project Image */}
                      <div className="relative w-full aspect-[16/10] rounded-2xl overflow-hidden bg-zinc-100 dark:bg-zinc-900">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={project.image}
                          alt={project.location}
                          width={380}
                          height={238}
                          decoding="async"
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                          loading="lazy"
                        />
                      </div>

                      {/* Location Caption & Heart Icon */}
                      <div className="mt-3.5 flex items-center justify-between px-1 pb-0.5">
                        <div className="flex items-center gap-2 min-w-0">
                          <svg
                            className="w-4 h-4 text-zinc-500 shrink-0"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                          </svg>
                          <span className="text-xs sm:text-sm font-semibold tracking-wide text-zinc-900 dark:text-white truncate">
                            {project.location}
                          </span>
                        </div>

                        {/* Minimalist Heart / Favorite Action Icon */}
                        <div className="w-7 h-7 rounded-full bg-blue-50/90 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/40 flex items-center justify-center text-blue-500 shrink-0">
                          <svg
                            className="w-3.5 h-3.5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                            />
                          </svg>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Carousel Navigation Bar: Counter, Dots & Prev/Next Controls */}
            <div className="flex items-center justify-between px-5 pt-0">
              {/* Step Counter */}
              <span className="font-mono text-xs text-zinc-500 dark:text-zinc-400">
                <span className="font-bold text-zinc-900 dark:text-white">
                  0{activeProjectIndex + 1}
                </span>
                {" / "}
                <span>0{TOTAL_PROJECTS}</span>
              </span>

              {/* Pagination Indicator Dots */}
              <div className="flex items-center gap-1.5">
                {COMPLETED_PROJECTS.map((_, i) => {
                  const isDotActive = activeProjectIndex === i;

                  return (
                    <button
                      key={i}
                      aria-label={`Go to project ${i + 1}`}
                      onClick={() => {
                        setIsTransitioning(true);
                        const currentModulo =
                          ((mobileIndex % TOTAL_PROJECTS) + TOTAL_PROJECTS) %
                          TOTAL_PROJECTS;
                        const diff = i - currentModulo;
                        setMobileIndex((prev) => prev + diff);

                        isInteractingRef.current = true;
                        if (resumeTimerRef.current)
                          clearTimeout(resumeTimerRef.current);
                        resumeTimerRef.current = setTimeout(() => {
                          isInteractingRef.current = false;
                        }, 2800);
                      }}
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        isDotActive
                          ? "w-6 bg-[#D4AF37]"
                          : "w-2 bg-black/15 dark:bg-white/20"
                      }`}
                    />
                  );
                })}
              </div>

              {/* Prev / Next Arrow Controls */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    prevMobileSlide();
                    isInteractingRef.current = true;
                    if (resumeTimerRef.current)
                      clearTimeout(resumeTimerRef.current);
                    resumeTimerRef.current = setTimeout(() => {
                      isInteractingRef.current = false;
                    }, 2800);
                  }}
                  aria-label="Previous project"
                  className="w-8 h-8 rounded-full border border-black/10 dark:border-white/10 bg-white dark:bg-[#141418] flex items-center justify-center text-zinc-700 dark:text-zinc-300 hover:text-black dark:hover:text-white transition-all active:scale-95 shadow-sm"
                >
                  <svg
                    className="w-3.5 h-3.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                </button>

                <button
                  onClick={() => {
                    nextMobileSlide();
                    isInteractingRef.current = true;
                    if (resumeTimerRef.current)
                      clearTimeout(resumeTimerRef.current);
                    resumeTimerRef.current = setTimeout(() => {
                      isInteractingRef.current = false;
                    }, 2800);
                  }}
                  aria-label="Next project"
                  className="w-8 h-8 rounded-full border border-black/10 dark:border-white/10 bg-white dark:bg-[#141418] flex items-center justify-center text-zinc-700 dark:text-zinc-300 hover:text-black dark:hover:text-white transition-all active:scale-95 shadow-sm"
                >
                  <svg
                    className="w-3.5 h-3.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
