import { useEffect, useId, useState } from "react";
import { Link } from "react-router";
import styles from "./Architecture.module.css";

const DIAGRAMS = [
  {
    title: "Getting into ClickRush",
    description:
      "Sign-in unlocks Play, Stats, and the leaderboard. Sign-out only clears this device.",
    label: "Sign-in sequence",
    definition: `sequenceDiagram
  participant You
  participant App as ClickRush
  participant API as API

  You->>App: Sign up, sign in, or Google
  App->>API: Verify you
  API-->>App: Profile and access token
  App->>App: Remember you on this device
  App->>You: Home, Play, Leaderboard, Stats
  Note over App: Sign out clears the local session`,
  },
  {
    title: "A classic round",
    description:
      "What you see on Play: a 3 second countdown, 60 seconds of clicking, then an automatic save.",
    label: "Classic round lifecycle",
    definition: `stateDiagram-v2
  [*] --> Idle: Open Play
  Idle --> Countdown: Press Start
  Countdown --> Running: After 3 seconds
  Running --> Finished: After 60 seconds
  Finished --> Countdown: Press Again
  note right of Running
    Click, tap, Space, or Enter
  end note
  note right of Finished
    Score saves in the background
    New hi-score celebrates
  end note`,
  },
  {
    title: "Where your score goes",
    description:
      "One finished round updates your stats and can move you on the public board.",
    label: "Score destinations flowchart",
    definition: `flowchart LR
  A[Play a 60s classic round] --> B[Score saved to your account]
  B --> C[Your stats]
  B --> D[Leaderboard]
  C --> E[Personal best, average, last 20 rounds]
  D --> F[Your best score this UTC period]`,
  },
  {
    title: "How the leaderboard ranks you",
    description:
      "Daily, weekly, and monthly boards use the UTC calendar. Only your best score in that window counts.",
    label: "Leaderboard ranking flowchart",
    definition: `flowchart TD
  R[A finished round] --> P[Counts in the period when it ended]
  P --> D[Daily: midnight to midnight UTC]
  P --> W[Weekly: Monday 00:00 UTC]
  P --> M[Monthly: 1st of the month UTC]
  D --> B[Your best score in that period]
  W --> B
  M --> B
  B --> Rank[Highest clicks first]
  Rank --> Tie[Tied scores: earlier finish ranks higher]
  Tie --> Top[Top 10 on the board]`,
  },
  {
    title: "Round persistence sequence",
    description: "How Start waits for a signed session, then Finish saves behind the result screen.",
    label: "Round persistence sequence diagram",
    definition: `sequenceDiagram
  participant User
  participant GameTarget
  participant Play
  participant StartMut as startMutation
  participant Hook as useClassicGame
  participant FinishMut as finishMutation
  participant API as POST /games

  User->>GameTarget: Press Start
  GameTarget->>Play: onStart()
  Play->>StartMut: mutateAsync({ mode: "classic" })
  StartMut->>API: POST /games
  API-->>StartMut: { gameSessionToken, durationMs, ... }
  StartMut-->>Play: session
  Play->>Hook: beginRound(session)
  Hook->>Hook: phase = countdown
  Note over Hook: 3-2-1 using COUNTDOWN_DURATION_MS
  Hook->>Hook: phase = running (deadline = now + durationMs)
  Hook->>Hook: phase = finished (local score)
  Play->>FinishMut: mutate({ gameSessionToken, score })
  Note over Play: Results already on screen
  FinishMut->>API: POST /games/finish
  API-->>FinishMut: { game }
  FinishMut-->>Play: update PB, enable replay`,
  },
  {
    title: "Games API dependency graph",
    description:
      "Server request layers, per-user rate limits, and idempotent finish handling if the same round is saved twice.",
    label: "Games API dependency graph",
    definition: `flowchart TD
  A[POST /api/v1/games] --> B[authenticate]
  B --> C[startGameRateLimit 30 per user per hour]
  C --> D[validateBody startGameSchema]
  D --> E[games.controller.startGame]
  E --> F[games.service.startGame]
  F --> G[gameSessionToken.sign]
  F --> H[constants/game.js]

  I[POST /api/v1/games/finish] --> J[authenticate]
  J --> K[finishGameRateLimit 30 per user per hour]
  K --> L[validateBody finishGameSchema]
  L --> M[games.controller.finishGame]
  M --> N[games.service.finishGame]
  N --> O[gameSessionToken.verify]
  N --> P[elapsed + score checks]
  N --> Q[game.repository.insert]
  Q -->|23505 games_pkey| R[game.repository.findById]
  R --> S[return stored score]
  Q -->|success| T[return new game]`,
  },
] as const;

export default function Architecture() {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <Link to="/home" className={styles.brand}>
          ClickRush
        </Link>
        <Link to="/home" className={styles.backLink}>
          Back to app
        </Link>
      </header>

      <main className={styles.main}>
        <section className={styles.hero}>
          <span className={styles.eyebrow}>System reference</span>
          <h1>How ClickRush works</h1>
          <p>
            How a classic round works, where scores go, and how the games API
            saves them.
          </p>
        </section>

        {DIAGRAMS.map((diagram) => (
          <section key={diagram.title} className={styles.diagramSection}>
            <div className={styles.sectionHeading}>
              <div>
                <h2>{diagram.title}</h2>
                <p>{diagram.description}</p>
              </div>
            </div>
            <MermaidDiagram
              definition={diagram.definition}
              label={diagram.label}
            />
          </section>
        ))}
      </main>
    </div>
  );
}

type MermaidDiagramProps = {
  definition: string;
  label: string;
};

function MermaidDiagram({ definition, label }: MermaidDiagramProps) {
  const reactId = useId();
  const [svg, setSvg] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let isCancelled = false;

    async function renderDiagram() {
      try {
        const { default: mermaid } = await import("mermaid");

        if (isCancelled) {
          return;
        }

        mermaid.initialize({
          startOnLoad: false,
          securityLevel: "strict",
          theme: "neutral",
          sequence: {
            useMaxWidth: false,
          },
          flowchart: {
            useMaxWidth: false,
          },
          state: {
            useMaxWidth: false,
          },
        });

        const diagramId = [
          "architecture",
          reactId.replace(/[^a-zA-Z0-9]/g, ""),
          crypto.randomUUID(),
        ].join("-");
        const result = await mermaid.render(diagramId, definition);

        if (!isCancelled) {
          setSvg(result.svg);
          setError("");
        }
      } catch {
        if (!isCancelled) {
          setError("Unable to render this diagram.");
        }
      }
    }

    renderDiagram();

    return () => {
      isCancelled = true;
    };
  }, [definition, reactId]);

  if (error) {
    return (
      <p className={styles.error} role="alert">
        {error}
      </p>
    );
  }

  if (!svg) {
    return (
      <p className={styles.loading} role="status">
        Rendering diagram…
      </p>
    );
  }

  return (
    <div
      className={styles.diagram}
      role="img"
      aria-label={label}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
