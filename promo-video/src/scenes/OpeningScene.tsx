import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { Background } from "../Background";
import { COLORS, FONT } from "../theme";

export const OpeningScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleIn = spring({ frame, fps, delay: 8, config: { damping: 16 } });
  const lineOut = interpolate(frame, [28, 55], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const subtitleIn = spring({ frame, fps, delay: 30, config: { damping: 18 } });
  const taglineIn = interpolate(frame, [50, 75], [0, 1], {
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
            fontSize: 200,
            fontWeight: 700,
            letterSpacing: 30,
            opacity: titleIn,
            transform: `translateY(${(1 - titleIn) * 70}px) scale(${0.9 + titleIn * 0.1})`,
            background: `linear-gradient(100deg, ${COLORS.cyan}, ${COLORS.indigo})`,
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            color: "transparent",
          }}
        >
          学苑
        </div>
        <div
          style={{
            width: 560 * lineOut,
            height: 6,
            marginTop: 28,
            marginBottom: 36,
            borderRadius: 3,
            background: `linear-gradient(90deg, ${COLORS.cyan}, ${COLORS.indigo})`,
          }}
        />
        <div
          style={{
            fontSize: 84,
            fontWeight: 700,
            opacity: subtitleIn,
            transform: `translateY(${(1 - subtitleIn) * 40}px)`,
          }}
        >
          高校学生管理系统
        </div>
        <div
          style={{
            marginTop: 40,
            fontSize: 48,
            color: COLORS.dim,
            opacity: taglineIn,
            letterSpacing: 6,
          }}
        >
          学籍 · 组织 · 课程 · 选课 · 课表 · 报表
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
