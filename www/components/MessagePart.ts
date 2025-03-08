export interface MessagePartProps {
  content: string;
  path?: string; // Added for file and diff types
  className?: string;
}
