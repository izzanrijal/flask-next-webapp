export interface Question {
  id?: number;
  subtopic_list_id?: number;
  subtopic_list?: string;
  scenario: string;
  image_url?: string;
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  option_e: string;
  correct_answer: string;
  discussion: string;
  learning_objective: string;
  already_updated?: boolean;
  is_accepted: boolean;
}

export interface GeneratedQuestion {
  scenario: string;
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  option_e: string;
  correct_answer: string;
  discussion: string;
  learning_objective: string;
  is_accepted: boolean;
}

export interface System {
  id: number;
  topic: string;
}