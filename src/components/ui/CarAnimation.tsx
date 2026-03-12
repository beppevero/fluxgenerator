export const CarAnimation = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    width="100"
    height="40"
    viewBox="0 0 100 40"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <style>
        {`
            .car-container {
                animation: drive 3s linear infinite;
            }
            @keyframes drive {
                from {
                    transform: translateX(-120px);
                }
                to {
                    transform: translateX(120px);
                }
            }
            .wheel {
                animation: spin 0.8s linear infinite;
                transform-origin: center;
            }
            @keyframes spin {
                from {
                    transform: rotate(0deg);
                }
                to {
                    transform: rotate(360deg);
                }
            }
        `}
    </style>
    <g className="car-container">
      {/* Car body */}
      <path d="M 10 30 L 90 30 L 85 20 L 65 20 L 55 10 L 30 10 L 20 20 L 15 20 Z" fill="#0EA5E9" />
      {/* Wheels */}
      <circle className="wheel" cx="30" cy="30" r="5" fill="#333" />
      <circle className="wheel" cx="70" cy="30" r="5" fill="#333" />
    </g>
  </svg>
);
