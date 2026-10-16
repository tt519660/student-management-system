import { AbsoluteFill, useCurrentFrame } from "remotion";
import { COLORS } from "./theme";

export const Background: React.FC = () => {
  const frame = useCurrentFrame();
  const drift1 = Math.sin(frame / 70) * 40;
  const drift2 = Math.cos(frame / 90) * 50;

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bg }}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(900px 700px at ${22 + drift1 / 40}% ${18 + drift2 / 50}%, rgba(99,102,241,0.28), transparent 70%)`,
        }}
      />
      <AbsoluteFill
        style={{
          background: `radial-gradient(1000px 800px at ${80 - drift2 / 40}% ${82 + drift1 / 50}%, rgba(34,211,238,0.18), transparent 70%)`,
        }}
      />
      <AbsoluteFill
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px)",
          backgroundSize: "90px 90px",
        }}
      />
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.45) 100%)",
        }}
      />
    </AbsoluteFill>
  );
};
