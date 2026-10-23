import { createFileRoute } from "@tanstack/react-router";
import { Laboratory } from "@/components/lab/laboratory";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  return <Laboratory />;
}
