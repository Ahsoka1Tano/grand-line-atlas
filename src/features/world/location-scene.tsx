"use client";

import Image from "next/image";
import { ArrowRight, Compass, MapPin, Waves } from "lucide-react";
import { useState } from "react";
import type { WorldLocation } from "@/content/world";
import { Modal } from "@/components/modal";

export function LocationScene({
  location,
  onClose,
}: {
  location: WorldLocation;
  onClose: () => void;
}) {
  const [point, setPoint] = useState(0);
  return (
    <Modal label={`Локация: ${location.name}`} onClose={onClose} className="location-modal">
      <div className="location-panorama">
        <Image
          src={location.image}
          alt={`Панорама: ${location.name}`}
          fill
          sizes="(max-width: 650px) 100vw, 960px"
          loading="eager"
        />
        <div className="location-panorama-shade" />
        <div className="location-panorama-title">
          <span className="eyebrow">
            EAST BLUE <span> / </span> {location.latinName}
          </span>
          <h2>{location.name}</h2>
          <span>{location.subtitle}</span>
        </div>
      </div>
      <div className="location-scene-content">
        <div className="location-story">
          <span className="eyebrow subdued">
            <Waves size={13} />
            НА БЕРЕГУ
          </span>
          <p>{location.flavor}</p>
          <div className="location-scene-note">
            <Compass size={15} />
            <span>
              Первая глава твоего путешествия.
              <br />
              Мир будет расти вместе с командой.
            </span>
          </div>
        </div>
        <div className="location-pois">
          <span className="eyebrow subdued">ТОЧКИ ИНТЕРЕСА</span>
          <div className="poi-tabs" role="group" aria-label="Точки интереса">
            {location.points.map((item, index) => (
              <button
                key={item.name}
                aria-pressed={index === point}
                className={index === point ? "selected" : ""}
                onClick={() => setPoint(index)}
              >
                <MapPin size={13} />
                {item.name}
                <ArrowRight size={13} />
              </button>
            ))}
          </div>
          <p className="poi-description" aria-live="polite">
            {location.points[point].description}
          </p>
        </div>
      </div>
    </Modal>
  );
}
