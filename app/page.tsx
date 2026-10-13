import Magi from "./components/Magi.tsx";
import MagiChat from "./components/MagiChat.tsx"

export default function Home() {
  return (
    <main className="p-4">
      <Magi />
      <MagiChat />
    </main>
  );
}
