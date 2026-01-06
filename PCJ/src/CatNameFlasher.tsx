import { useEffect, useState } from "react";

import puddleTrans from "./assets/puddle-trans.png";
import crispTrans from "./assets/crisp-trans.png";
import juniperTrans from "./assets/juniper-trans.png";

const NAMES = ["Puddle", "Crisp", "Juniper"] as const;
const COLORS = ["#1a1033", "#ffffff"] as const; // both contrast with salmon

const CAT_IMAGES: Record<(typeof NAMES)[number], string> = {
  Puddle: puddleTrans,
  Crisp: crispTrans,
  Juniper: juniperTrans,
};

type CatNameFlasherProps = {
  cycleMs?: number;
  pulseMs?: number;
};

const CatNameFlasher = ({ cycleMs = 2000, pulseMs = 323 }: CatNameFlasherProps) => {
  const [nameIndex, setNameIndex] = useState(0);
  const [colorIndex, setColorIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setNameIndex((prev) => (prev + 1) % NAMES.length);
      setColorIndex((prev) => (prev + 1) % COLORS.length);
    }, cycleMs); // swap on provided interval

    return () => clearInterval(interval);
  }, [cycleMs]);

  const name = NAMES[nameIndex];
  const color = COLORS[colorIndex];
  const imageSrc = CAT_IMAGES[name];

  return (
    <>
      <div className="cat-name-flasher">
        <span
          key={name}
          className="cat-name-text"
          style={{ color, animationDuration: `${pulseMs}ms` }}
        >
          {name}
        </span>
      </div>
      <div className="cat-image-flasher">
        <img
          key={name}
          src={imageSrc}
          alt={name}
          className="cat-image"
          style={{ animationDuration: `${pulseMs}ms` }}
        />
      </div>
    </>
  );
};

export default CatNameFlasher;
