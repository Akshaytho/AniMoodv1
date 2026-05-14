/**
 * Data for the homepage Emotional Universe force-graph.
 * Nodes: emotions (primary), characters' main psychological themes,
 *        and a small set of anchor anime titles.
 * Links: connections between an emotion and the titles/characters that embody it.
 *
 * Phase 3 will load this from the DB. For now, hand-curated from the seed data.
 */

export interface GraphNode {
  id: string;
  name: string;
  kind: 'emotion' | 'anime' | 'theme';
  slug: string;
  /** Hex color used for the node. Match the emotion palette in @animood/config. */
  color: string;
  /** Relative node radius — emotions are big anchors, titles smaller. */
  val: number;
}

export interface GraphLink {
  source: string;
  target: string;
  /** Visual strength (1 thin → 3 thick). */
  weight?: number;
}

const emotion = (id: string, name: string, color: string): GraphNode =>
  ({ id: `e:${id}`, name, kind: 'emotion', slug: id, color, val: 14 });
const anime = (id: string, name: string): GraphNode =>
  ({ id: `a:${id}`, name, kind: 'anime', slug: id, color: '#cfcfd8', val: 7 });
const theme = (id: string, name: string): GraphNode =>
  ({ id: `t:${id}`, name, kind: 'theme', slug: id, color: '#9b85ff', val: 9 });

export const GRAPH_NODES: GraphNode[] = [
  emotion('loneliness', 'Loneliness', '#5b8def'),
  emotion('healing', 'Healing', '#3ddc84'),
  emotion('redemption', 'Redemption', '#ffb547'),
  emotion('rebuilding', 'Rebuilding', '#62c7ff'),
  emotion('hope', 'Hope', '#5dd2ff'),
  emotion('existential-dread', 'Existential', '#9d6bff'),
  emotion('grief', 'Grief', '#8a7dff'),
  emotion('ambition', 'Ambition', '#f37dd6'),
  emotion('identity-crisis', 'Identity', '#b78dff'),
  emotion('moral-ambiguity', 'Moral Ambiguity', '#c9c9d4'),

  theme('self-discovery', 'Self-Discovery'),
  theme('friendship', 'Friendship'),
  theme('trauma', 'Trauma'),
  theme('purpose', 'Purpose'),

  anime('vinland-saga', 'Vinland Saga'),
  anime('a-silent-voice', 'A Silent Voice'),
  anime('march-comes-in-like-a-lion', 'March Comes In Like a Lion'),
  anime('welcome-to-the-nhk', 'Welcome to the NHK'),
  anime('mob-psycho-100', 'Mob Psycho 100'),
  anime('mushoku-tensei', 'Mushoku Tensei'),
];

export const GRAPH_LINKS: GraphLink[] = [
  // Loneliness anchors
  { source: 'e:loneliness', target: 'a:march-comes-in-like-a-lion', weight: 3 },
  { source: 'e:loneliness', target: 'a:welcome-to-the-nhk', weight: 3 },
  { source: 'e:loneliness', target: 'e:healing' },
  { source: 'e:loneliness', target: 'e:rebuilding' },
  { source: 'e:loneliness', target: 't:self-discovery' },

  // Healing
  { source: 'e:healing', target: 'a:march-comes-in-like-a-lion', weight: 2 },
  { source: 'e:healing', target: 'a:a-silent-voice', weight: 2 },
  { source: 'e:healing', target: 'a:mob-psycho-100' },
  { source: 'e:healing', target: 'e:hope' },

  // Redemption
  { source: 'e:redemption', target: 'a:vinland-saga', weight: 3 },
  { source: 'e:redemption', target: 'a:a-silent-voice', weight: 3 },
  { source: 'e:redemption', target: 'e:rebuilding', weight: 2 },

  // Rebuilding
  { source: 'e:rebuilding', target: 'a:vinland-saga', weight: 3 },
  { source: 'e:rebuilding', target: 'a:mushoku-tensei', weight: 2 },
  { source: 'e:rebuilding', target: 'a:march-comes-in-like-a-lion' },

  // Existential / NHK
  { source: 'e:existential-dread', target: 'a:welcome-to-the-nhk', weight: 3 },
  { source: 'e:existential-dread', target: 't:purpose' },
  { source: 'e:existential-dread', target: 'e:identity-crisis' },

  // Grief / themes
  { source: 'e:grief', target: 'a:a-silent-voice' },
  { source: 'e:grief', target: 't:trauma' },
  { source: 'e:grief', target: 'e:healing' },

  // Identity
  { source: 'e:identity-crisis', target: 'a:mob-psycho-100' },
  { source: 'e:identity-crisis', target: 't:self-discovery' },

  // Ambition
  { source: 'e:ambition', target: 'a:mushoku-tensei', weight: 2 },
  { source: 'e:ambition', target: 't:purpose' },

  // Hope
  { source: 'e:hope', target: 'a:mob-psycho-100' },
  { source: 'e:hope', target: 't:friendship' },

  // Moral ambiguity / Vinland Saga
  { source: 'e:moral-ambiguity', target: 'a:vinland-saga', weight: 2 },
  { source: 'e:moral-ambiguity', target: 'e:redemption' },

  // Themes link to titles
  { source: 't:self-discovery', target: 'a:march-comes-in-like-a-lion' },
  { source: 't:trauma', target: 'a:welcome-to-the-nhk' },
  { source: 't:friendship', target: 'a:mob-psycho-100' },
  { source: 't:purpose', target: 'a:mushoku-tensei' },
];
