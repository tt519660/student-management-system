import { AbsoluteFill, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { Background } from "../Background";
import { COLORS, FONT } from "../theme";

const FEATURES = [
  { char: "学", title: "学籍管理", desc: "学生信息全生命周期", color: COLORS.cyan },
  { char: "组", title: "组织架构", desc: "院系 · 专业 · 管理", color: COLORS.violet },
  { char: "课", title: "开课管理", desc: "学期 · 课程 · 授课安排", color: COLORS.indigo },
  { char: "选", title: "在线选课", desc: "选课窗口 · 人数校验", color: COLORS.emerald },
  { char: "表", title: "课表中心", desc: "教师 / 学生课表", color: COLORS.amber },
  { char: "报", title: "数据报表", desc: "数据看板 · 统计分析", color: COLORS.rose },
];

export const FeaturesScene: React.FC = () => {
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
            marginBottom: 80,
          }}
        >
          核心功能一览
        </div>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            width: 1680,
            gap: 40,
            justifyContent: "center",
          }}
        >
          {FEATURES.map((item, i) => {
            const enter = spring({
              frame,
              fps,
              delay: 18 + i * 8,
              config: { damping: 14 },
            });
            return (
              <div
                key={item.title}
                style={{
                  width: 520,
                  height: 230,
                  borderRadius: 24,
                  backgroundColor: COLORS.panel,
                  border: `2px solid ${COLORS.border}`,
                  display: "flex",
                  alignItems: "center",
                  gap: 36,
                  padding: "0 44px",
                  boxSizing: "border-box",
                  opacity: enter,
                  transform: `translateY(${(1 - enter) * 70}px)`,
                }}
              >
                <div
                  style={{
                    width: 104,
                    height: 104,
                    flexShrink: 0,
                    borderRadius: 22,
                    backgroundColor: `${item.color}26`,
                    border: `3px solid ${item.color}`,
                    color: item.color,
                    fontSize: 52,
                    fontWeight: 700,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {item.char}
                </div>
                <div>
                  <div style={{ fontSize: 54, fontWeight: 700 }}>{item.title}</div>
                  <div style={{ fontSize: 38, color: COLORS.dim, marginTop: 12 }}>
                    {item.desc}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
