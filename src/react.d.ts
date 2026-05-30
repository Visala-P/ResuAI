declare module 'react' {
  export type SetStateAction<S> = S | ((prevState: S) => S);
  export type Dispatch<A> = (value: A) => void;

  export interface SyntheticEvent<T = any> {
    target: T;
    currentTarget: T;
  }

  export interface ChangeEvent<T = any> extends SyntheticEvent<T> {
    target: T & {
      value: string;
      checked: boolean;
    };
  }

  export interface MutableRefObject<T> {
    current: T;
  }

  export interface HTMLAttributes<T> {
    className?: string;
    id?: string;
    title?: string;
    style?: any;
    children?: any;
    onClick?: (event: SyntheticEvent<T>) => void;
    onChange?: (event: ChangeEvent<T>) => void;
  }

  export interface InputHTMLAttributes<T> extends HTMLAttributes<T> {
    type?: string;
    value?: any;
    checked?: boolean;
    placeholder?: string;
    disabled?: boolean;
    rows?: number;
    htmlFor?: string;
  }

  export interface TextareaHTMLAttributes<T> extends HTMLAttributes<T> {
    value?: any;
    placeholder?: string;
    rows?: number;
    disabled?: boolean;
  }

  export interface ButtonHTMLAttributes<T> extends HTMLAttributes<T> {
    type?: 'button' | 'submit' | 'reset';
    disabled?: boolean;
  }

  export function useState<S>(initialState: S | (() => S)): [S, Dispatch<SetStateAction<S>>];
  export function useRef<T>(initialValue: T | null): MutableRefObject<T | null>;

  const React: {
    useState: typeof useState;
    useRef: typeof useRef;
  };

  export default React;
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      a: import('react').HTMLAttributes<any> & { href?: string; target?: string; rel?: string; download?: any };
      button: import('react').ButtonHTMLAttributes<HTMLButtonElement>;
      div: import('react').HTMLAttributes<HTMLDivElement>;
      span: import('react').HTMLAttributes<HTMLSpanElement>;
      label: import('react').HTMLAttributes<HTMLLabelElement> & { htmlFor?: string };
      input: import('react').InputHTMLAttributes<HTMLInputElement>;
      textarea: import('react').TextareaHTMLAttributes<HTMLTextAreaElement>;
      h1: import('react').HTMLAttributes<HTMLHeadingElement>;
      h2: import('react').HTMLAttributes<HTMLHeadingElement>;
      h3: import('react').HTMLAttributes<HTMLHeadingElement>;
      p: import('react').HTMLAttributes<HTMLParagraphElement>;
      ul: import('react').HTMLAttributes<HTMLUListElement>;
      li: import('react').HTMLAttributes<HTMLLIElement>;
      table: import('react').HTMLAttributes<HTMLTableElement>;
      tbody: import('react').HTMLAttributes<HTMLTableSectionElement>;
      tr: import('react').HTMLAttributes<HTMLTableRowElement>;
      td: import('react').HTMLAttributes<HTMLTableCellElement>;
      fragment: { children?: any };
    }
  }
}
