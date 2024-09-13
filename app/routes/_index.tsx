import type { MetaFunction } from "@vercel/remix";
// import { PokemonQuiz } from "~/components/pokemon-quiz";

export const meta: MetaFunction = () => {
  return [
    { title: "Pokémon Quiz" },
    { description: "My Page Description" },
  ];
}

export default function Index() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold underline">
        Hello world!
      </h1>
      <h1 className="text-3xl font-bold mb-8 text-center">Pokémon Quiz</h1>
      <ul>
        <li>
          <a
            target="_blank"
            href="https://remix.run/tutorials/blog"
            rel="noreferrer"
          >
            15m Quickstart Blog Tutorial
          </a>
        </li>
        <li>
          <a
            target="_blank"
            href="https://remix.run/tutorials/jokes"
            rel="noreferrer"
          >
            Deep Dive Jokes App Tutorial
          </a>
        </li>
        <li>
          <a target="_blank" href="https://remix.run/docs" rel="noreferrer">
            Remix Docs
          </a>
        </li>
      </ul>
    </div>
  );
}
