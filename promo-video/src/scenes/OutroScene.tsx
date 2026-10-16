import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { Background } from "../Background";
import { COLORS, FONT } from "../theme";

const LINES = [
  { text: "$ npm install", color: COLORS.text, at: 30 },
  { text: "$ npm run dev", color: COLORS.text, at: 45 },
  { text: "➜  Local: http://localhost:5173", color: COLORS.emerald, at: 60 },
];

export const OutroScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleIn = spring({ frame, fps, delay: 2, config: { damping: 15 } });
  const subIn = interpolate(frame, [14, 32], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const licenseIn = interpolate(frame, [75, 92], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill>
      <Background />
      <AbsoluteFill
        style={{
          justifyContent: "center",
          alignItems: "center",
          fontFamily: FONT,
          color: COLORS.text,
        }}
      >
        <div
          style={{
            fontSize: 150,
            fontWeight: 700,
            opacity: titleIn,
            transform: `translateY(${(1 - titleIn) * 60}px)`,
            background: `linear-gradient(100deg, ${COLORS.cyan}, ${COLORS.indigo})`,
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            color: "transparent",
          }}
        >
          开箱即用
        </div>
        <div
          style={{
            marginTop: 30,
            fontSize: 50,
            color: COLORS.dim,
            opacity: subIn,
          }}
        >
          零后端 · localStorage 持久化 · 一键初始化演示数据
        </div>
        <div
          style={{
            marginTop: 70,
            width: 900,
            borderRadius: 20,
            backgroundColor: "rgba(0,0,0,0.55)",
            border: `2px solid ${COLORS.border}`,
            overflow: "hidden",
            opacity: subIn,
          }}
        >
          <div
            style={{
              display: "flex",
              gap: 14,
              padding: "22px 30px",
              borderBottom: `2px solid ${COLORS.border}`,
            }}
          >
            <div style={{ width: 22, height: 22, borderRadius: "50%", backgroundColor: COLORS.rose }} />
            <div style={{ width: 22, height: 22, borderRadius: "50%", backgroundColor: COLORS.amber }} />
            <div style={{ width: 22, height: 22, borderRadius: "50%", backgroundColor: COLORS.emerald }} />
          </div>
          <div style={{ padding: "34px 44px", display: "flex", flexDirection: "column", gap: 24 }}>
            {LINES.map((line) => (
              <div
                key={line.text}
                style={{
                  fontSize: 42,
                  color: line.color,
                  fontFamily: '"Cascadia Code", "Consolas", monospace',
                  opacity: interpolate(frame, [line.at, line.at + 10], [0, 1], {
                    extrapolateLeft: "clamp",
                    extrapolateRight: "clamp",
                  }),
                }}
              >
                {line.text}
              </div>
            ))}
          </div>
        </div>
        <div
          style={{
            marginTop: 56,
            fontSize: 40,
            color: COLORS.dim,
            letterSpacing: 3,
            opacity: licenseIn,
          }}
        >
          MIT License 开源 · React 19 + TypeScript + Vite
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
