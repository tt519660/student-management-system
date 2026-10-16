import { Composition, Folder } from "remotion";
import { OpeningScene } from "./scenes/OpeningScene";
import { TechScene } from "./scenes/TechScene";
import { FeaturesScene } from "./scenes/FeaturesScene";
import { RolesScene } from "./scenes/RolesScene";
import { OutroScene } from "./scenes/OutroScene";
import { StudentIntro, TRANSITION_DURATION } from "./Video";

const SCENES = [
  { id: "Opening", component: OpeningScene, durationInFrames: 120 },
  { id: "TechStack", component: TechScene, durationInFrames: 120 },
  { id: "Features", component: FeaturesScene, durationInFrames: 165 },
  { id: "Roles", component: RolesScene, durationInFrames: 120 },
  { id: "Outro", component: OutroScene, durationInFrames: 105 },
] as const;

const TOTAL_DURATION =
  SCENES.reduce((sum, s) => sum + s.durationInFrames, 0) -
  (SCENES.length - 1) * TRANSITION_DURATION;

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Folder name="Scenes">
        {SCENES.map((scene) => (
          <Composition
            key={scene.id}
            id={scene.id}
            component={scene.component}
            durationInFrames={scene.durationInFrames}
            fps={30}
            width={1920}
            height={1080}
          />
        ))}
      </Folder>
      <Composition
        id="StudentIntro"
        component={StudentIntro}
        durationInFrames={TOTAL_DURATION}
        fps={30}
        width={1920}
        height={1080}
      />
    </>
  );
};
