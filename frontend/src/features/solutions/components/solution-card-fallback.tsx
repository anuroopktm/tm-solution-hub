import { useId } from "react";

// Official Conforge Brand Wordmark vector paths extracted directly from Conforge Branding guidelines (Page 4)
// Total bounding box: 1085.5 x 154.0 (Centered in 1200 x 675 16:9 canvas)
const CONFORGE_C =
  "M 69.64 154.00 C 50.58 154.00 34.21 147.53 20.52 134.58 C 6.84 121.50 0.00 105.44 0.00 86.38 C 0.00 67.20 5.99 51.14 17.96 38.19 C 29.93 25.11 45.27 18.58 63.96 18.58 C 78.62 18.58 93.46 21.02 108.48 25.91 L 106.11 33.24 C 91.45 28.84 77.39 26.64 63.96 26.64 C 47.95 26.64 34.88 32.38 24.74 43.87 C 14.60 55.35 9.53 69.40 9.53 86.02 C 9.53 102.63 15.39 116.80 27.12 128.53 C 38.97 140.14 53.14 145.94 69.64 145.94 C 84.05 145.94 96.51 143.74 107.02 139.34 L 109.77 145.57 C 105.12 148.26 99.02 150.34 91.45 151.80 C 83.99 153.27 76.72 154.00 69.64 154.00 Z M 69.64 154.00";

const CONFORGE_O1 =
  "M 135.33 134.39 C 123.23 121.32 117.19 105.26 117.19 86.20 C 117.19 67.14 123.23 51.14 135.33 38.19 C 147.55 25.11 162.94 18.58 181.51 18.58 C 200.08 18.58 215.47 25.11 227.69 38.19 C 239.91 51.14 246.02 67.14 246.02 86.20 C 246.02 105.26 239.91 121.32 227.69 134.39 C 215.47 147.46 200.08 154.00 181.51 154.00 C 162.94 154.00 147.55 147.46 135.33 134.39 Z M 141.93 43.87 C 131.79 55.23 126.72 69.34 126.72 86.20 C 126.72 103.06 131.79 117.23 141.93 128.71 C 152.19 140.20 165.38 145.94 181.51 145.94 C 197.76 145.94 210.95 140.20 221.09 128.71 C 231.36 117.23 236.48 103.06 236.48 86.20 C 236.48 69.34 231.36 55.23 221.09 43.87 C 210.95 32.38 197.76 26.64 181.51 26.64 C 165.26 26.64 152.07 32.38 141.93 43.87 Z M 141.93 43.87";

const CONFORGE_N =
  "M 278.60 41.67 L 278.96 57.25 L 278.96 151.80 L 270.17 151.80 L 270.17 19.68 L 274.20 19.68 L 360.51 119.18 C 366.38 126.15 370.89 131.71 374.07 135.86 C 373.58 130.00 373.34 123.28 373.34 115.70 L 373.34 20.78 L 382.14 20.78 L 382.14 152.90 L 378.11 152.90 L 290.14 51.56 C 284.04 44.60 280.12 39.96 278.41 37.64 Z M 278.60 41.67";

const CONFORGE_F_STAR =
  "M 440.62 0.30 L 462.19 10.04 L 483.62 0.00 L 473.89 21.57 L 483.92 43.00 L 462.35 33.26 L 440.92 43.30 L 450.66 21.73 Z M 440.62 0.30";

const CONFORGE_F_FORGE =
  "M 577.99 45.02 L 485.64 45.02 C 485.64 70.52 506.32 91.20 531.82 91.20 L 577.99 91.20 L 577.99 121.50 L 530.38 121.50 C 519.62 121.50 510.90 130.22 510.90 140.98 L 510.90 151.44 L 460.39 151.44 L 460.39 70.21 L 511.10 19.51 L 511.00 19.41 L 577.99 19.41 Z M 577.99 45.02";

const CONFORGE_O2 =
  "M 661.81 153.34 C 648.76 153.34 637.27 150.45 627.35 144.68 C 617.44 138.90 609.65 130.93 604.00 120.77 C 598.48 110.59 595.72 98.73 595.72 85.18 C 595.72 71.74 598.48 59.94 604.00 49.77 C 609.65 39.48 617.44 31.45 627.35 25.67 C 637.27 19.90 648.76 17.01 661.81 17.01 C 674.99 17.01 686.48 19.90 696.27 25.67 C 706.19 31.45 713.91 39.48 719.43 49.77 C 725.08 59.94 727.91 71.74 727.91 85.18 C 727.91 98.73 725.08 110.59 719.43 120.77 C 713.91 130.93 706.19 138.90 696.27 144.68 C 686.48 150.45 674.99 153.34 661.81 153.34 Z M 662.00 131.31 C 670.29 131.31 677.50 129.49 683.66 125.85 C 689.81 122.08 694.58 116.75 697.96 109.84 C 701.36 102.94 703.05 94.71 703.05 85.18 C 703.05 75.63 701.36 67.41 697.96 60.51 C 694.58 53.60 689.81 48.33 683.66 44.69 C 677.50 40.93 670.29 39.04 662.00 39.04 C 653.71 39.04 646.43 40.93 640.16 44.69 C 634.01 48.33 629.24 53.60 625.85 60.51 C 622.46 67.41 620.76 75.63 620.76 85.18 C 620.76 94.71 622.46 102.94 625.85 109.84 C 629.24 116.75 634.01 122.08 640.16 125.85 C 646.43 129.49 653.71 131.31 662.00 131.31 Z M 662.00 131.31";

const CONFORGE_R =
  "M 742.93 151.08 L 742.93 19.27 L 798.10 19.27 C 808.77 19.27 817.55 21.09 824.46 24.73 C 831.36 28.24 836.51 33.07 839.90 39.23 C 843.29 45.25 844.98 52.16 844.98 59.94 C 844.98 66.09 843.61 71.74 840.84 76.89 C 838.21 82.03 834.50 86.43 829.73 90.07 C 834.75 93.33 838.58 97.60 841.22 102.87 C 843.86 108.02 845.30 113.98 845.55 120.76 L 847.06 151.08 L 823.14 151.08 L 821.07 121.14 C 820.82 116.37 819.94 112.48 818.43 109.46 C 816.93 106.32 814.54 104.06 811.28 102.68 C 808.14 101.18 803.75 100.42 798.10 100.42 L 767.41 100.42 L 767.41 151.08 Z M 767.41 80.65 L 796.59 80.65 C 804.75 80.65 810.71 78.77 814.48 75.00 C 818.25 71.24 820.13 66.21 820.13 59.94 C 820.13 53.41 818.25 48.33 814.48 44.69 C 810.84 41.05 804.88 39.23 796.59 39.23 L 767.41 39.23 Z M 767.41 80.65";

const CONFORGE_G =
  "M 925.18 153.34 C 910.87 153.34 898.63 150.58 888.46 145.05 C 878.42 139.41 870.70 131.56 865.30 121.52 C 860.03 111.35 857.39 99.55 857.39 86.12 C 857.39 72.56 860.03 60.57 865.30 50.15 C 870.70 39.73 878.29 31.63 888.09 25.86 C 898.00 19.96 909.74 17.01 923.30 17.01 C 938.86 17.01 951.73 20.71 961.90 28.12 C 972.07 35.53 978.66 45.76 981.67 58.81 L 954.18 58.81 C 952.17 52.79 948.59 48.08 943.45 44.69 C 938.30 41.30 931.58 39.61 923.30 39.61 C 914.64 39.61 907.23 41.49 901.08 45.25 C 895.05 49.02 890.41 54.42 887.14 61.45 C 883.88 68.35 882.25 76.64 882.25 86.30 C 882.25 95.84 883.94 104.00 887.33 110.79 C 890.72 117.44 895.55 122.59 901.83 126.23 C 908.23 129.86 916.02 131.68 925.18 131.68 C 936.10 131.68 944.70 128.61 950.98 122.46 C 957.38 116.31 960.64 107.77 960.77 96.85 L 924.05 96.85 L 924.05 78.39 L 985.44 78.39 L 985.44 88.94 C 985.44 103.12 982.80 114.99 977.53 124.53 C 972.38 134.07 965.29 141.29 956.25 146.18 C 947.21 150.95 936.86 153.34 925.18 153.34 Z M 925.18 153.34";

const CONFORGE_E =
  "M 999.45 151.08 L 999.45 19.27 L 1085.50 19.27 L 1085.50 39.04 L 1023.93 39.04 L 1023.93 74.62 L 1079.85 74.62 L 1079.85 93.83 L 1023.93 93.83 L 1023.93 131.30 L 1085.50 131.30 L 1085.50 151.08 Z M 999.45 151.08";

interface WordmarkLetter {
  id: string;
  d: string;
  isStar?: boolean;
  dur: string;
  delay: string;
}

const CONFORGE_LETTERS: WordmarkLetter[] = [
  { id: "c", d: CONFORGE_C, dur: "2.2s", delay: "0.0s" },
  { id: "o1", d: CONFORGE_O1, dur: "2.2s", delay: "0.15s" },
  { id: "n", d: CONFORGE_N, dur: "2.0s", delay: "0.3s" },
  {
    id: "f_star",
    d: CONFORGE_F_STAR,
    isStar: true,
    dur: "1.8s",
    delay: "0.45s",
  },
  { id: "f_forge", d: CONFORGE_F_FORGE, dur: "2.2s", delay: "0.5s" },
  { id: "o2", d: CONFORGE_O2, dur: "2.2s", delay: "0.65s" },
  { id: "r", d: CONFORGE_R, dur: "2.2s", delay: "0.8s" },
  { id: "g", d: CONFORGE_G, dur: "2.2s", delay: "0.95s" },
  { id: "e", d: CONFORGE_E, dur: "2.0s", delay: "1.1s" },
];

export function SolutionCardFallback() {
  const containerId = useId();
  const gradientId = `conforge-grad-${containerId.replace(/:/g, "")}`;

  return (
    <div className="relative h-full w-full overflow-hidden bg-muted/15">
      {/* Subtle Matrix Dots */}
      <div
        className="absolute inset-0 opacity-15 dark:opacity-20 transition-opacity duration-300 group-hover/card:opacity-30"
        style={{
          backgroundImage:
            "radial-gradient(circle, var(--color-foreground) 1px, transparent 1px)",
          backgroundSize: "20px 20px",
        }}
      />

      {/* Soft Vignette Overlay */}
      <div className="pointer-events-none absolute inset-0 bg-linear-to-b from-background/20 via-transparent to-background/70" />

      {/* Animated SVG Graphics (16:9 ViewBox 1200 x 675 perfectly framing the CONFORGE wordmark) */}
      <svg
        className="pointer-events-none absolute inset-0 h-full w-full"
        viewBox="0 0 1200 675"
        preserveAspectRatio="xMidYMid meet"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop
              offset="0%"
              stopColor="var(--color-primary)"
              stopOpacity="0.2"
            />
            <stop
              offset="60%"
              stopColor="var(--color-primary)"
              stopOpacity="1"
            />
            <stop
              offset="100%"
              stopColor="var(--color-primary)"
              stopOpacity="0.8"
            />
          </linearGradient>
        </defs>

        {/* Central CONFORGE Wordmark from Official Brand Guidelines */}
        <g
          transform="translate(57.25, 260.5)"
          className="transition-transform duration-300 group-hover/card:scale-[1.02] origin-[600px_337.5px]"
        >
          {CONFORGE_LETTERS.map((letter) => (
            <g key={letter.id}>
              {/* Subtle inner radiance on hover matching category theming */}
              <path
                d={letter.d}
                fill="currentColor"
                className={
                  letter.isStar
                    ? "text-primary/10 transition-colors duration-300 group-hover/card:text-primary/20"
                    : "text-primary/0 transition-colors duration-300 group-hover/card:text-primary/5"
                }
              />

              {/* Wireframe Edge Contour matching category SVG colors */}
              <path
                d={letter.d}
                fill="none"
                stroke="currentColor"
                strokeWidth={letter.isStar ? "3.5" : "3.0"}
                strokeLinecap="round"
                strokeLinejoin="round"
                className={
                  letter.isStar
                    ? "text-primary/80 transition-colors duration-300 group-hover/card:text-primary"
                    : "text-border/70 transition-colors duration-300 group-hover/card:text-border/95"
                }
              />

              {/* Animated Light Beam flowing on hover using the exact category beam styling */}
              <path
                d={letter.d}
                pathLength={100}
                stroke={`url(#${gradientId})`}
                strokeWidth={letter.isStar ? "4.5" : "3.5"}
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
                className="circuit-beam-flow"
                style={{
                  animationDuration: letter.dur,
                  animationDelay: letter.delay,
                }}
              />
            </g>
          ))}
        </g>
      </svg>
    </div>
  );
}

export default SolutionCardFallback;
