import type { MetaFunction } from "@vercel/remix";
import { PokemonQuiz } from "~/components/pokemon-quiz";

export const meta: MetaFunction = () => {
  return [
    { title: "Pokémon Quiz" },
    { description: "My Page Description" },
  ];
}

export default function Index() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-8 text-center">Pokémon Quiz</h1>
      <PokemonQuiz />
    </div>
  );
}
