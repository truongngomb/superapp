import { StandardLayout, StandardLayoutProps } from './StandardLayout';
import { ModernLayout, ModernLayoutProps } from './ModernLayout';

export type AppLayoutMode = 'standard' | 'modern';

// Union of props, with layoutMode discriminator
export type AppLayoutProps = 
  | ({ layoutMode: 'standard'; children?: React.ReactNode } & StandardLayoutProps)
  | ({ layoutMode: 'modern'; children?: React.ReactNode } & ModernLayoutProps);


export function AppLayout(props: AppLayoutProps) {
  if (props.layoutMode === 'modern') {
    return <ModernLayout {...props} />;
  }
  return <StandardLayout {...props} />;
}
