export const SatelliteAnimation = (props: React.SVGProps<SVGSVGElement>) => (
    <svg
      width="80"
      height="80"
      viewBox="0 0 80 80"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <style>
        {`
          .wave-group {
            transform-origin: 30px 40px;
            animation: radiate 2.5s infinite linear;
          }
          @keyframes radiate {
            0% {
              transform: scale(0.5);
              opacity: 1;
            }
            100% {
              transform: scale(1.5);
              opacity: 0;
            }
          }
          .wave-1 {
            animation-delay: 0s;
          }
          .wave-2 {
            animation-delay: -0.8s;
          }
          .wave-3 {
            animation-delay: -1.6s;
          }
        `}
      </style>
      {/* Base/Stand */}
      <path d="M 28 70 L 32 70 L 30 45 Z" fill="#9CA3AF" />
  
      {/* Waves */}
      <g>
          <g className="wave-group wave-1">
              <path d="M 40 30 A 15 15 0 0 1 40 50" stroke="#F97316" strokeWidth="2" fill="none" />
              <path d="M 20 50 A 15 15 0 0 1 20 30" stroke="#F97316" strokeWidth="2" fill="none" />
              <path d="M 20 25 A 15 15 0 0 1 40 25" stroke="#F97316" strokeWidth="2" fill="none" />
          </g>
          <g className="wave-group wave-2">
              <path d="M 40 30 A 15 15 0 0 1 40 50" stroke="#F97316" strokeWidth="2" fill="none" />
              <path d="M 20 50 A 15 15 0 0 1 20 30" stroke="#F97316" strokeWidth="2" fill="none" />
              <path d="M 20 25 A 15 15 0 0 1 40 25" stroke="#F97316" strokeWidth="2" fill="none" />
          </g>
          <g className="wave-group wave-3">
              <path d="M 40 30 A 15 15 0 0 1 40 50" stroke="#F97316" strokeWidth="2" fill="none" />
              <path d="M 20 50 A 15 15 0 0 1 20 30" stroke="#F97316" strokeWidth="2" fill="none" />
              <path d="M 20 25 A 15 15 0 0 1 40 25" stroke="#F97316" strokeWidth="2" fill="none" />
          </g>
      </g>
    </svg>
  );
  