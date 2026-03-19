import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

const PageTransition = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(false);
    const timer = setTimeout(() => setVisible(true), 50);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  return (
    <div
      style={{
        opacity: visible ? 1 : 0,
        transition: "opacity 300ms ease-in-out",
      }}
    >
      {children}
    </div>
  );
};

export default PageTransition;