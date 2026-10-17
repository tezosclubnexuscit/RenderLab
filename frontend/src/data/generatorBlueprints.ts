import { Difficulty, ChallengeMode } from '../types';
import blueprintsData from './blueprints_311.json';

export interface GeneratorBlueprint {
  id: string;
  heading: string;
  description: string;
  howToResolve: string;
  defaultDifficulty: Difficulty;
  defaultMode: ChallengeMode;
  topics: string[];
  learningObjective: string;
}

export const MODE_EXPLANATIONS: Record<
  ChallengeMode,
  { label: string; badge: string; description: string }
> = {
  fill_blanks: {
    label: 'Fill in the Blanks',
    badge: 'Guided Practice',
    description:
      'Provides a structured template where key tags, properties, or functions are omitted and marked with <!-- TODO --> comments for you to complete.',
  },
  build_component: {
    label: 'Build Component',
    badge: 'From Scratch',
    description:
      'Provides barebones scaffolding and sample data. You architect and construct the entire requested component from scratch.',
  },
  fix_broken: {
    label: 'Fix Broken Code',
    badge: 'Bug Diagnostic',
    description:
      'Provides complete-looking code that contains 1–2 subtle accessibility, layout, or logic bugs. You diagnose why checks fail and correct the defects.',
  },
  recreate_page: {
    label: 'Recreate Design',
    badge: 'Visual Matching',
    description:
      'Study the Expected Target Output preview and recreate the exact design, spacing, colors, and responsiveness pixel-for-pixel.',
  },
};

export const GENERATOR_BLUEPRINTS: Record<'html' | 'css' | 'javascript', GeneratorBlueprint[]> =
  blueprintsData as Record<'html' | 'css' | 'javascript', GeneratorBlueprint[]>;
