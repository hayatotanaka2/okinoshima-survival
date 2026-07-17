import { avatarAssets } from "@/lib/avatarAssets";

const floaters = [
  { index: 0, left: "7%", top: "13%", size: 42, delay: "-1s", duration: "15s" },
  { index: 4, left: "82%", top: "10%", size: 34, delay: "-6s", duration: "18s" },
  { index: 7, left: "72%", top: "28%", size: 46, delay: "-10s", duration: "20s" },
  { index: 10, left: "10%", top: "44%", size: 32, delay: "-4s", duration: "17s" },
  { index: 14, left: "87%", top: "53%", size: 40, delay: "-12s", duration: "22s" },
  { index: 16, left: "18%", top: "72%", size: 48, delay: "-8s", duration: "19s" },
  { index: 19, left: "77%", top: "78%", size: 36, delay: "-2s", duration: "16s" },
  { index: 22, left: "45%", top: "88%", size: 44, delay: "-14s", duration: "21s" },
  { index: 2, left: "48%", top: "18%", size: 30, delay: "-5s", duration: "18s" },
  { index: 12, left: "4%", top: "84%", size: 36, delay: "-11s", duration: "20s" },
];

export function AvatarAtmosphere() {
  return (
    <div className="avatar-atmosphere pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
      {floaters.map((floater) => {
        const avatar = avatarAssets[floater.index];
        return (
          <img
            key={avatar.name}
            src={avatar.src}
            alt=""
            className="avatar-floater absolute rounded-full border-2 border-white/80 object-cover shadow-[0_10px_26px_rgba(67,54,130,0.14)]"
            style={{
              left: floater.left,
              top: floater.top,
              width: floater.size,
              height: floater.size,
              animationDelay: floater.delay,
              animationDuration: floater.duration,
            }}
          />
        );
      })}
    </div>
  );
}
