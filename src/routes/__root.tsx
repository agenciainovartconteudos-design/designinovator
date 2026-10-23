import { Outlet, createRootRoute } from "@tanstack/react-router";
import "@/atlas/shared/styles.css";

export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  return <Outlet />;
}
