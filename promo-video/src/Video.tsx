import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { useVideoConfig } from "remotion";
import { OpeningScene } from "./scenes/OpeningScene";
import { TechScene } from "./scenes/TechScene";
import { FeaturesScene } from "./scenes/FeaturesScene";
import { RolesScene } from "./scenes/RolesScene";
import { OutroScene } from "./scenes/OutroScene";

export const TRANSITION_DURATION = 15;

export const StudentIntro: React.FC = () => {
  const { fps } = useVideoConfig();
  const t = { presentation: fade(), timing: linearTiming({ durationInFrames: TRANSITION_DURATION }) };

  return (
    <TransitionSeries>
      <TransitionSeries.Sequence
        name="Opening"
        durationInFrames={120}
        premountFor={fps}
        style={{
          translate: "20.7px 0px"
        }}
      >
        <OpeningScene />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition {...t} />
      <TransitionSeries.Sequence name="TechStack" durationInFrames={120} premountFor={fps}>
        <TechScene />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition {...t} />
      <TransitionSeries.Sequence name="Features" durationInFrames={165} premountFor={fps}>
        <FeaturesScene />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition {...t} />
      <TransitionSeries.Sequence name="Roles" durationInFrames={120} premountFor={fps}>
        <RolesScene />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition {...t} />
      <TransitionSeries.Sequence name="Outro" durationInFrames={105} premountFor={fps}>
        <OutroScene />
      </TransitionSeries.Sequence>
    </TransitionSeries>
  );
};
