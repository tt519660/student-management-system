import { AbsoluteFill, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { Background } from "../Background";
import { COLORS, FONT } from "../theme";

const STACK = [
  { badge: "R", name: "React 19", desc: "组件化界面", color: COLORS.cyan },
  { badge: "TS", name: "TypeScript 6", desc: "全程类型安全", color: COLORS.indigo },
  { badge: "V", name: "Vite 8", desc: "极速开发构建", color: COLORS.violet },
  { badge: "TW", name: "Tailwind CSS 4", desc: "原子化样式", color: COLORS.emerald },
];

export const TechScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleIn = spring({ frame, fps, delay: 2, config: { damping: 18 } });

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
            fontSize: 96,
            fontWeight: 700,
            opacity: titleIn,
            transform: `translateY(${(1 - titleIn) * 40}px)`,
            marginBottom: 90,
          }}
        >
          现代化技术栈
        </div>
        <div style={{ display: "flex", gap: 44 }}>
          {STACK.map((item, i) => {
            const enter = spring({
              frame,
              fps,
              delay: 18 + i * 10,
              config: { damping: 15 },
            });
            return (
              <div
                key={item.name}
                style={{
                  width: 380,
                  height: 420,
                  borderRadius: 28,
                  backgroundColor: COLORS.panel,
                  border: `2px solid ${COLORS.border}`,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 34,
                  opacity: enter,
                  transform: `translateY(${(1 - enter) * 90}px)`,
                }}
              >
                <div
                  style={{
                    width: 130,
                    height: 130,
                    borderRadius: "50%",
                    border: `4px solid ${item.color}`,
                    color: item.color,
                    fontSize: item.badge.length > 1 ? 52 : 64,
                    fontWeight: 700,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {item.badge}
                </div>
                <div style={{ fontSize: 52, fontWeight: 700 }}>{item.name}</div>
                <div style={{ fontSize: 40, color: COLORS.dim }}>{item.desc}</div>
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
