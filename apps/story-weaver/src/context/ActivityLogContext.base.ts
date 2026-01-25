import { createContext } from 'react';
import { ActivityLogContextType } from './ActivityLogContext.types';

export const ActivityLogContext = createContext<ActivityLogContextType | null>(null);
