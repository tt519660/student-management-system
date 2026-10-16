import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { Background } from "../Background";
import { COLORS, FONT } from "../theme";

const ROLES = [
  {
    title: "教务管理员",
    account: "admin",
    items: ["全局数据管理", "组织 / 学籍 / 课程", "学期与选课窗口", "数据看板与报表"],
    color: COLORS.indigo,
  },
  {
    title: "教师",
    account: "T10001",
    items: ["开课与教学管理", "查看授课学生名单", "教师课表", "总览数据"],
    color: COLORS.cyan,
  },
  {
    title: "学生",
    account: "2024010101",
    items: ["在线选课", "个人课表", "个人档案", "总览数据"],
    color: COLORS.emerald,
  },
];

export const RolesScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleIn = spring({ frame, fps, delay: 2, config: { damping: 18 } });
  const noteIn = interpolate(frame, [70, 90], [0, 1], {
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
            fontSize: 96,
            fontWeight: 700,
            opacity: titleIn,
            transform: `translateY(${(1 - titleIn) * 40}px)`,
            marginBottom: 80,
          }}
        >
          三种角色 · 各司其职
        </div>
        <div style={{ display: "flex", gap: 48 }}>
          {ROLES.map((role, i) => {
            const enter = spring({
              frame,
              fps,
              delay: 18 + i * 12,
              config: { damping: 15 },
            });
            return (
              <div
                key={role.title}
                style={{
                  width: 500,
                  height: 560,
                  borderRadius: 28,
                  backgroundColor: COLORS.panel,
                  border: `2px solid ${COLORS.border}`,
                  padding: 56,
                  boxSizing: "border-box",
                  display: "flex",
                  flexDirection: "column",
                  opacity: enter,
                  transform: `translateY(${(1 - enter) * 100}px)`,
                }}
              >
                <div
                  style={{
                    fontSize: 60,
                    fontWeight: 700,
                    color: role.color,
                  }}
                >
                  {role.title}
                </div>
                <div
                  style={{
                    marginTop: 22,
                    alignSelf: "flex-start",
                    fontSize: 38,
                    padding: "10px 26px",
                    borderRadius: 999,
                    border: `2px solid ${role.color}`,
                    color: role.color,
                    backgroundColor: `${role.color}1A`,
                  }}
                >
                  {role.account}
                </div>
                <div style={{ marginTop: 44, display: "flex", flexDirection: "column", gap: 26 }}>
                  {role.items.map((item) => (
                    <div
                      key={item}
                      style={{
                        fontSize: 40,
                        color: COLORS.text,
                        display: "flex",
                        alignItems: "center",
                        gap: 20,
                      }}
                    >
                      <div
                        style={{
                          width: 14,
                          height: 14,
                          borderRadius: "50%",
                          backgroundColor: role.color,
                          flexShrink: 0,
                        }}
                      />
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
        <div
          style={{
            marginTop: 56,
            fontSize: 40,
            color: COLORS.dim,
            opacity: noteIn,
          }}
        >
          演示账号密码均为 123456 · 数据保存在浏览器本地
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
