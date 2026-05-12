import { AuthFloatingStatus } from "../auth/AuthFloatingStatus";
import { ThemeFloatingToggle } from "./ThemeFloatingToggle";

export function FloatingTopRightBar() {
  return (
    <div className="pointer-events-none fixed right-4 top-4 z-[1050] max-w-[calc(100vw-2rem)]">
      <div className="pointer-events-auto flex items-center gap-2">
        <AuthFloatingStatus />
        <ThemeFloatingToggle />
      </div>
    </div>
  );
}

