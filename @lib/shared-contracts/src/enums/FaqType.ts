export interface FAQ {
  order: number;
  question: string;
  answer: string;
  links?: Link[];
}

export interface Link {
  key: string;
  href: string;
  text: string;
}
