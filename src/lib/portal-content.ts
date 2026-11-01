import { queryOptions } from "@tanstack/react-query";
import heroImage from "@/assets/portal-hero-mousetrap-car.jpg";
import springImage from "@/assets/portal-news-spring.jpg";
import trackImage from "@/assets/portal-news-track.jpg";
import workshopImage from "@/assets/portal-news-workshop.jpg";
import { buildStandings, type Race } from "./portal-rules";

/**
 * Content for the public portal. Every payload says where it came from:
 * "demo" content is only for previewing the layout and is labelled as such
 * on screen. To go live, replace a queryFn with the real API call and return
 * `source: "official"` — the pages need no other change.
 */
export type ContentSource = "demo" | "official";
export type Sourced<T> = { source: ContentSource; items: T };

export type EventInfo = {
  name: string;
  edition: string;
  /** ISO date-time; null until the organisers announce it. */
  startsAt: string | null;
  endsAt: string | null;
  location: string | null;
};

export type ScheduleItem = { time: string | null; title: string; description: string; stage?: string };

export type EmblemTone = "brand" | "ink" | "steel";

export type Team = {
  slug: string;
  name: string;
  abbreviation: string;
  tone: EmblemTone;
  /** Absolute URL of the team logo, when the team has one. */
  logoUrl: string | null;
  captain: string;
  members: string[];
  course: string;
};

export type NewsCategory = "Comunicado oficial" | "Novidade" | "Aviso" | "Atualização";

export type NewsItem = {
  id: string;
  title: string;
  summary: string;
  category: NewsCategory;
  publishedAt: string;
  image: string;
};

// Only facts already confirmed in the project: name and 2026 edition.
const EVENT: EventInfo = {
  name: "MouseTrap Car Race",
  edition: "Edição 2026",
  startsAt: null,
  endsAt: null,
  location: null,
};

const DEMO_SCHEDULE: ScheduleItem[] = [
  { time: null, title: "Credenciamento das equipes", description: "Check-in do capitão e dos integrantes." },
  { time: null, title: "Inspeção técnica", description: "Conferência das regras de construção dos carrinhos." },
  { time: null, title: "Prova de distância", description: "Quem vai mais longe com uma única ratoeira.", stage: "Classificatória" },
  { time: null, title: "Prova de velocidade", description: "Menor tempo no trecho cronometrado.", stage: "Classificatória" },
  { time: null, title: "Final", description: "As melhores equipes disputam o título.", stage: "Final" },
  { time: null, title: "Premiação", description: "Entrega dos troféus e encerramento." },
];

const DEMO_TEAMS: Team[] = [
  { slug: "mola-veloz", name: "Mola Veloz", abbreviation: "MV", tone: "brand", logoUrl: null, captain: "Ana Souza", members: ["Ana Souza", "Bruno Lima", "Carla Dias", "Diego Rocha"], course: "Engenharia Mecânica" },
  { slug: "torcao-racing", name: "Torção Racing", abbreviation: "TR", tone: "ink", logoUrl: null, captain: "Eduardo Pires", members: ["Eduardo Pires", "Fernanda Melo", "Gustavo Reis"], course: "Engenharia de Produção" },
  { slug: "alavanca-gp", name: "Alavanca GP", abbreviation: "AG", tone: "steel", logoUrl: null, captain: "Helena Costa", members: ["Helena Costa", "Igor Nunes", "Júlia Ramos", "Lucas Faria", "Marina Alves"], course: "Engenharia Civil" },
  { slug: "inercia-zero", name: "Inércia Zero", abbreviation: "IZ", tone: "brand", logoUrl: null, captain: "Nicolas Prado", members: ["Nicolas Prado", "Olívia Santos", "Pedro Barros"], course: "Engenharia Elétrica" },
  { slug: "atrito-minimo", name: "Atrito Mínimo", abbreviation: "AM", tone: "ink", logoUrl: null, captain: "Rafaela Moura", members: ["Rafaela Moura", "Samuel Teixeira", "Tainá Lopes", "Vitor Gomes"], course: "Engenharia Mecânica" },
  { slug: "eixo-livre", name: "Eixo Livre", abbreviation: "EL", tone: "steel", logoUrl: null, captain: "Yasmin Freitas", members: ["Yasmin Freitas", "Arthur Cunha"], course: "Arquitetura e Urbanismo" },
];

const DEMO_RACES: Race[] = [
  {
    id: "prova-1",
    name: "Prova 1",
    category: "Distância",
    status: "realizada",
    results: [
      { teamSlug: "alavanca-gp", position: 1, points: 10, mark: "14,6 m" },
      { teamSlug: "mola-veloz", position: 2, points: 8, mark: "13,9 m" },
      { teamSlug: "torcao-racing", position: 3, points: 6, mark: "12,7 m" },
      { teamSlug: "atrito-minimo", position: 4, points: 5, mark: "11,2 m" },
      { teamSlug: "inercia-zero", position: 5, points: 4, mark: "10,8 m" },
      { teamSlug: "eixo-livre", position: 6, points: 3, mark: "8,5 m" },
    ],
  },
  {
    id: "prova-2",
    name: "Prova 2",
    category: "Velocidade (5 m)",
    status: "realizada",
    results: [
      { teamSlug: "mola-veloz", position: 1, points: 10, mark: "3,94 s" },
      { teamSlug: "inercia-zero", position: 2, points: 8, mark: "4,21 s" },
      { teamSlug: "alavanca-gp", position: 3, points: 6, mark: "4,37 s" },
      { teamSlug: "torcao-racing", position: 4, points: 5, mark: "4,58 s" },
      { teamSlug: "eixo-livre", position: 5, points: 4, mark: "5,02 s" },
      { teamSlug: "atrito-minimo", position: 6, points: 3, mark: "5,40 s" },
    ],
  },
  { id: "final", name: "Final", category: "Distância + velocidade", status: "prevista", results: [] },
];

const DEMO_NEWS: NewsItem[] = [
  {
    id: "formacao-de-equipes",
    title: "Capitães já podem montar suas equipes na plataforma",
    summary: "Depois da aprovação, o capitão cria a equipe em Minha Equipe e adiciona até quatro integrantes.",
    category: "Comunicado oficial",
    publishedAt: "2026-10-30",
    image: workshopImage,
  },
  {
    id: "mola-de-torcao",
    title: "Como a mola da ratoeira vira movimento",
    summary: "A energia elástica guardada na mola puxa a linha enrolada no eixo e faz as rodas girarem.",
    category: "Novidade",
    publishedAt: "2026-10-27",
    image: springImage,
  },
  {
    id: "medicoes",
    title: "Tempo e distância: como as provas são medidas",
    summary: "Fita métrica para a prova de distância e cronômetro no trecho de velocidade.",
    category: "Aviso",
    publishedAt: "2026-10-22",
    image: trackImage,
  },
  {
    id: "classificacao",
    title: "Classificação atualizada a cada prova",
    summary: "Os pontos de cada etapa somam na tabela geral, que aparece aqui logo após a divulgação.",
    category: "Atualização",
    publishedAt: "2026-10-18",
    image: heroImage,
  },
];

const forever = { staleTime: Infinity } as const;

export const portalQueries = {
  event: () =>
    queryOptions({ queryKey: ["portal", "event"], queryFn: async () => EVENT, ...forever }),
  schedule: () =>
    queryOptions({
      queryKey: ["portal", "schedule"],
      queryFn: async (): Promise<Sourced<ScheduleItem[]>> => ({ source: "demo", items: DEMO_SCHEDULE }),
      ...forever,
    }),
  teams: () =>
    queryOptions({
      queryKey: ["portal", "teams"],
      queryFn: async (): Promise<Sourced<Team[]>> => ({ source: "demo", items: DEMO_TEAMS }),
      ...forever,
    }),
  races: () =>
    queryOptions({
      queryKey: ["portal", "races"],
      queryFn: async (): Promise<Sourced<Race[]>> => ({ source: "demo", items: DEMO_RACES }),
      ...forever,
    }),
  news: () =>
    queryOptions({
      queryKey: ["portal", "news"],
      queryFn: async (): Promise<Sourced<NewsItem[]>> => ({ source: "demo", items: DEMO_NEWS }),
      ...forever,
    }),
};

/** Standings are always derived from race results, never stored separately. */
export function standingsFrom(teams: Sourced<Team[]>, races: Sourced<Race[]>) {
  return {
    source: teams.source === "official" && races.source === "official" ? "official" : "demo",
    items: buildStandings(
      teams.items.map((t) => t.slug),
      races.items,
    ),
  } satisfies Sourced<ReturnType<typeof buildStandings>>;
}

export function formatPublishedAt(iso: string) {
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short", year: "numeric", timeZone: "UTC" }).format(
    new Date(`${iso}T12:00:00Z`),
  );
}
