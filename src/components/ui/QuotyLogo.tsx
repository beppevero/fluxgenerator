export const QuotyLogo = (props: React.SVGProps<SVGSVGElement>) => (
    <svg
      viewBox="0 0 200 200"
      width={48}
      height={48}
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <defs>
        <path
          id="arm"
          d="M 100 60 A 40 40 0 0 1 135 80"
          stroke="#00A9FF"
          strokeWidth="5"
          fill="none"
          strokeLinecap="round"
        />
        <circle id="dot" cx="135" cy="80" r="4" fill="#00A9FF" />
      </defs>
      <g>
        <use href="#arm" transform="rotate(0 100 100)" />
        <use href="#dot" transform="rotate(0 100 100)" />
        <use href="#arm" transform="rotate(20 100 100)" />
        <use href="#dot" transform="rotate(20 100 100)" />
        <use href="#arm" transform="rotate(40 100 100)" />
        <use href="#dot" transform="rotate(40 100 100)" />
        <use href="#arm" transform="rotate(60 100 100)" />
        <use href="#dot" transform="rotate(60 100 100)" />
        <use href="#arm" transform="rotate(80 100 100)" />
        <use href="#dot" transform="rotate(80 100 100)" />
        <use href="#arm" transform="rotate(100 100 100)" />
        <use href="#dot" transform="rotate(100 100 100)" />
        <use href="#arm" transform="rotate(120 100 100)" />
        <use href="#dot" transform="rotate(120 100 100)" />
        <use href="#arm" transform="rotate(140 100 100)" />
        <use href="#dot" transform="rotate(140 100 100)" />
        <use href="#arm" transform="rotate(160 100 100)" />
        <use href="#dot" transform="rotate(160 100 100)" />
        <use href="#arm" transform="rotate(180 100 100)" />
        <use href="#dot" transform="rotate(180 100 100)" />
        <use href="#arm" transform="rotate(200 100 100)" />
        <use href="#dot" transform="rotate(200 100 100)" />
        <use href="#arm" transform="rotate(220 100 100)" />
        <use href="#dot" transform="rotate(220 100 100)" />
        <use href="#arm" transform="rotate(240 100 100)" />
        <use href="#dot" transform="rotate(240 100 100)" />
        <use href="#arm" transform="rotate(260 100 100)" />
        <use href="#dot" transform="rotate(260 100 100)" />
        <use href="#arm" transform="rotate(280 100 100)" />
        <use href="#dot" transform="rotate(280 100 100)" />
        <use href="#arm" transform="rotate(300 100 100)" />
        <use href="#dot" transform="rotate(300 100 100)" />
        <use href="#arm" transform="rotate(320 100 100)" />
        <use href="#dot" transform="rotate(320 100 100)" />
        <use href="#arm" transform="rotate(340 100 100)" />
        <use href="#dot" transform="rotate(340 100 100)" />
      </g>
    </svg>
);
