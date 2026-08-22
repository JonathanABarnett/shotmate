import { useState, type ReactNode } from "react";
import type { InstallPrompt } from "../../hooks/useInstallPrompt";
import InstallBanner from "../../components/InstallBanner";
import SignInForm from "../../components/SignInForm";
import type { SyncState } from "../../sync/useSync";
import { useStore } from "../../store/StoreProvider";
import { draftToResult, emptyDraft, type OnboardingDraft } from "./draft";
import { BodyStep, MedStep, ReadyStep, WelcomeStep, type StepProps } from "./steps";

const STEPS: ((props: StepProps) => ReactNode)[] = [WelcomeStep, MedStep, BodyStep, ReadyStep];

interface Props {
  installPrompt: InstallPrompt;
  sync: SyncState;
}

export default function OnboardingView({ installPrompt, sync }: Props) {
  const { dispatch } = useStore();
  const [step, setStep] = useState(0);
  const [signingIn, setSigningIn] = useState(false);
  const [draft, setDraft] = useState<OnboardingDraft>(emptyDraft);

  const patch = (p: Partial<OnboardingDraft>) => setDraft((d) => ({ ...d, ...p }));
  const isLast = step === STEPS.length - 1;
  const StepBody = STEPS[step];

  const finish = () => {
    const { settings, firstWeight } = draftToResult(draft);
    dispatch({ type: "completeOnboarding", settings, firstWeight });
  };

  if (signingIn) {
    return (
      <div className="onb">
        <div className="onb-body">
          <h1 className="onb-title">Welcome back</h1>
          <p className="onb-sub">Sign in and this device picks up your history from your other one — nothing to re-enter.</p>
          <div className="card">
            <SignInForm onSend={sync.signIn} />
          </div>
        </div>
        <div className="onb-footer">
          <button className="btn btn-plain btn-block btn-sm" onClick={() => setSigningIn(false)}>
            Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="onb">
      <div className="onb-dots">
        {STEPS.map((_, i) => (
          <span key={i} className={`onb-dot${i === step ? " active" : ""}`} />
        ))}
      </div>
      <div className="onb-body" key={step}>
        <StepBody draft={draft} patch={patch} />
      </div>
      <div className="onb-footer">
        <InstallBanner prompt={installPrompt} compact />
        <button className="btn btn-primary btn-block" onClick={() => (isLast ? finish() : setStep(step + 1))}>
          {isLast ? "Start tracking 🎉" : "Continue"}
        </button>
        {step > 0 ? (
          <button className="btn btn-plain btn-block btn-sm" onClick={() => setStep(step - 1)}>
            Back
          </button>
        ) : (
          <>
            {sync.status !== "unconfigured" && (
              <button className="btn btn-subtle btn-block btn-sm" onClick={() => setSigningIn(true)}>
                Already using ShotMate? Sign in to sync
              </button>
            )}
            <button className="btn btn-plain btn-block btn-sm" onClick={() => dispatch({ type: "loadSample" })}>
              Just exploring? Try sample data ✨
            </button>
          </>
        )}
      </div>
    </div>
  );
}
